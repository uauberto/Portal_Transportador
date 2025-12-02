import { NFe, NFeFilter } from '../types';
import { MOCK_NFES } from './mockData';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';

// ----------------------------------------------------------------
// NOTA SOBRE INTEGRAÇÃO SQL (POSTGRESQL)
// ----------------------------------------------------------------
// Em um ambiente de produção, esta função executaria uma query SQL.

export const getNFes = async (carrierId: string, filters: NFeFilter): Promise<NFe[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = MOCK_NFES.filter(nfe => nfe.carrierId === carrierId);

      if (filters.issueDate) {
        data = data.filter(nfe => nfe.issuedAt.startsWith(filters.issueDate!));
      }

      if (filters.number) {
        data = data.filter(nfe => nfe.number.includes(filters.number!));
      }

      if (filters.route) {
         data = data.filter(nfe => nfe.route.toLowerCase().includes(filters.route!.toLowerCase()));
      }

      data.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

      resolve(data);
    }, 600);
  });
};

export const generateZip = async (nfes: NFe[], carrierName: string): Promise<Blob> => {
    const zip = new JSZip();
    
    nfes.forEach(nfe => {
        const fileName = `NFe_${nfe.id}.xml`;
        zip.file(fileName, nfe.xmlContent);
    });

    return await zip.generateAsync({ type: 'blob' });
};

/**
 * Simulates the 'brazilfiscalreport.danfe.Danfe' class behavior in TypeScript.
 * Handles the deep extraction of XML fields and visual rendering using jsPDF.
 */
class Danfe {
    private xmlDoc: Document;

    constructor(xml: string) {
        const parser = new DOMParser();
        this.xmlDoc = parser.parseFromString(xml, "text/xml");
    }

    // Helper to find a direct child by localName (ignores namespace prefix issues)
    private getChild(parent: Element | null, tagName: string): Element | null {
        if (!parent) return null;
        for (let i = 0; i < parent.children.length; i++) {
            if (parent.children[i].localName === tagName) return parent.children[i];
        }
        return null;
    }

    // Helper to find a descendant by localName (mimics .//tag)
    private getDescendant(parent: Element | Document, tagName: string): Element | null {
        const list = parent.getElementsByTagName("*");
        for (let i = 0; i < list.length; i++) {
            if (list[i].localName === tagName) return list[i];
        }
        return null;
    }

    private getText(parent: Element | null, tagName: string): string {
        const node = this.getChild(parent, tagName);
        return node ? node.textContent?.trim() || "" : "";
    }

    private fmtMoney(val: string): string {
        const num = parseFloat(val);
        if (isNaN(num)) return "0,00";
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    private fmtDate(val: string): string {
        if (!val) return "";
        // Try ISO
        let date = new Date(val);
        if (!isNaN(date.getTime())) return date.toLocaleDateString('pt-BR');
        // Try YYYY-MM-DD
        const parts = val.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return val;
    }

    private fmtTime(val: string): string {
        if (!val) return "";
        let date = new Date(val);
        if (!isNaN(date.getTime())) return date.toLocaleTimeString('pt-BR').substring(0, 5);
        return "";
    }

    private fmtChave(key: string): string {
        return key.replace(/(\d{4})/g, '$1 ').trim();
    }

    public output(filename: string) {
        const doc = new jsPDF('p', 'mm', 'a4');
        const root = this.xmlDoc.documentElement;

        // --- 1. ROBUST PARSING (Extracting all fields) ---
        const infNFe = this.getDescendant(root, "infNFe");
        if (!infNFe) {
            console.error("TAG infNFe não encontrada no XML");
            alert("Erro: XML inválido ou mal formatado.");
            return;
        }

        // IDE
        const ide = this.getChild(infNFe, "ide");
        const nNF = this.getText(ide, "nNF");
        const serie = this.getText(ide, "serie");
        const natOp = this.getText(ide, "natOp");
        const tpNF = this.getText(ide, "tpNF");
        const dhEmi = this.getText(ide, "dhEmi");
        const dhSaiEnt = this.getText(ide, "dhSaiEnt");
        const idDest = this.getText(ide, "idDest"); // 1=Interna, 2=Interestadual, 3=Exterior

        // EMITENTE
        const emit = this.getChild(infNFe, "emit");
        const emitNome = this.getText(emit, "xNome");
        const emitFant = this.getText(emit, "xFant");
        const emitCNPJ = this.getText(emit, "CNPJ");
        const emitIE = this.getText(emit, "IE");
        const emitIEST = this.getText(emit, "IEST");
        const enderEmit = this.getChild(emit, "enderEmit");
        const emitEnd = `${this.getText(enderEmit, "xLgr")}, ${this.getText(enderEmit, "nro")} ${this.getText(enderEmit, "xCpl")}`;
        const emitBairro = this.getText(enderEmit, "xBairro");
        const emitMun = this.getText(enderEmit, "xMun");
        const emitUF = this.getText(enderEmit, "UF");
        const emitCEP = this.getText(enderEmit, "CEP");
        const emitFone = this.getText(enderEmit, "fone");

        // DESTINATARIO
        const dest = this.getChild(infNFe, "dest");
        const destNome = this.getText(dest, "xNome");
        const destCNPJ = this.getText(dest, "CNPJ") || this.getText(dest, "CPF");
        const destIE = this.getText(dest, "IE");
        const enderDest = this.getChild(dest, "enderDest");
        const destEnd = `${this.getText(enderDest, "xLgr")}, ${this.getText(enderDest, "nro")} ${this.getText(enderDest, "xCpl")}`;
        const destBairro = this.getText(enderDest, "xBairro");
        const destMun = this.getText(enderDest, "xMun");
        const destUF = this.getText(enderDest, "UF");
        const destCEP = this.getText(enderDest, "CEP");
        const destFone = this.getText(enderDest, "fone");

        // TOTAIS
        const total = this.getChild(infNFe, "total");
        const ICMSTot = this.getChild(total, "ICMSTot");
        const vBC = this.getText(ICMSTot, "vBC");
        const vICMS = this.getText(ICMSTot, "vICMS");
        const vBCST = this.getText(ICMSTot, "vBCST");
        const vST = this.getText(ICMSTot, "vST");
        const vProd = this.getText(ICMSTot, "vProd");
        const vFrete = this.getText(ICMSTot, "vFrete");
        const vSeg = this.getText(ICMSTot, "vSeg");
        const vDesc = this.getText(ICMSTot, "vDesc");
        const vIPI = this.getText(ICMSTot, "vIPI");
        const vPIS = this.getText(ICMSTot, "vPIS");
        const vCOFINS = this.getText(ICMSTot, "vCOFINS");
        const vOutro = this.getText(ICMSTot, "vOutro");
        const vNF = this.getText(ICMSTot, "vNF");

        // TRANSPORTADORA
        const transp = this.getChild(infNFe, "transp");
        const modFrete = this.getText(transp, "modFrete");
        const transporta = this.getChild(transp, "transporta");
        const transNome = this.getText(transporta, "xNome");
        const transCNPJ = this.getText(transporta, "CNPJ") || this.getText(transporta, "CPF");
        const transIE = this.getText(transporta, "IE");
        const transEnder = this.getText(transporta, "xEnder");
        const transMun = this.getText(transporta, "xMun");
        const transUF = this.getText(transporta, "UF");
        const vol = this.getChild(transp, "vol");
        const qVol = this.getText(vol, "qVol");
        const esp = this.getText(vol, "esp");
        const marca = this.getText(vol, "marca");
        const pesoL = this.getText(vol, "pesoL");
        const pesoB = this.getText(vol, "pesoB");

        // INFADIC
        const infAdic = this.getChild(infNFe, "infAdic");
        const infCpl = this.getText(infAdic, "infCpl");
        const infAdFisco = this.getText(infAdic, "infAdFisco");

        // PROTOCOLO & CHAVE
        const chave = infNFe.getAttribute("Id")?.replace("NFe", "") || "";
        const protNFe = this.getDescendant(root, "protNFe");
        const infProt = this.getChild(protNFe, "infProt");
        const nProt = this.getText(infProt, "nProt");
        const dhRecbto = this.getText(infProt, "dhRecbto");

        // --- 2. DRAWING LOGIC (Visual DANFE Structure) ---
        const margin = 7; 
        const pageWidth = 210;
        const contentWidth = pageWidth - (margin * 2);
        
        let currentY = margin;

        const drawBox = (x: number, y: number, w: number, h: number, label: string, value: string, align: 'left' | 'center' | 'right' = 'left') => {
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            doc.rect(x, y, w, h);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(5);
            doc.text(label.toUpperCase(), x + 1, y + 2);
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            
            let text = String(value);
            // Simple truncation
            if (doc.getTextWidth(text) > w - 2) {
                const maxChars = Math.floor((w - 2) / 1.5);
                text = text.substring(0, maxChars);
            }

            let tx = x + 1;
            if (align === 'center') tx = x + w / 2;
            if (align === 'right') tx = x + w - 1;
            
            doc.text(text, tx, y + h - 2, { align });
        };

        const sectionHeader = (y: number, text: string) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6);
            doc.text(text, margin, y - 0.5);
        };

        // 1. CANHOTO
        doc.rect(margin, currentY, contentWidth, 18);
        doc.line(margin + 40, currentY, margin + 40, currentY + 18);
        doc.line(margin + 130, currentY, margin + 130, currentY + 18);
        doc.setFontSize(5); doc.setFont("helvetica", "normal");
        doc.text("RECEBEMOS DE " + emitNome.substring(0, 40), margin + 1, currentY + 3);
        doc.text("OS PRODUTOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO", margin + 1, currentY + 8);
        doc.text("DATA DE RECEBIMENTO", margin + 41, currentY + 3);
        doc.text("IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR", margin + 131, currentY + 3);
        
        doc.setFontSize(10); doc.setFont("helvetica", "bold");
        doc.text("NF-e", margin + contentWidth - 10, currentY + 8, {align:'center'});
        doc.text("Nº " + nNF, margin + contentWidth - 10, currentY + 13, {align:'center'});
        doc.text("SÉRIE " + serie, margin + contentWidth - 10, currentY + 17, {align:'center'});
        currentY += 20;

        // 2. HEADER EMITENTE
        const hHeader = 32;
        doc.rect(margin, currentY, 80, hHeader);
        // Logo or Text
        doc.setFontSize(10); doc.setFont("helvetica", "bold");
        doc.text(emitNome.substring(0, 35), margin + 40, currentY + 6, {align:'center'});
        doc.setFontSize(6); doc.setFont("helvetica", "normal");
        doc.text(emitEnd.substring(0, 50), margin + 40, currentY + 12, {align:'center'});
        doc.text(`${emitBairro} - ${emitMun} / ${emitUF}`, margin + 40, currentY + 16, {align:'center'});
        doc.text(`CEP: ${emitCEP} - Fone: ${emitFone}`, margin + 40, currentY + 20, {align:'center'});

        // DANFE BLOCK
        doc.rect(margin + 82, currentY, 30, hHeader);
        doc.setFontSize(14); doc.setFont("helvetica", "bold");
        doc.text("DANFE", margin + 97, currentY + 6, {align:'center'});
        doc.setFontSize(6); doc.setFont("helvetica", "normal");
        doc.text("Documento Auxiliar", margin + 97, currentY + 9, {align:'center'});
        doc.text("da Nota Fiscal", margin + 97, currentY + 12, {align:'center'});
        doc.text("Eletrônica", margin + 97, currentY + 15, {align:'center'});
        
        doc.text("0 - Entrada", margin + 85, currentY + 20);
        doc.text("1 - Saída", margin + 85, currentY + 23);
        doc.rect(margin + 102, currentY + 18, 8, 6);
        doc.setFontSize(10); doc.setFont("helvetica", "bold");
        doc.text(tpNF, margin + 106, currentY + 22.5, {align:'center'});
        
        doc.setFontSize(8);
        doc.text(`Nº ${nNF}`, margin + 97, currentY + 28, {align:'center'});
        doc.text(`SÉRIE ${serie}`, margin + 97, currentY + 31, {align:'center'});

        // BARCODE & KEY
        doc.rect(margin + 114, currentY, 82, hHeader);
        if (chave) {
            try {
                const cvs = document.createElement('canvas');
                JsBarcode(cvs, chave, { format: "CODE128", displayValue: false, margin:0, height: 30, width: 1 });
                doc.addImage(cvs.toDataURL("image/png"), "PNG", margin + 116, currentY + 2, 78, 12);
            } catch {}
        }
        doc.setFontSize(6); doc.setFont("helvetica", "normal");
        doc.text("CHAVE DE ACESSO", margin + 116, currentY + 17);
        doc.setFontSize(8); doc.setFont("helvetica", "bold");
        doc.text(this.fmtChave(chave), margin + 116, currentY + 21);

        doc.setFontSize(7); doc.setFont("helvetica", "normal");
        doc.text("Consulta de autenticidade no portal nacional da NF-e", margin + 155, currentY + 26, {align:'center'});
        doc.text("www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora", margin + 155, currentY + 30, {align:'center'});
        
        currentY += hHeader + 2;

        // NATUREZA
        drawBox(margin, currentY, 112, 8, "NATUREZA DA OPERAÇÃO", natOp);
        drawBox(margin + 112, currentY, 84, 8, "PROTOCOLO DE AUTORIZAÇÃO DE USO", `${nProt} - ${this.fmtDate(dhRecbto)} ${this.fmtTime(dhRecbto)}`, 'center');
        currentY += 8;
        drawBox(margin, currentY, 65, 8, "INSCRIÇÃO ESTADUAL", emitIE);
        drawBox(margin + 65, currentY, 65, 8, "INSC. ESTADUAL DO SUBST. TRIB.", emitIEST);
        drawBox(margin + 130, currentY, 66, 8, "CNPJ", emitCNPJ);
        currentY += 10;

        // DESTINATARIO
        sectionHeader(currentY, "DESTINATÁRIO / REMETENTE");
        drawBox(margin, currentY, 110, 8, "NOME / RAZÃO SOCIAL", destNome);
        drawBox(margin + 110, currentY, 35, 8, "CNPJ / CPF", destCNPJ);
        drawBox(margin + 145, currentY, 25, 8, "DATA DA EMISSÃO", this.fmtDate(dhEmi), 'center');
        drawBox(margin + 170, currentY, 26, 8, "DATA SAÍDA/ENTRADA", this.fmtDate(dhSaiEnt), 'center');
        currentY += 8;
        drawBox(margin, currentY, 90, 8, "ENDEREÇO", destEnd);
        drawBox(margin + 90, currentY, 40, 8, "BAIRRO / DISTRITO", destBairro);
        drawBox(margin + 130, currentY, 20, 8, "CEP", destCEP);
        drawBox(margin + 150, currentY, 46, 8, "FONE / FAX", destFone);
        currentY += 8;
        drawBox(margin, currentY, 90, 8, "MUNICÍPIO", destMun);
        drawBox(margin + 90, currentY, 10, 8, "UF", destUF, 'center');
        drawBox(margin + 100, currentY, 40, 8, "INSCRIÇÃO ESTADUAL", destIE);
        drawBox(margin + 140, currentY, 56, 8, "HORA DA SAÍDA", this.fmtTime(dhSaiEnt), 'center');
        currentY += 10;

        // IMPOSTOS
        sectionHeader(currentY, "CÁLCULO DO IMPOSTO");
        const cw = contentWidth / 10;
        drawBox(margin, currentY, cw, 9, "BASE CÁLC. ICMS", this.fmtMoney(vBC), 'right');
        drawBox(margin + cw, currentY, cw, 9, "VALOR DO ICMS", this.fmtMoney(vICMS), 'right');
        drawBox(margin + cw*2, currentY, cw, 9, "BASE CÁLC. ST", this.fmtMoney(vBCST), 'right');
        drawBox(margin + cw*3, currentY, cw, 9, "VALOR ICMS ST", this.fmtMoney(vST), 'right');
        drawBox(margin + cw*4, currentY, cw, 9, "V. IMP. IMPORT.", "0,00", 'right'); // Not extracted, usually 0
        drawBox(margin + cw*5, currentY, cw, 9, "V. ICMS UF REM.", "0,00", 'right');
        drawBox(margin + cw*6, currentY, cw, 9, "VALOR DO FCP", "0,00", 'right');
        drawBox(margin + cw*7, currentY, cw, 9, "VALOR DO PIS", this.fmtMoney(vPIS), 'right');
        drawBox(margin + cw*8, currentY, cw, 9, "VALOR TOTAL PROD", this.fmtMoney(vProd), 'right');
        drawBox(margin + cw*9, currentY, cw, 9, "V. TOTAL DA NOTA", this.fmtMoney(vNF), 'right');
        currentY += 9;
        drawBox(margin, currentY, cw, 9, "VALOR DO FRETE", this.fmtMoney(vFrete), 'right');
        drawBox(margin + cw, currentY, cw, 9, "VALOR DO SEGURO", this.fmtMoney(vSeg), 'right');
        drawBox(margin + cw*2, currentY, cw, 9, "DESCONTO", this.fmtMoney(vDesc), 'right');
        drawBox(margin + cw*3, currentY, cw, 9, "OUTRAS DESP", this.fmtMoney(vOutro), 'right');
        drawBox(margin + cw*4, currentY, cw, 9, "VALOR DO IPI", this.fmtMoney(vIPI), 'right');
        drawBox(margin + cw*5, currentY, cw, 9, "V. COFINS", this.fmtMoney(vCOFINS), 'right');
        // Filler
        doc.rect(margin + cw*6, currentY, cw*4, 9);
        currentY += 12;

        // TRANSPORTADOR
        sectionHeader(currentY, "TRANSPORTADOR / VOLUMES TRANSPORTADOS");
        drawBox(margin, currentY, 100, 8, "RAZÃO SOCIAL", transNome);
        drawBox(margin + 100, currentY, 20, 8, "FRETE POR CONTA", modFrete, 'center');
        drawBox(margin + 120, currentY, 20, 8, "CÓDIGO ANTT", "", 'center');
        drawBox(margin + 140, currentY, 20, 8, "PLACA VEÍCULO", "", 'center');
        drawBox(margin + 160, currentY, 10, 8, "UF", "", 'center');
        drawBox(margin + 170, currentY, 26, 8, "CNPJ/CPF", transCNPJ);
        currentY += 8;
        drawBox(margin, currentY, 100, 8, "ENDEREÇO", transEnder);
        drawBox(margin + 100, currentY, 60, 8, "MUNICÍPIO", transMun);
        drawBox(margin + 160, currentY, 10, 8, "UF", transUF, 'center');
        drawBox(margin + 170, currentY, 26, 8, "INSCRIÇÃO ESTADUAL", transIE);
        currentY += 8;
        drawBox(margin, currentY, 20, 8, "QUANTIDADE", qVol, 'center');
        drawBox(margin + 20, currentY, 40, 8, "ESPÉCIE", esp);
        drawBox(margin + 60, currentY, 40, 8, "MARCA", marca);
        drawBox(margin + 100, currentY, 40, 8, "NUMERAÇÃO", "", 'center');
        drawBox(margin + 140, currentY, 28, 8, "PESO BRUTO", pesoB, 'right');
        drawBox(margin + 168, currentY, 28, 8, "PESO LÍQUIDO", pesoL, 'right');
        currentY += 11;

        // ITEMS
        sectionHeader(currentY, "DADOS DO PRODUTO / SERVIÇO");
        const cols = [
            { t:"CÓDIGO", w:20, a:'left' },
            { t:"DESCRIÇÃO", w:60, a:'left' },
            { t:"NCM/SH", w:15, a:'center' },
            { t:"CST", w:10, a:'center' },
            { t:"CFOP", w:10, a:'center' },
            { t:"UNID", w:10, a:'center' },
            { t:"QTD", w:15, a:'right' },
            { t:"V.UNIT", w:15, a:'right' },
            { t:"V.TOTAL", w:15, a:'right' },
            { t:"BC.ICMS", w:15, a:'right' },
            { t:"V.ICMS", w:11, a:'right' },
            // { t:"V.IPI", w:10, a:'right' },
            // { t:"ALIQ.ICMS", w:8, a:'right' },
            // { t:"ALIQ.IPI", w:8, a:'right' }
        ];
        
        doc.rect(margin, currentY, contentWidth, 5);
        let tx = margin;
        doc.setFontSize(5); doc.setFont("helvetica", "normal");
        cols.forEach((c, i) => {
            doc.text(c.t, tx+1, currentY+3.5);
            if (i > 0) doc.line(tx, currentY, tx, currentY+5);
            tx += c.w;
        });
        currentY += 5;

        // Loop Items
        // Robust way to find 'det' regardless of namespace
        const items = [];
        for (let i = 0; i < infNFe.children.length; i++) {
            if (infNFe.children[i].localName === 'det') items.push(infNFe.children[i]);
        }

        const rowH = 6;
        // Limit items to fit page for simplicity in this demo
        const maxItems = Math.floor((270 - currentY - 25) / rowH); 

        items.slice(0, maxItems).forEach((det, idx) => {
            const prod = this.getChild(det, "prod");
            const imp = this.getChild(det, "imposto");
            if (!prod) return;

            // CST Extraction logic (ICMS00, ICMS60, etc...)
            let cst = "";
            let vBcIcmsItem = "0,00";
            let vIcmsItem = "0,00";

            if (imp) {
                const icmsContainer = this.getChild(imp, "ICMS");
                if (icmsContainer && icmsContainer.children.length > 0) {
                    const icmsInner = icmsContainer.children[0]; // ICMS00, ICMS60...
                    cst = this.getText(icmsInner, "CST") || this.getText(icmsInner, "CSOSN");
                    vBcIcmsItem = this.fmtMoney(this.getText(icmsInner, "vBC"));
                    vIcmsItem = this.fmtMoney(this.getText(icmsInner, "vICMS"));
                }
            }

            const rowData = [
                this.getText(prod, "cProd"),
                this.getText(prod, "xProd"),
                this.getText(prod, "NCM"),
                cst,
                this.getText(prod, "CFOP"),
                this.getText(prod, "uCom"),
                parseFloat(this.getText(prod, "qCom")).toFixed(2), // Qtd
                this.fmtMoney(this.getText(prod, "vUnCom")),
                this.fmtMoney(this.getText(prod, "vProd")),
                vBcIcmsItem,
                vIcmsItem
            ];

            doc.rect(margin, currentY, contentWidth, rowH);
            let x = margin;
            rowData.forEach((txt, i) => {
                let align = cols[i].a as 'left'|'center'|'right';
                let txtX = x + 1;
                if (align === 'center') txtX = x + cols[i].w / 2;
                if (align === 'right') txtX = x + cols[i].w - 1;
                
                doc.setFontSize(5);
                // Truncate
                if (doc.getTextWidth(txt) > cols[i].w - 1) {
                    txt = txt.substring(0, Math.floor((cols[i].w - 1) / 1.5)) + "..";
                }
                
                doc.text(txt, txtX, currentY + 4, { align });
                if (i > 0) doc.line(x, currentY, x, currentY + rowH);
                x += cols[i].w;
            });
            currentY += rowH;
        });

        // Fill remaining space if any
        const remaining = 270 - 25 - currentY;
        if (remaining > 0) {
            doc.rect(margin, currentY, contentWidth, remaining);
             let x = margin;
             cols.forEach((c, i) => {
                if (i > 0) doc.line(x, currentY, x, currentY + remaining);
                x += c.w;
             });
            currentY += remaining;
        }

        // DADOS ADICIONAIS
        currentY = 270 - 25;
        sectionHeader(currentY, "DADOS ADICIONAIS");
        doc.rect(margin, currentY, 130, 25);
        doc.setFontSize(5); doc.setFont("helvetica", "normal");
        doc.text("INFORMAÇÕES COMPLEMENTARES", margin + 1, currentY + 3);
        
        const fullAdic = `${infCpl} ${infAdFisco}`.trim();
        const splitAdic = doc.splitTextToSize(fullAdic, 128);
        doc.text(splitAdic, margin + 1, currentY + 6);

        doc.rect(margin + 132, currentY, 64, 25);
        doc.text("RESERVADO AO FISCO", margin + 133, currentY + 3);

        doc.save(filename);
    }
}

/**
 * Implementation of the specific script logic requested.
 * Parsing logic strictly follows the python ElementTree flow structure provided.
 */
export const downloadDanfePdf = async (xmlContent: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            // Logic mimicking: import xml.etree.ElementTree as ET
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
            const root = xmlDoc.documentElement;

            // Logic mimicking:
            // if root.tag.startswith("{"): ns_uri = ... else: ns_uri = ...
            let nsUri = "http://www.portalfiscal.inf.br/nfe";
            if (root.namespaceURI) {
                nsUri = root.namespaceURI;
            }
            // ns = {"nfe": ns_uri}

            // Logic mimicking: ide = root.find(".//nfe:ide", ns)
            // Implementation: Searching for 'ide' in descendants with Namespace check
            let ide: Element | null = null;
            const descendants = root.getElementsByTagName("*");
            for(let i=0; i<descendants.length; i++) {
                if (descendants[i].localName === 'ide' && descendants[i].namespaceURI === nsUri) {
                    ide = descendants[i];
                    break;
                }
            }
            // Fallback if not found with strict NS (sometimes browser parser is quirky with generated XML strings)
            if (!ide) {
                for(let i=0; i<descendants.length; i++) {
                     if (descendants[i].localName === 'ide') {
                        ide = descendants[i];
                        break;
                     }
                }
            }

            let nNF = "SEM_NUMERO";

            if (ide) {
                // Logic mimicking: nNF_elem = ide.find("nNF")  (Direct child, no NS implied in Python if not specified or default)
                let nNF_elem: Element | null = null;
                for (let i = 0; i < ide.children.length; i++) {
                    // Check localName matching 'nNF'
                    if (ide.children[i].localName === 'nNF') {
                        nNF_elem = ide.children[i];
                        break;
                    }
                }

                if (nNF_elem && nNF_elem.textContent) {
                    nNF = nNF_elem.textContent.trim();
                }
            }

            // Logic mimicking: infNFe = root.find(".//nfe:infNFe", ns)
            // Logic mimicking: chave = infNFe.attrib.get("Id", "").replace("NFe", "").strip()
            let infNFe: Element | null = null;
            for(let i=0; i<descendants.length; i++) {
                if (descendants[i].localName === 'infNFe') {
                    infNFe = descendants[i];
                    break;
                }
            }

            let chave = "";
            if (infNFe) {
                const idAttr = infNFe.getAttribute("Id") || "";
                chave = idAttr.replace("NFe", "").trim();
            }

            // Logic mimicking: if nNF == "SEM_NUMERO" and chave: nNF = chave
            if (nNF === "SEM_NUMERO" && chave) {
                nNF = chave;
            }

            // Logic mimicking: output_filename = f"DANFE_{nNF}.pdf"
            const outputFilename = `DANFE_${nNF}.pdf`;

            // Logic mimicking: danfe = Danfe(xml=xml_content)
            const danfe = new Danfe(xmlContent);
            
            // Logic mimicking: danfe.output(output_filename)
            danfe.output(outputFilename);
            
            // Logic mimicking: print("Gerado:", output_filename)
            console.log("Gerado:", outputFilename);

            resolve();
        } catch (e) {
            reject(e);
        }
    });
}
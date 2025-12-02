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
 * Helper para extrair valor de tag XML ignorando namespace
 */
const getTagValue = (doc: Document, tagName: string, parent?: Element): string => {
  const context = parent || doc;
  // Tenta encontrar com namespace (padrão nfe) ou sem
  const elements = context.getElementsByTagName(tagName);
  if (elements.length > 0) return elements[0].textContent || '';
  
  const elementsNS = context.getElementsByTagName("nfe:" + tagName);
  if (elementsNS.length > 0) return elementsNS[0].textContent || '';
  
  return '';
};

/**
 * Gera e baixa o PDF da DANFE utilizando jsPDF.
 * Implementação manual para garantir compatibilidade com navegador.
 */
export const downloadDanfePdf = async (xmlContent: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

            // Extração de Dados Principais
            const ide = xmlDoc.getElementsByTagName('ide')[0] || xmlDoc.getElementsByTagName('nfe:ide')[0];
            const emit = xmlDoc.getElementsByTagName('emit')[0] || xmlDoc.getElementsByTagName('nfe:emit')[0];
            const dest = xmlDoc.getElementsByTagName('dest')[0] || xmlDoc.getElementsByTagName('nfe:dest')[0];
            const infNFe = xmlDoc.getElementsByTagName('infNFe')[0] || xmlDoc.getElementsByTagName('nfe:infNFe')[0];
            const total = xmlDoc.getElementsByTagName('total')[0] || xmlDoc.getElementsByTagName('nfe:total')[0];
            
            const nNF = getTagValue(xmlDoc, 'nNF', ide) || "000000";
            const serie = getTagValue(xmlDoc, 'serie', ide) || "0";
            const chNFe = infNFe?.getAttribute('Id')?.replace('NFe', '') || '';
            const natOp = getTagValue(xmlDoc, 'natOp', ide);
            const dhEmi = getTagValue(xmlDoc, 'dhEmi', ide);
            
            // Dados Emitente
            const emitNome = getTagValue(xmlDoc, 'xNome', emit);
            const emitCNPJ = getTagValue(xmlDoc, 'CNPJ', emit);
            const emitIE = getTagValue(xmlDoc, 'IE', emit);
            const emitLgr = getTagValue(xmlDoc, 'xLgr', emit);
            const emitNro = getTagValue(xmlDoc, 'nro', emit);
            const emitBairro = getTagValue(xmlDoc, 'xBairro', emit);
            const emitMun = getTagValue(xmlDoc, 'xMun', emit);
            const emitUF = getTagValue(xmlDoc, 'UF', emit);
            const emitFone = getTagValue(xmlDoc, 'fone', emit);

            // Dados Destinatário
            const destNome = getTagValue(xmlDoc, 'xNome', dest);
            const destCNPJ = getTagValue(xmlDoc, 'CNPJ', dest);
            const destLgr = getTagValue(xmlDoc, 'xLgr', dest);
            const destNro = getTagValue(xmlDoc, 'nro', dest);
            const destBairro = getTagValue(xmlDoc, 'xBairro', dest);
            const destMun = getTagValue(xmlDoc, 'xMun', dest);
            const destUF = getTagValue(xmlDoc, 'UF', dest);

            // Totais
            const vProd = getTagValue(xmlDoc, 'vProd', total);
            const vNF = getTagValue(xmlDoc, 'vNF', total);
            const vBC = getTagValue(xmlDoc, 'vBC', total);
            const vICMS = getTagValue(xmlDoc, 'vICMS', total);

            // Configuração do PDF (A4 Portrait)
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const margin = 10;
            const contentWidth = pageWidth - (margin * 2);
            let y = 10;

            // Função helper para desenhar caixas
            const drawBox = (x: number, y: number, w: number, h: number, label: string, value: string = '', boldValue: boolean = true) => {
                doc.setLineWidth(0.2);
                doc.rect(x, y, w, h);
                doc.setFontSize(6);
                doc.setFont("helvetica", "normal");
                doc.text(label.toUpperCase(), x + 1, y + 3);
                if (value) {
                    doc.setFontSize(8);
                    if (boldValue) doc.setFont("helvetica", "bold");
                    // Truncate text if too long
                    const textWidth = doc.getTextWidth(value);
                    if (textWidth > w - 2) {
                         doc.text(value, x + 1, y + 8, { maxWidth: w - 2 });
                    } else {
                         doc.text(value, x + 1, y + 8);
                    }
                }
            };

            // --- CANHOTO ---
            doc.rect(margin, y, contentWidth, 18);
            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            doc.text("RECEBEMOS DE " + emitNome.substring(0, 50) + " OS PRODUTOS/SERVIÇOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO", margin + 2, y + 4);
            
            doc.line(margin + 35, y + 9, margin + 35, y + 18); // Separa Data
            doc.text("DATA DE RECEBIMENTO", margin + 2, y + 11);
            
            doc.line(margin + 130, y, margin + 130, y + 18); // Separa Assinatura
            doc.text("IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR", margin + 37, y + 11);

            doc.line(margin + 170, y, margin + 170, y + 18); // Separa NF-e
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("NF-e", margin + 180, y + 8, { align: 'center' });
            doc.text(`Nº ${nNF}`, margin + 180, y + 13, { align: 'center' });
            doc.text(`SÉRIE ${serie}`, margin + 180, y + 17, { align: 'center' });

            y += 22; // Espaço após canhoto

            // --- CABEÇALHO ---
            // Logo Placeholder / Emitente
            doc.rect(margin, y, 90, 32);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(emitNome, margin + 2, y + 5);
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.text(emitLgr + ", " + emitNro, margin + 2, y + 10);
            doc.text(emitBairro + " - " + emitMun + " / " + emitUF, margin + 2, y + 14);
            doc.text("Fone: " + emitFone, margin + 2, y + 18);

            // DANFE Label
            doc.rect(margin + 90, y, 35, 32);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("DANFE", margin + 107.5, y + 6, { align: 'center' });
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.text("Documento Auxiliar da", margin + 107.5, y + 10, { align: 'center' });
            doc.text("Nota Fiscal Eletrônica", margin + 107.5, y + 13, { align: 'center' });
            
            doc.setFontSize(8);
            doc.text("0 - Entrada", margin + 98, y + 20);
            doc.text("1 - Saída", margin + 98, y + 23);
            doc.rect(margin + 115, y + 18, 6, 6);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("1", margin + 118, y + 22.5, { align: 'center' }); // Fixo Saída para exemplo

            doc.setFontSize(8);
            doc.text(`Nº ${nNF}`, margin + 107.5, y + 28, { align: 'center' });
            doc.text(`SÉRIE ${serie}`, margin + 107.5, y + 31, { align: 'center' });

            // Barcode area
            doc.rect(margin + 125, y, 65, 32);
            if (chNFe) {
                try {
                    const canvas = document.createElement('canvas');
                    JsBarcode(canvas, chNFe, {
                        format: "CODE128",
                        displayValue: false,
                        margin: 0,
                        height: 50
                    });
                    const barcodeData = canvas.toDataURL("image/png");
                    doc.addImage(barcodeData, 'PNG', margin + 127, y + 2, 61, 12);
                } catch(e) {
                    console.error("Erro barcode", e);
                }
            }
            
            // Chave de Acesso
            doc.rect(margin + 125, y + 16, 65, 16);
            doc.setFontSize(6);
            doc.text("CHAVE DE ACESSO", margin + 127, y + 19);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            // Formata chave em grupos de 4
            const formattedKey = chNFe.replace(/(.{4})/g, '$1 ').trim();
            doc.text(formattedKey, margin + 127, y + 24);

            y += 34;

            // Natureza da Operação
            drawBox(margin, y, 120, 8, "NATUREZA DA OPERAÇÃO", natOp);
            drawBox(margin + 120, y, 70, 8, "PROTOCOLO DE AUTORIZAÇÃO DE USO", "131234567890123 - " + new Date().toLocaleDateString()); // Mock Protocol
            
            y += 10;

            // Inscricoes
            drawBox(margin, y, 70, 8, "INSCRIÇÃO ESTADUAL", emitIE);
            drawBox(margin + 70, y, 60, 8, "INSCRIÇÃO ESTADUAL DO SUBST. TRIB.", "");
            drawBox(margin + 130, y, 60, 8, "CNPJ", emitCNPJ);

            y += 10;

            // --- DESTINATÁRIO / REMETENTE ---
            doc.setFillColor(230, 230, 230);
            doc.rect(margin, y, contentWidth, 5, 'F');
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.text("DESTINATÁRIO / REMETENTE", margin + 2, y + 3.5);
            y += 5;

            drawBox(margin, y, 110, 8, "NOME / RAZÃO SOCIAL", destNome);
            drawBox(margin + 110, y, 40, 8, "CNPJ / CPF", destCNPJ);
            drawBox(margin + 150, y, 40, 8, "DATA DA EMISSÃO", dhEmi?.split('T')[0]);
            y += 8;

            drawBox(margin, y, 90, 8, "ENDEREÇO", destLgr + ", " + destNro);
            drawBox(margin + 90, y, 40, 8, "BAIRRO / DISTRITO", destBairro);
            drawBox(margin + 130, y, 15, 8, "CEP", "");
            drawBox(margin + 145, y, 45, 8, "DATA DA SAÍDA/ENTRADA", dhEmi?.split('T')[0]);
            y += 8;

            drawBox(margin, y, 60, 8, "MUNICÍPIO", destMun);
            drawBox(margin + 60, y, 10, 8, "UF", destUF);
            drawBox(margin + 70, y, 40, 8, "FONE / FAX", "");
            drawBox(margin + 110, y, 40, 8, "INSCRIÇÃO ESTADUAL", "");
            drawBox(margin + 150, y, 40, 8, "HORA DA SAÍDA", "12:00:00");
            y += 10;

            // --- CÁLCULO DO IMPOSTO ---
            doc.setFillColor(230, 230, 230);
            doc.rect(margin, y, contentWidth, 5, 'F');
            doc.text("CÁLCULO DO IMPOSTO", margin + 2, y + 3.5);
            y += 5;

            const wCol = contentWidth / 8;
            drawBox(margin, y, wCol, 8, "BASE DE CÁLC. DO ICMS", vBC);
            drawBox(margin + wCol, y, wCol, 8, "VALOR DO ICMS", vICMS);
            drawBox(margin + wCol*2, y, wCol, 8, "BASE CÁLC. ICMS ST", "0,00");
            drawBox(margin + wCol*3, y, wCol, 8, "VALOR DO ICMS ST", "0,00");
            drawBox(margin + wCol*4, y, wCol, 8, "VALOR TOTAL PROD.", vProd);
            drawBox(margin + wCol*5, y, wCol, 8, "VALOR DO FRETE", "0,00");
            drawBox(margin + wCol*6, y, wCol, 8, "VALOR DO SEGURO", "0,00");
            drawBox(margin + wCol*7, y, wCol, 8, "DESCONTO", "0,00");
            y += 8;
            
            drawBox(margin, y, wCol, 8, "OUTRAS DESP. ACESS.", "0,00");
            drawBox(margin + wCol, y, wCol, 8, "VALOR DO IPI", "0,00");
            drawBox(margin + wCol*2, y, wCol*3, 8, "INFORMAÇÕES COMPLEMENTARES", ""); // Placeholder space
            drawBox(margin + wCol*5, y, wCol*3, 8, "VALOR TOTAL DA NOTA", vNF);
            y += 10;

            // --- DADOS DO PRODUTO / SERVIÇO ---
            doc.setFillColor(230, 230, 230);
            doc.rect(margin, y, contentWidth, 5, 'F');
            doc.text("DADOS DO PRODUTO / SERVIÇO", margin + 2, y + 3.5);
            y += 5;

            // Table Header
            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            const cols = [
                { name: "CÓDIGO", w: 20 },
                { name: "DESCRIÇÃO DO PRODUTO / SERVIÇO", w: 60 },
                { name: "NCM/SH", w: 15 },
                { name: "CST", w: 10 },
                { name: "CFOP", w: 10 },
                { name: "UNID", w: 10 },
                { name: "QTD.", w: 15 },
                { name: "V.UNIT.", w: 15 },
                { name: "V.TOTAL", w: 15 },
                { name: "BC.ICMS", w: 15 }
            ];
            
            let xOffset = margin;
            cols.forEach(col => {
                doc.rect(xOffset, y, col.w, 6);
                doc.text(col.name, xOffset + 1, y + 4);
                xOffset += col.w;
            });
            y += 6;

            // Itens
            const dets = xmlDoc.getElementsByTagName("det") || xmlDoc.getElementsByTagName("nfe:det");
            
            for (let i = 0; i < Math.min(dets.length, 12); i++) {
                const det = dets[i];
                const prod = det.getElementsByTagName("prod")[0] || det.getElementsByTagName("nfe:prod")[0];
                const imposto = det.getElementsByTagName("imposto")[0] || det.getElementsByTagName("nfe:imposto")[0];

                const cProd = getTagValue(xmlDoc, "cProd", prod);
                const xProd = getTagValue(xmlDoc, "xProd", prod);
                const NCM = getTagValue(xmlDoc, "NCM", prod);
                const CFOP = getTagValue(xmlDoc, "CFOP", prod);
                const uCom = getTagValue(xmlDoc, "uCom", prod);
                const qCom = getTagValue(xmlDoc, "qCom", prod);
                const vUnCom = getTagValue(xmlDoc, "vUnCom", prod);
                const vProdItem = getTagValue(xmlDoc, "vProd", prod);

                const rowH = 6;
                xOffset = margin;
                
                // Helper to draw cell
                const drawCell = (txt: string, w: number, align: 'left' | 'right' = 'left') => {
                    doc.rect(xOffset, y, w, rowH);
                    doc.text(txt.substring(0, 30), align === 'left' ? xOffset + 1 : xOffset + w - 1, y + 4, { align: align === 'right' ? 'right' : 'left' });
                    xOffset += w;
                };

                doc.setFontSize(7);
                drawCell(cProd, cols[0].w);
                drawCell(xProd, cols[1].w);
                drawCell(NCM, cols[2].w);
                drawCell("000", cols[3].w);
                drawCell(CFOP, cols[4].w);
                drawCell(uCom, cols[5].w);
                drawCell(Number(qCom).toFixed(2), cols[6].w, 'right');
                drawCell(Number(vUnCom).toFixed(2), cols[7].w, 'right');
                drawCell(Number(vProdItem).toFixed(2), cols[8].w, 'right');
                drawCell("0.00", cols[9].w, 'right');
                
                y += rowH;
            }

            // Footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(6);
            doc.text("Gerado via NFe-Portal-Secure - " + new Date().toLocaleString(), margin, pageHeight - 5);

            doc.save(`DANFE_${nNF}.pdf`);
            resolve();
        } catch (error) {
            console.error("Erro ao gerar DANFE:", error);
            reject(new Error("Falha ao processar o XML para geração da DANFE."));
        }
    });
}
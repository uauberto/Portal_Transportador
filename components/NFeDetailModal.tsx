import React, { useState } from 'react';
import { NFe } from '../types';
import { X, FileText, Download, Code } from 'lucide-react';
import { Button } from './ui/Button';
import { jsPDF } from 'jspdf';

interface Props {
  nfe: NFe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NFeDetailModal: React.FC<Props> = ({ nfe, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'xml'>('details');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !nfe) return null;

  const handleDownloadPDF = () => {
    if (nfe.pdfUrl) {
      window.open(nfe.pdfUrl, '_blank');
      return;
    }
    
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const width = 210;
      const margin = 10;
      const contentWidth = width - (margin * 2);

      // PARSER XML: Extrair dados reais do XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(nfe.xmlContent, "text/xml");

      const getValue = (node: Element | Document, tag: string) => {
        const el = node.getElementsByTagName(tag)[0];
        return el ? el.textContent || "" : "";
      }

      // Dados Emitente
      const emit = xmlDoc.getElementsByTagName("emit")[0];
      const emitNome = getValue(emit, "xNome") || nfe.senderName;
      const emitLgr = getValue(emit, "xLgr");
      const emitNro = getValue(emit, "nro");
      const emitBairro = getValue(emit, "xBairro");
      const emitMun = getValue(emit, "xMun");
      const emitUf = getValue(emit, "UF");
      const emitCep = getValue(emit, "CEP");
      const emitFone = getValue(emit, "fone");
      const emitIE = getValue(emit, "IE");

      // Dados Destinatário
      const dest = xmlDoc.getElementsByTagName("dest")[0];
      const destNome = getValue(dest, "xNome") || nfe.recipientName;
      const destLgr = getValue(dest, "xLgr");
      const destNro = getValue(dest, "nro");
      const destBairro = getValue(dest, "xBairro");
      const destMun = getValue(dest, "xMun");
      const destUf = getValue(dest, "UF");
      const destCep = getValue(dest, "CEP");
      const destFone = getValue(dest, "fone");
      const destIE = getValue(dest, "IE") || "ISENTO";

      // Dados Totais
      const total = xmlDoc.getElementsByTagName("ICMSTot")[0];
      const vBC = parseFloat(getValue(total, "vBC") || "0");
      const vICMS = parseFloat(getValue(total, "vICMS") || "0");
      const vBCST = parseFloat(getValue(total, "vBCST") || "0");
      const vST = parseFloat(getValue(total, "vST") || "0");
      const vProd = parseFloat(getValue(total, "vProd") || "0");
      const vFrete = parseFloat(getValue(total, "vFrete") || "0");
      const vSeg = parseFloat(getValue(total, "vSeg") || "0");
      const vDesc = parseFloat(getValue(total, "vDesc") || "0");
      const vIPI = parseFloat(getValue(total, "vIPI") || "0");
      const vOutro = parseFloat(getValue(total, "vOutro") || "0");
      const vNF = parseFloat(getValue(total, "vNF") || String(nfe.amount));

      // Transporte
      const transp = xmlDoc.getElementsByTagName("transp")[0];
      const transNome = getValue(transp, "xNome");
      const transCnpj = getValue(transp, "CNPJ");
      const transEnd = getValue(transp, "xEnder");
      const transMun = getValue(transp, "xMun");
      const transUf = getValue(transp, "UF");
      const transIE = getValue(transp, "IE");
      const vol = xmlDoc.getElementsByTagName("vol")[0];
      const qVol = getValue(vol, "qVol");
      const pesoB = getValue(vol, "pesoB");

      // Formatador monetário
      const fmtMoney = (val: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(val);

      // Helper para desenhar caixas
      const drawBox = (x: number, y: number, w: number, h: number, title: string, content: string | number, align: 'left' | 'center' | 'right' = 'left', fontSize: number = 8) => {
        doc.setDrawColor(0);
        doc.setLineWidth(0.1);
        doc.rect(x, y, w, h);
        
        doc.setFontSize(5);
        doc.setFont("helvetica", "normal");
        doc.text(title.toUpperCase(), x + 1, y + 2.5);

        doc.setFontSize(fontSize);
        doc.setFont("helvetica", "bold");
        
        let textX = x + 1;
        if (align === 'center') textX = x + (w / 2);
        if (align === 'right') textX = x + w - 1;

        const textStr = String(content || "");
        doc.text(textStr.substring(0, 50), textX, y + h - 2, { align });
      };

      let y = 10;

      // --- CANHOTO ---
      doc.rect(margin, y, contentWidth, 12);
      doc.line(margin + 40, y, margin + 40, y + 12);
      doc.line(margin + 130, y, margin + 130, y + 12);
      
      doc.setFontSize(6);
      doc.text("RECEBEMOS DE " + emitNome.substring(0, 30) + " OS PRODUTOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO", margin + 2, y + 4);
      doc.setFontSize(7);
      doc.text("DATA DE RECEBIMENTO", margin + 2, y + 10);
      doc.text("IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR", margin + 42, y + 10);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("NF-e", margin + 145, y + 5, { align: 'center' });
      doc.text(`Nº ${nfe.number}`, margin + 145, y + 9, { align: 'center' });
      doc.text(`SÉRIE ${nfe.series}`, margin + 145, y + 11.5, { align: 'center' });

      y += 16;

      // --- DADOS DO EMITENTE E TÍTULO DANFE ---
      doc.rect(margin, y, 60, 28); 
      doc.setFontSize(8);
      // Simples quebra de linha para endereço do emitente
      doc.text(emitNome.substring(0, 32), margin + 30, y + 5, { align: 'center' });
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.text(`${emitLgr}, ${emitNro}`, margin + 30, y + 10, {align: 'center'});
      doc.text(`${emitBairro} - ${emitMun}/${emitUf}`, margin + 30, y + 13, {align: 'center'});
      doc.text(`CEP: ${emitCep} - Fone: ${emitFone}`, margin + 30, y + 16, {align: 'center'});
      
      doc.rect(margin + 62, y, 35, 28);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("DANFE", margin + 79.5, y + 6, { align: "center" });
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.text("Documento Auxiliar da", margin + 79.5, y + 9, { align: "center" });
      doc.text("Nota Fiscal Eletrônica", margin + 79.5, y + 11.5, { align: "center" });
      
      doc.setFontSize(8);
      doc.text("0 - Entrada", margin + 65, y + 16);
      doc.text("1 - Saída", margin + 65, y + 19);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.rect(margin + 82, y + 15, 10, 5);
      doc.text("1", margin + 87, y + 19, { align: 'center' });
      
      doc.setFontSize(8);
      doc.text(`Nº ${nfe.number}`, margin + 79.5, y + 23, { align: "center" });
      doc.text(`SÉRIE ${nfe.series}`, margin + 79.5, y + 26, { align: "center" });

      doc.rect(margin + 99, y, 91, 14);
      doc.setFillColor(0, 0, 0);
      for(let i=0; i<40; i++) {
         const wBar = Math.random() * 2;
         const xBar = margin + 105 + (i * 2);
         doc.rect(xBar, y + 2, wBar, 10, 'F');
      }

      drawBox(margin + 99, y + 16, 91, 12, "Chave de Acesso", nfe.id, 'center', 9);

      y += 30;

      const natOp = getValue(xmlDoc, "natOp");
      const nProt = getValue(xmlDoc, "nProt");

      drawBox(margin, y, 120, 8, "Natureza da Operação", natOp, 'left');
      drawBox(margin + 120, y, 70, 8, "Protocolo de Autorização de Uso", `${nProt} - ${new Date(nfe.issuedAt).toLocaleDateString()}`, 'center');

      y += 10;

      // --- DESTINATÁRIO / REMETENTE ---
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("DESTINATÁRIO / REMETENTE", margin, y - 1);
      
      drawBox(margin, y, 110, 8, "Nome / Razão Social", destNome.substring(0, 55));
      drawBox(margin + 110, y, 35, 8, "CNPJ / CPF", nfe.recipientCnpj);
      drawBox(margin + 145, y, 45, 8, "Data da Emissão", new Date(nfe.issuedAt).toLocaleDateString(), 'center');
      y += 8;
      
      drawBox(margin, y, 90, 8, "Endereço", `${destLgr}, ${destNro} ${getValue(dest, "xCpl")}`, 'left');
      drawBox(margin + 90, y, 40, 8, "Bairro / Distrito", destBairro, 'left');
      drawBox(margin + 130, y, 15, 8, "CEP", destCep);
      drawBox(margin + 145, y, 45, 8, "Data Saída/Entrada", new Date(nfe.issuedAt).toLocaleDateString(), 'center');
      y += 8;

      drawBox(margin, y, 50, 8, "Município", destMun);
      drawBox(margin + 50, y, 10, 8, "UF", destUf, 'center');
      drawBox(margin + 60, y, 40, 8, "Fone / Fax", destFone);
      drawBox(margin + 100, y, 45, 8, "Inscrição Estadual", destIE);
      drawBox(margin + 145, y, 45, 8, "Hora Saída", new Date(nfe.issuedAt).toLocaleTimeString().substring(0,5), 'center');

      y += 12;

      // --- CÁLCULO DO IMPOSTO ---
      doc.setFontSize(7);
      doc.text("CÁLCULO DO IMPOSTO", margin, y - 1);

      const wImp = contentWidth / 8;
      
      drawBox(margin, y, wImp, 10, "Base de Cálc. do ICMS", fmtMoney(vBC), 'right');
      drawBox(margin + wImp, y, wImp, 10, "Valor do ICMS", fmtMoney(vICMS), 'right');
      drawBox(margin + wImp*2, y, wImp, 10, "Base Cálc. ICMS ST", fmtMoney(vBCST), 'right');
      drawBox(margin + wImp*3, y, wImp, 10, "Valor do ICMS ST", fmtMoney(vST), 'right');
      drawBox(margin + wImp*4, y, wImp/1.5, 10, "V. Tot. Prod", fmtMoney(vProd), 'right');
      drawBox(margin + wImp*4 + wImp/1.5, y, wImp, 10, "Valor Frete", fmtMoney(vFrete), 'right');
      drawBox(margin + wImp*5 + wImp/1.5, y, wImp/1.5, 10, "Seguro", fmtMoney(vSeg), 'right');
      drawBox(margin + wImp*6 + wImp/1.3, y, wImp/2, 10, "Desconto", fmtMoney(vDesc), 'right');
      
      const remainingW = contentWidth - (margin + wImp*6 + wImp/1.3 + wImp/2) + margin;
      drawBox(margin + contentWidth - 25, y, 25, 10, "Valor Total da Nota", fmtMoney(vNF), 'right');

      y += 14;

      // --- TRANSPORTADOR / VOLUMES ---
      doc.text("TRANSPORTADOR / VOLUMES TRANSPORTADOS", margin, y - 1);
      drawBox(margin, y, 80, 8, "Razão Social", transNome || "FRETE POR CONTA DO REMETENTE");
      drawBox(margin + 80, y, 20, 8, "Frete Por Conta", getValue(transp, "modFrete") || "0", 'center', 6);
      drawBox(margin + 100, y, 20, 8, "Código ANTT", "", 'center');
      drawBox(margin + 120, y, 25, 8, "Placa do Veículo", "", 'center');
      drawBox(margin + 145, y, 10, 8, "UF", transUf || "", 'center');
      drawBox(margin + 155, y, 35, 8, "CNPJ / CPF", transCnpj || "", 'center');
      
      y += 8;
      drawBox(margin, y, 80, 8, "Endereço", transEnd || "");
      drawBox(margin + 80, y, 50, 8, "Município", transMun || "");
      drawBox(margin + 130, y, 10, 8, "UF", transUf || "", 'center');
      drawBox(margin + 140, y, 20, 8, "Inscrição Estadual", transIE || "");
      drawBox(margin + 160, y, 10, 8, "Qtde", qVol || "", 'center');
      drawBox(margin + 170, y, 20, 8, "Peso Bruto", pesoB || "", 'right');

      y += 12;

      // --- DADOS DO PRODUTO / SERVIÇO ---
      doc.text("DADOS DO PRODUTO / SERVIÇO", margin, y - 1);
      
      doc.setDrawColor(0);
      doc.rect(margin, y, contentWidth, 6);
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      
      const cols = [
        { name: "CÓDIGO", w: 15, x: margin },
        { name: "DESCRIÇÃO DO PRODUTO / SERVIÇO", w: 65, x: margin + 15 },
        { name: "NCM/SH", w: 15, x: margin + 80 },
        { name: "CST", w: 8, x: margin + 95 },
        { name: "CFOP", w: 8, x: margin + 103 },
        { name: "UNID", w: 8, x: margin + 111 },
        { name: "QTD", w: 15, x: margin + 119 },
        { name: "V.UNIT", w: 15, x: margin + 134 },
        { name: "V.TOTAL", w: 15, x: margin + 149 },
        { name: "BC.ICMS", w: 15, x: margin + 164 },
        { name: "V.ICMS", w: 11, x: margin + 179 },
      ];

      cols.forEach(c => {
         doc.text(c.name, c.x + 1, y + 4);
         if(c.x > margin) doc.line(c.x, y, c.x, y + 6);
      });

      y += 6;

      // Iterar Produtos do XML
      const dets = xmlDoc.getElementsByTagName("det");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);

      Array.from(dets).forEach((det) => {
        const prod = det.getElementsByTagName("prod")[0];
        const imposto = det.getElementsByTagName("imposto")[0];
        const icms = imposto ? imposto.getElementsByTagName("ICMS")[0] : null;
        // Pega o primeiro filho do ICMS (Ex: ICMS00, ICMS60...)
        const icmsInner = icms ? icms.children[0] : null; 
        
        const cProd = getValue(prod, "cProd");
        const xProd = getValue(prod, "xProd");
        const NCM = getValue(prod, "NCM");
        const CFOP = getValue(prod, "CFOP");
        const uCom = getValue(prod, "uCom");
        const qCom = getValue(prod, "qCom");
        const vUnCom = parseFloat(getValue(prod, "vUnCom"));
        const vProdItem = parseFloat(getValue(prod, "vProd"));
        
        const CST = icmsInner ? getValue(icmsInner, "CST") : "";
        const vBCItem = icmsInner ? parseFloat(getValue(icmsInner, "vBC") || "0") : 0;
        const vICMSItem = icmsInner ? parseFloat(getValue(icmsInner, "vICMS") || "0") : 0;

        // Se passar da página, reseta Y (simplificado)
        if (y > 270) {
           doc.addPage();
           y = 10;
           // Redesenhar header seria ideal, mas para o exemplo vamos seguir simples
        }

        const rowH = 6;
        doc.rect(margin, y, contentWidth, rowH);
        
        doc.text(cProd, cols[0].x + 1, y + 4);
        doc.text(xProd.substring(0, 45), cols[1].x + 1, y + 4);
        doc.text(NCM, cols[2].x + 1, y + 4);
        doc.text(CST, cols[3].x + 1, y + 4);
        doc.text(CFOP, cols[4].x + 1, y + 4);
        doc.text(uCom, cols[5].x + 1, y + 4);
        doc.text(parseFloat(qCom).toFixed(2), cols[6].x + 1, y + 4);
        doc.text(fmtMoney(vUnCom), cols[7].x + 1, y + 4);
        doc.text(fmtMoney(vProdItem), cols[8].x + 1, y + 4);
        doc.text(fmtMoney(vBCItem), cols[9].x + 1, y + 4);
        doc.text(fmtMoney(vICMSItem), cols[10].x + 1, y + 4);

        cols.forEach((c, idx) => {
          if (idx > 0) doc.line(c.x, y, c.x, y + rowH);
        });

        y += rowH;
      });

      // --- DADOS ADICIONAIS ---
      y += 5;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("DADOS ADICIONAIS", margin, y - 1);
      
      const infCpl = getValue(xmlDoc, "infCpl");
      
      // Quebrar texto de dados adicionais
      const splitInf = doc.splitTextToSize(infCpl, 130);
      
      doc.rect(margin, y, 130, 25);
      doc.setFontSize(5);
      doc.setFont("helvetica", "normal");
      doc.text("Informações Complementares", margin + 1, y + 2.5);
      doc.setFontSize(6);
      doc.text(splitInf, margin + 1, y + 6);

      drawBox(margin + 130, y, 60, 25, "Reservado ao Fisco", "");

      // Rodapé
      doc.setFontSize(6);
      doc.text("Desenvolvido por Portal do Transportador", margin, 290);

      doc.save(`DANFE_${nfe.number}.pdf`);

    } catch (e) {
      console.error(e);
      alert("Erro ao gerar PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Nota Fiscal #{nfe.number}</h3>
            <p className="text-base text-gray-500">Chave: {nfe.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={28} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-8 flex space-x-8">
           <button 
             onClick={() => setActiveTab('details')}
             className={`py-4 text-base font-medium border-b-2 transition ${activeTab === 'details' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
             <div className="flex items-center gap-2"><FileText size={20}/> Detalhes</div>
           </button>
           <button 
             onClick={() => setActiveTab('xml')}
             className={`py-4 text-base font-medium border-b-2 transition ${activeTab === 'xml' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
              <div className="flex items-center gap-2"><Code size={20}/> XML Original</div>
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
           {activeTab === 'details' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow-sm border">
                  <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Emitente</h4>
                  <p className="text-xl font-medium">{nfe.senderName}</p>
                  <p className="text-gray-600 text-base">{nfe.senderCnpj}</p>
                </div>
                <div className="bg-white p-6 rounded shadow-sm border">
                  <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Destinatário</h4>
                  <p className="text-xl font-medium">{nfe.recipientName}</p>
                  <p className="text-gray-600 text-base">{nfe.recipientCnpj}</p>
                </div>
                <div className="bg-white p-6 rounded shadow-sm border">
                  <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Dados Fiscais</h4>
                  <div className="space-y-3 text-base">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Série:</span>
                      <span className="font-medium">{nfe.series}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emissão:</span>
                      <span className="font-medium">{new Date(nfe.issuedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rota:</span>
                      <span className="font-medium text-brand-600">{nfe.route}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded shadow-sm border flex flex-col justify-center items-center">
                  <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Valor Total</h4>
                  <p className="text-4xl font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nfe.amount)}
                  </p>
                </div>
             </div>
           )}

           {activeTab === 'xml' && (
             <div className="bg-gray-900 rounded-lg p-5 overflow-x-auto h-full">
               <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                 {nfe.xmlContent}
               </pre>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-white flex justify-end gap-4">
          <Button variant="outline" size="md" onClick={onClose}>Fechar</Button>
          
          <Button variant="secondary" size="md" onClick={handleDownloadPDF} isLoading={isGeneratingPdf}>
            <FileText size={18} className="mr-2" /> PDF (DANFE)
          </Button>

          <Button size="md" onClick={() => {
             // Simulação de download XML
             const blob = new Blob([nfe.xmlContent], { type: 'text/xml' });
             const url = window.URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = `NFe_${nfe.id}.xml`;
             a.click();
             window.URL.revokeObjectURL(url);
          }}>
            <Download size={18} className="mr-2" /> XML
          </Button>
        </div>
      </div>
    </div>
  );
};
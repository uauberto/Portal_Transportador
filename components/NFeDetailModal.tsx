import React, { useState } from 'react';
import { NFe } from '../types';
import { X, FileText, Download, Code } from 'lucide-react';
import { Button } from './ui/Button';
import { downloadDanfePdf } from '../services/nfeService';

interface Props {
  nfe: NFe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NFeDetailModal: React.FC<Props> = ({ nfe, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'xml'>('details');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !nfe) return null;

  const handleDownloadPDF = async () => {
    if (nfe.pdfUrl) {
      window.open(nfe.pdfUrl, '_blank');
      return;
    }
    
    setIsGeneratingPdf(true);
    try {
      await downloadDanfePdf(nfe.xmlContent);
    } catch (e) {
      console.error("Erro PDF", e);
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

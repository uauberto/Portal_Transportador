import { NFe, NFeFilter } from '../types';
import { MOCK_NFES } from './mockData';
import JSZip from 'jszip';

// ----------------------------------------------------------------
// NOTA SOBRE INTEGRAÇÃO SQL (POSTGRESQL)
// ----------------------------------------------------------------
// Em um ambiente de produção, esta função executaria uma query SQL.
// Abaixo está o exemplo da query que este serviço geraria:
/*
  SELECT * FROM nfes 
  WHERE carrier_id = $1
  AND ($2::text IS NULL OR CAST(issued_at AS DATE) = $2)
  AND ($3::text IS NULL OR number ILIKE '%' || $3 || '%')
  AND ($4::text IS NULL OR route ILIKE '%' || $4 || '%')
  ORDER BY issued_at DESC;
*/

export const getNFes = async (carrierId: string, filters: NFeFilter): Promise<NFe[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = MOCK_NFES.filter(nfe => nfe.carrierId === carrierId);

      // Filtro por Data de Emissão (SQL: WHERE CAST(issued_at AS DATE) = 'YYYY-MM-DD')
      if (filters.issueDate) {
        data = data.filter(nfe => nfe.issuedAt.startsWith(filters.issueDate!));
      }

      // Filtro por Número da Nota (SQL: WHERE number LIKE '%123%')
      if (filters.number) {
        data = data.filter(nfe => nfe.number.includes(filters.number!));
      }

      // Filtro por Rota (SQL: WHERE route LIKE '%SP-RJ%')
      if (filters.route) {
         data = data.filter(nfe => nfe.route.toLowerCase().includes(filters.route!.toLowerCase()));
      }

      // SQL: ORDER BY issued_at DESC
      data.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

      resolve(data);
    }, 600);
  });
};

export const generateZip = async (nfes: NFe[], carrierName: string): Promise<Blob> => {
    const zip = new JSZip();
    
    nfes.forEach(nfe => {
        const fileName = `NFe_${nfe.id}.xml`;
        // No SQL real: SELECT xml_content FROM nfes WHERE id = ...
        zip.file(fileName, nfe.xmlContent);
    });

    return await zip.generateAsync({ type: 'blob' });
};
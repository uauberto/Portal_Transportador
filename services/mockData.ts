import { NFe, NFeStatus, Transportadora, User, UserRole } from '../types';

export const MOCK_CARRIERS: Transportadora[] = [
  { id: 't1', name: 'TransRápido Logística', cnpj: '12.345.678/0001-90' },
  { id: 't2', name: 'LogiBrasil Express', cnpj: '98.765.432/0001-10' }
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'João Silva', email: 'joao@transrapido.com.br', role: UserRole.CARRIER, carrierId: 't1' },
  { id: 'u2', name: 'Maria Souza', email: 'maria@logibrasil.com.br', role: UserRole.CARRIER, carrierId: 't2' },
  { id: 'u3', name: 'Admin Sistema', email: 'admin@sistema.com.br', role: UserRole.ADMIN }
];

// O XML Real fornecido pelo usuário
const REAL_XML_CONTENT = `<?xml version="1.0" encoding="UTF-8"?><nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe" ><NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe versao="4.00" Id="NFe31250517291576000158550120009513541348716910"><ide><cUF>31</cUF><cNF>34871691</cNF><natOp>VENDA DE MERCADORIAS SUJEITA AO REGIME DE S.T. - SUBSTITUIDO</natOp><mod>55</mod><serie>12</serie><nNF>951354</nNF><dhEmi>2025-05-04T11:47:00-03:00</dhEmi><dhSaiEnt>2025-05-04T11:47:00-03:00</dhSaiEnt><tpNF>1</tpNF><idDest>1</idDest><cMunFG>3106200</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis><cDV>0</cDV><tpAmb>1</tpAmb><finNFe>1</finNFe><indFinal>0</indFinal><indPres>9</indPres><indIntermed>0</indIntermed><procEmi>0</procEmi><verProc>2.2.004.030</verProc></ide><emit><CNPJ>17291576000158</CNPJ><xNome>ORGAFARMA ORGANIZACAO FARMACEUTICA LTDA</xNome><xFant>MATRIZ ORGAFARMA</xFant><enderEmit><xLgr>RUA JACUI</xLgr><nro>8090</nro><xCpl>GALPAO</xCpl><xBairro>SAO GABRIEL</xBairro><cMun>3106200</cMun><xMun>BELO HORIZONTE</xMun><UF>MG</UF><CEP>31980000</CEP><cPais>1058</cPais><xPais>BRASIL</xPais><fone>3132728480</fone></enderEmit><IE>0620094660092</IE><CRT>3</CRT></emit><dest><CNPJ>09412526000153</CNPJ><xNome>ALESSANDRO REZENDE SANTOS E CIA LTDA EPP</xNome><enderDest><xLgr>RUA ARMANDO VIOTTI</xLgr><nro>135</nro><xCpl>LOJA</xCpl><xBairro>CENTRO</xBairro><cMun>3151503</cMun><xMun>PIUMHI</xMun><UF>MG</UF><CEP>37925000</CEP><cPais>1058</cPais><xPais>BRASIL</xPais><fone>3733717888</fone></enderDest><indIEDest>1</indIEDest><IE>0010634130080</IE><email>aux@aux.com</email></dest><autXML><CNPJ>00938957000183</CNPJ></autXML><det nItem="1"><prod><cProd>199648</cProd><cEAN>7896094929371</cEAN><xProd>DESCON 120ML HYP</xProd><NCM>30049036</NCM><CEST>1300301</CEST><indEscala>S</indEscala><CFOP>5405</CFOP><uCom>UN</uCom><qCom>2.0000</qCom><vUnCom>14.0480490000</vUnCom><vProd>28.10</vProd><cEANTrib>7896094929371</cEANTrib><uTrib>UN</uTrib><qTrib>2.0000</qTrib><vUnTrib>14.0480490000</vUnTrib><vOutro>1.67</vOutro><indTot>1</indTot><xPed>332000847</xPed><nItemPed>13</nItemPed><rastro><nLote>J24G0060</nLote><qLote>2.000</qLote><dFab>2024-08-30</dFab><dVal>2026-08-30</dVal></rastro><med><cProdANVISA>1781709440037</cProdANVISA><vPMC>23.56</vPMC></med></prod><imposto><ICMS><ICMS60><orig>0</orig><CST>60</CST><vBCSTRet>0.00</vBCSTRet><pST>0.0000</pST><vICMSSubstituto>0.00</vICMSSubstituto><vICMSSTRet>0.00</vICMSSTRet></ICMS60></ICMS><IPI><cEnq>999</cEnq><IPITrib><CST>99</CST><vBC>0.00</vBC><pIPI>0.0000</pIPI><vIPI>0.00</vIPI></IPITrib></IPI><PIS><PISNT><CST>04</CST></PISNT></PIS><COFINS><COFINSNT><CST>04</CST></COFINSNT></COFINS></imposto><infAdProd>N LT. J24G0060 DATA FAB.: 30/08/24 DATA VAL.: 30/08/26</infAdProd></det><det nItem="2"><prod><cProd>196959</cProd><cEAN>7896714292113</cEAN><xProd>ECOXE*C1 90MG 14CPR HYP (C1)</xProd><NCM>30049069</NCM><CEST>1300300</CEST><indEscala>S</indEscala><CFOP>5405</CFOP><uCom>UN</uCom><qCom>2.0000</qCom><vUnCom>99.8291570000</vUnCom><vProd>199.66</vProd><cEANTrib>7896714292113</cEANTrib><uTrib>UN</uTrib><qTrib>2.0000</qTrib><vUnTrib>99.8291570000</vUnTrib><vOutro>13.74</vOutro><indTot>1</indTot><xPed>332000847</xPed><nItemPed>14</nItemPed><rastro><nLote>M401976</nLote><qLote>2.000</qLote><dFab>2024-02-29</dFab><dVal>2026-02-28</dVal></rastro><med><cProdANVISA>1781709220101</cProdANVISA><vPMC>150.01</vPMC></med></prod><imposto><ICMS><ICMS60><orig>0</orig><CST>60</CST><vBCSTRet>0.00</vBCSTRet><pST>0.0000</pST><vICMSSubstituto>0.00</vICMSSubstituto><vICMSSTRet>0.00</vICMSSTRet></ICMS60></ICMS><IPI><cEnq>999</cEnq><IPITrib><CST>99</CST><vBC>0.00</vBC><pIPI>0.0000</pIPI><vIPI>0.00</vIPI></IPITrib></IPI><PIS><PISNT><CST>04</CST></PISNT></PIS><COFINS><COFINSNT><CST>04</CST></COFINSNT></COFINS></imposto><infAdProd>N LT. M401976 DATA FAB.: 29/02/24 DATA VAL.: 28/02/26</infAdProd></det><det nItem="3"><prod><cProd>130559</cProd><cEAN>7896094917866</cEAN><xProd>ADDERA D3 50.000UI 8CPR HYP</xProd><NCM>30045050</NCM><CEST>1300101</CEST><indEscala>S</indEscala><CFOP>5405</CFOP><uCom>UN</uCom><qCom>1.0000</qCom><vUnCom>179.2704380000</vUnCom><vProd>179.27</vProd><cEANTrib>7896094917866</cEANTrib><uTrib>UN</uTrib><qTrib>1.0000</qTrib><vUnTrib>179.2704380000</vUnTrib><vOutro>10.65</vOutro><indTot>1</indTot><xPed>332000847</xPed><nItemPed>15</nItemPed><rastro><nLote>B24L2301</nLote><qLote>1.000</qLote><dFab>2024-11-30</dFab><dVal>2026-11-30</dVal></rastro><med><cProdANVISA>1781700280517</cProdANVISA><vPMC>250.51</vPMC></med></prod><imposto><ICMS><ICMS60><orig>0</orig><CST>60</CST><vBCSTRet>0.00</vBCSTRet><pST>0.0000</pST><vICMSSubstituto>0.00</vICMSSubstituto><vICMSSTRet>0.00</vICMSSTRet></ICMS60></ICMS><IPI><cEnq>999</cEnq><IPITrib><CST>99</CST><vBC>0.00</vBC><pIPI>0.0000</pIPI><vIPI>0.00</vIPI></IPITrib></IPI><PIS><PISNT><CST>04</CST></PISNT></PIS><COFINS><COFINSNT><CST>04</CST></COFINSNT></COFINS></imposto><infAdProd>N LT. B24L2301 DATA FAB.: 30/11/24 DATA VAL.: 30/11/26</infAdProd></det><det nItem="4"><prod><cProd>106100</cProd><cEAN>7891142171733</cEAN><xProd>POLARAMINE 6MG 12DGS HYP</xProd><NCM>30049069</NCM><CEST>1300101</CEST><indEscala>S</indEscala><CFOP>5405</CFOP><uCom>UN</uCom><qCom>2.0000</qCom><vUnCom>26.3097040000</vUnCom><vProd>52.62</vProd><cEANTrib>7891142171733</cEANTrib><uTrib>UN</uTrib><qTrib>2.0000</qTrib><vUnTrib>26.3097040000</vUnTrib><vOutro>3.13</vOutro><indTot>1</indTot><xPed>332000847</xPed><nItemPed>16</nItemPed><rastro><nLote>B24C2028</nLote><qLote>2.000</qLote><dFab>2024-01-31</dFab><dVal>2026-01-30</dVal></rastro><med><cProdANVISA>1781708110149</cProdANVISA><vPMC>37.95</vPMC></med></prod><imposto><ICMS><ICMS60><orig>0</orig><CST>60</CST><vBCSTRet>0.00</vBCSTRet><pST>0.0000</pST><vICMSSubstituto>0.00</vICMSSubstituto><vICMSSTRet>0.00</vICMSSTRet></ICMS60></ICMS><IPI><cEnq>999</cEnq><IPITrib><CST>99</CST><vBC>0.00</vBC><pIPI>0.0000</pIPI><vIPI>0.00</vIPI></IPITrib></IPI><PIS><PISNT><CST>04</CST></PISNT></PIS><COFINS><COFINSNT><CST>04</CST></COFINSNT></COFINS></imposto><infAdProd>N LT. B24C2028 DATA FAB.: 31/01/24 DATA VAL.: 30/01/26</infAdProd></det><det nItem="5"><prod><cProd>106003</cProd><cEAN>7897322714462</cEAN><xProd>MIOFLEX A 12CPR HYP</xProd><NCM>30049099</NCM><CEST>1300101</CEST><indEscala>S</indEscala><CFOP>5405</CFOP><uCom>UN</uCom><qCom>4.0000</qCom><vUnCom>18.9408160000</vUnCom><vProd>75.76</vProd><cEANTrib>7897322714462</cEANTrib><uTrib>UN</uTrib><qTrib>4.0000</qTrib><vUnTrib>18.9408160000</vUnTrib><vOutro>4.50</vOutro><indTot>1</indTot><xPed>332000847</xPed><nItemPed>17</nItemPed><rastro><nLote>B24K0068</nLote><qLote>4.000</qLote><dFab>2024-09-30</dFab><dVal>2026-09-30</dVal></rastro><med><cProdANVISA>1781708130042</cProdANVISA><vPMC>26.47</vPMC></med></prod><imposto><ICMS><ICMS60><orig>0</orig><CST>60</CST><vBCSTRet>0.00</vBCSTRet><pST>0.0000</pST><vICMSSubstituto>0.00</vICMSSubstituto><vICMSSTRet>0.00</vICMSSTRet></ICMS60></ICMS><IPI><cEnq>999</cEnq><IPITrib><CST>99</CST><vBC>0.00</vBC><pIPI>0.0000</pIPI><vIPI>0.00</vIPI></IPITrib></IPI><PIS><PISNT><CST>04</CST></PISNT></PIS><COFINS><COFINSNT><CST>04</CST></COFINSNT></COFINS></imposto><infAdProd>N LT. B24K0068 DATA FAB.: 30/09/24 DATA VAL.: 30/09/26</infAdProd></det><det nItem="6"><prod><cProd>92355</cProd><cEAN>7896179850040</cEAN><xProd>TAMARINE 6MG 20CAP HYP</xProd><NCM>30049099</NCM><CEST>1300101</CEST><indEscala>S</indEscala><CFOP>5405</CFOP><uCom>UN</uCom><qCom>2.0000</qCom><vUnCom>67.7969580000</vUnCom><vProd>135.59</vProd><cEANTrib>7896179850040</cEANTrib><uTrib>UN</uTrib><qTrib>2.0000</qTrib><vUnTrib>67.7969580000</vUnTrib><vOutro>8.05</vOutro><indTot>1</indTot><xPed>332000847</xPed><nItemPed>18</nItemPed><rastro><nLote>B24E0057</nLote><qLote>2.000</qLote><dFab>2024-05-30</dFab><dVal>2026-05-30</dVal></rastro><med><cProdANVISA>ISENTO</cProdANVISA><vPMC>97.79</vPMC></med></prod><imposto><ICMS><ICMS60><orig>0</orig><CST>60</CST><vBCSTRet>0.00</vBCSTRet><pST>0.0000</pST><vICMSSubstituto>0.00</vICMSSubstituto><vICMSSTRet>0.00</vICMSSTRet></ICMS60></ICMS><IPI><cEnq>999</cEnq><IPITrib><CST>99</CST><vBC>0.00</vBC><pIPI>0.0000</pIPI><vIPI>0.00</vIPI></IPITrib></IPI><PIS><PISNT><CST>04</CST></PISNT></PIS><COFINS><COFINSNT><CST>04</CST></COFINSNT></COFINS></imposto><infAdProd>N LT. B24E0057 DATA FAB.: 30/05/24 DATA VAL.: 30/05/26</infAdProd></det><det nItem="7"><prod><cProd>91910</cProd><cEAN>7896094904682</cEAN><xProd>BENEGRIP 20CPR HYP</xProd><NCM>30045090</NCM><CEST>1300101</CEST><indEscala>S</indEscala><CFOP>5405</CFOP><uCom>UN</uCom><qCom>3.0000</qCom><vUnCom>31.3224490000</vUnCom><vProd>93.97</vProd><cEANTrib>7896094904682</cEANTrib><uTrib>UN</uTrib><qTrib>3.0000</qTrib><vUnTrib>31.3224490000</vUnTrib><vOutro>5.58</vOutro><indTot>1</indTot><xPed>332000847</xPed><nItemPed>19</nItemPed><rastro><nLote>B24K2790</nLote><qLote>3.000</qLote><dFab>2025-01-11</dFab><dVal>2027-12-30</dVal></rastro><med><cProdANVISA>1781700920044</cProdANVISA><vPMC>45.18</vPMC></med></prod><imposto><ICMS><ICMS60><orig>0</orig><CST>60</CST><vBCSTRet>0.00</vBCSTRet><pST>0.0000</pST><vICMSSubstituto>0.00</vICMSSubstituto><vICMSSTRet>0.00</vICMSSTRet></ICMS60></ICMS><IPI><cEnq>999</cEnq><IPITrib><CST>99</CST><vBC>0.00</vBC><pIPI>0.0000</pIPI><vIPI>0.00</vIPI></IPITrib></IPI><PIS><PISNT><CST>04</CST></PISNT></PIS><COFINS><COFINSNT><CST>04</CST></COFINSNT></COFINS></imposto><infAdProd>N LT. B24K2790 DATA FAB.: 11/01/25 DATA VAL.: 30/12/27</infAdProd></det><det nItem="8"><prod><cProd>80756</cProd><cEAN>7896094922105</cEAN><xProd>NEBACETIN PDA 15G HYP</xProd><NCM>30042099</NCM><CEST>1300401</CEST><indEscala>S</indEscala><CFOP>5405</CFOP><uCom>UN</uCom><qCom>3.0000</qCom><vUnCom>20.0879730000</vUnCom><vProd>60.26</vProd><cEANTrib>7896094922105</cEANTrib><uTrib>UN</uTrib><qTrib>3.0000</qTrib><vUnTrib>20.0879730000</vUnTrib><vOutro>3.58</vOutro><indTot>1</indTot><xPed>332000847</xPed><nItemPed>20</nItemPed><rastro><nLote>561912</nLote><qLote>3.000</qLote><dFab>2024-07-30</dFab><dVal>2026-07-30</dVal></rastro><med><cProdANVISA>1063902520044</cProdANVISA><vPMC>28.98</vPMC></med></prod><imposto><ICMS><ICMS60><orig>0</orig><CST>60</CST><vBCSTRet>0.00</vBCSTRet><pST>0.0000</pST><vICMSSubstituto>0.00</vICMSSubstituto><vICMSSTRet>0.00</vICMSSTRet></ICMS60></ICMS><IPI><cEnq>999</cEnq><IPITrib><CST>99</CST><vBC>0.00</vBC><pIPI>0.0000</pIPI><vIPI>0.00</vIPI></IPITrib></IPI><PIS><PISNT><CST>04</CST></PISNT></PIS><COFINS><COFINSNT><CST>04</CST></COFINSNT></COFINS></imposto><infAdProd>N LT. 561912 DATA FAB.: 30/07/24 DATA VAL.: 30/07/26</infAdProd></det><total><ICMSTot><vBC>0.00</vBC><vICMS>0.00</vICMS><vICMSDeson>0.00</vICMSDeson><vFCP>0.00</vFCP><vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST><vFCPSTRet>0.00</vFCPSTRet><qBCMono>0.00</qBCMono><vICMSMono>0.00</vICMSMono><qBCMonoReten>0.00</qBCMonoReten><vICMSMonoReten>0.00</vICMSMonoReten><qBCMonoRet>0.00</qBCMonoRet><vICMSMonoRet>0.00</vICMSMonoRet><vProd>825.23</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS><vOutro>50.90</vOutro><vNF>876.13</vNF><vTotTrib>0.00</vTotTrib></ICMSTot></total><transp><modFrete>0</modFrete><transporta><CNPJ>12227730000109</CNPJ><xNome>P H LOGISTICA LTDA ME</xNome><IE>0016329450013</IE><xEnder>RUA OURO PRETO, 195 - VILA ESPIRITO SANTO</xEnder><xMun>DIVINOPOLIS</xMun><UF>MG</UF></transporta><vol><qVol>2</qVol><nVol>2</nVol><pesoL>0.019</pesoL><pesoB>0.019</pesoB></vol></transp><pag><detPag><indPag>0</indPag><tPag>21</tPag><vPag>876.13</vPag></detPag></pag><infAdic><infAdFisco>DOCUMENTO FISCAL EMITIDO CONFORME ART. 24 PART 1 DO ANEXO VII DO RICMS/23. AAS 2023021262 AFE MEDIC. 1.05565-3 AE 1.21241-2</infAdFisco><infCpl>ROTA: 240 ALVARA: 2413/2024 BC ST: 1108.02 VL ST: 50.9 ORDEM COMPRA: 332000847 PEDIDO: 332000847 TIPO COBRANCA: BK FANTASIA: DROGARIAS FARMELHOR TRANSACAO: 1973753//VALOR DESCONTADO REF CREDITO NO VALOR DE R$876.13</infCpl></infAdic><infRespTec><CNPJ>07577599000501</CNPJ><xContato>TOTVS BRASILIA SOFTWARE - UNIDADE GOIANIA LTDA</xContato><email>resp_tecnico_dfe_winthor@totvs.com.br</email><fone>6232500200</fone></infRespTec></infNFe><Signature xmlns="http://www.w3.org/2000/09/xmldsig#"><SignedInfo><CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/><SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/><Reference URI="#NFe31250517291576000158550120009513541348716910"><Transforms><Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/><Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/></Transforms><DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><DigestValue>1UawewQn0QWYne+NH0IbyxzEMtY=</DigestValue></Reference></SignedInfo><SignatureValue>UGzXkgMjX+ake38ArsVdAMfTCtjN1jTHqRZjgOg/vQLSIPVJms/HEQXvBDq10KxNDc0x0VX3TNazYjdgXaWteBT0QCztT5tUx2/LaCdpj37fPSpr/x4q4IjryCRlifEWE5fGMwEvjiV7/6bbu8vq/NFWLU+9ZSiYnaMKFQY9JpBX3PXUXlEYNqnzmIhn42BJop8Q0ZDADxA++/K0Rdfp57j726fCK7rNby2ECKB1NIA5tHYa51oRbZH2/vCBQZJ/IvyyVLzncbt8e6FEqlKpUrZ4dOE3vIFCUBPfiP5nLmyUSP38sogkYcSX7haMonYCLfkK5VGO+1qnAitsLXtqAw==</SignatureValue><KeyInfo><X509Data><X509Certificate>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</X509Certificate></X509Data></KeyInfo></Signature></NFe></nfeProc>`;

// Helper to generate a dummy XML
const generateXML = (nfe: Partial<NFe>) => `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${nfe.id}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00445566</cNF>
        <natOp>Venda de mercadoria</natOp>
        <mod>55</mod>
        <serie>${nfe.series}</serie>
        <nNF>${nfe.number}</nNF>
        <dhEmi>${nfe.issuedAt}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
      </ide>
      <emit>
        <CNPJ>${nfe.senderCnpj}</CNPJ>
        <xNome>${nfe.senderName}</xNome>
      </emit>
      <dest>
        <CNPJ>${nfe.recipientCnpj}</CNPJ>
        <xNome>${nfe.recipientName}</xNome>
      </dest>
      <total>
        <ICMSTot>
          <vNF>${nfe.amount?.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
        <transporta>
             <xNome>TRANSPORTADORA SIMULADA</xNome>
        </transporta>
      </transp>
    </infNFe>
  </NFe>
</nfeProc>`;

export const MOCK_NFES: NFe[] = [
  {
    // Usando a chave e dados do XML Real
    id: '31250517291576000158550120009513541348716910',
    number: '951354',
    series: '12',
    issuedAt: '2025-05-04T11:47:00-03:00',
    amount: 876.13,
    status: NFeStatus.AUTHORIZED,
    route: 'MG-MG', // De BH para PIUMHI (Extraído do XML)
    senderName: 'ORGAFARMA ORGANIZACAO FARMACEUTICA LTDA',
    senderCnpj: '17.291.576/0001-58',
    recipientName: 'ALESSANDRO REZENDE SANTOS E CIA LTDA EPP',
    recipientCnpj: '09.412.526/0001-53',
    carrierId: 't1',
    xmlContent: REAL_XML_CONTENT // XML Completo injetado aqui
  },
  {
    id: '35230987654321000190550010000056781000056789',
    number: '5678',
    series: '1',
    issuedAt: '2023-10-26T09:15:00',
    amount: 8900.00,
    status: NFeStatus.AUTHORIZED,
    route: 'SP-MG',
    senderName: 'Eletrônicos Global SA',
    senderCnpj: '33.333.333/0001-33',
    recipientName: 'Tech Store BH',
    recipientCnpj: '44.444.444/0001-44',
    carrierId: 't1',
    xmlContent: ''
  },
  {
    id: '35230911223344000190550010000099881000099887',
    number: '9988',
    series: '2',
    issuedAt: '2023-10-27T16:45:00',
    amount: 450.20,
    status: NFeStatus.CANCELED,
    route: 'SP-SP',
    senderName: 'Distribuidora Alimentos',
    senderCnpj: '55.555.555/0001-55',
    recipientName: 'Mercado da Esquina',
    recipientCnpj: '66.666.666/0001-66',
    carrierId: 't1',
    xmlContent: ''
  },
   {
    id: '35230999887766000190550010000077661000077665',
    number: '7766',
    series: '1',
    issuedAt: '2023-10-28T10:00:00',
    amount: 23000.00,
    status: NFeStatus.PENDING,
    route: 'SC-PR',
    senderName: 'Móveis do Sul',
    senderCnpj: '77.777.777/0001-77',
    recipientName: 'Loja Curitiba',
    recipientCnpj: '88.888.888/0001-88',
    carrierId: 't2', // Different carrier
    xmlContent: ''
  }
];

// Populate XML content dynamically for the other mocks that are empty
MOCK_NFES.forEach(nfe => {
    if(!nfe.xmlContent) {
        nfe.xmlContent = generateXML(nfe);
    }
});
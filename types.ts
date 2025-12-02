export enum UserRole {
  ADMIN = 'ADMIN',
  CARRIER = 'CARRIER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  carrierId?: string; // Links user to a specific transportadora
  token?: string;
}

export interface Transportadora {
  id: string;
  cnpj: string;
  name: string;
}

export enum NFeStatus {
  AUTHORIZED = 'AUTORIZADA',
  CANCELED = 'CANCELADA',
  PENDING = 'PENDENTE'
}

export interface NFe {
  id: string; // Chave de acesso
  number: string;
  series: string;
  issuedAt: string; // ISO Date
  amount: number;
  status: NFeStatus;
  route: string;
  senderName: string; // Emitente
  senderCnpj: string;
  recipientName: string; // Destinatário
  recipientCnpj: string;
  carrierId: string;
  xmlContent: string; // The raw XML string
  pdfUrl?: string;
}

export interface NFeFilter {
  issueDate?: string; // YYYY-MM-DD
  number?: string;
  route?: string;
}
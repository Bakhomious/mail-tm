export interface TempEmail {
  id: string;
  address: string;
  password: string;
  token: string;
  accountId: string;
  createdAt: number;
  expiresAt: number;
}

export interface Domain {
  domain: string;
}

export interface DomainsResponse {
  "hydra:member": Domain[]
}

export interface MessageFrom {
  address: string;
  name: string;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface Message {
  id: string;
  accountId: string;
  msgid: string;
  from: MessageFrom;
  to: MessageFrom[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDetail extends Message {
  text: string;
  html: string[];
  attachments: MessageAttachment[];
}

export interface MessagesResponse {
  "hydra:member": Message[];
  "hydra:totalItems": number;
}

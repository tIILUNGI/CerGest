export type CertificateStatus = 'Activo' | 'Rascunho' | 'Expirado';

export interface Certificate {
  id: string;
  recipientName: string;
  courseName: string;
  issueDate: string;
  hours: number;
  type: string; // "Curso", "Workshop", "Seminário", "Palestra"
  status: CertificateStatus;
  verificationCode: string;
  signatoryName: string;
  signatoryRole: string;
  grade?: string;
  orientation?: 'landscape' | 'portrait';
  startDate?: string;
  endDate?: string;
  curriculum?: string;
  courseNo?: string;
  inefopLicense?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  styleName: string; // 'clássico' | 'tecnológico' | 'minimalista' | 'executivo'
  borderColor: string;
  primaryColor: string;
  fontFamily: 'serif' | 'sans' | 'mono';
  hasSeal: boolean;
  borderStyle: 'solid' | 'dashed' | 'double';
  orientation?: 'landscape' | 'portrait'; // landscape (default) or portrait (vertical)
}

export interface InstitutionSettings {
  name: string;
  email: string;
  phone: string;
  defaultSignatory: string;
  defaultRole: string;
  prefix: string;
  logoUrl?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  signatureText: string;
  signatureImage?: string;
}

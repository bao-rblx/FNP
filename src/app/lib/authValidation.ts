/** Client-side rules (server enforces the same). */
export const VANLANG_EMAIL_DOMAIN = '@vanlanguni.vn';

export function isVanLangSchoolEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(VANLANG_EMAIL_DOMAIN);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isNumericStudentId(id: string): boolean {
  return /^\d+$/.test(id.trim());
}

export type UserRole = 'user' | 'admin';
export type UserRank = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface PublicUser {
  id: number;
  name: string;
  phone?: string | null;
  schoolEmail: string | null;
  studentId: string;
  role: UserRole;
  points: number;
  rank: UserRank;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  orderCount?: number;
  totalSpent?: number;
}

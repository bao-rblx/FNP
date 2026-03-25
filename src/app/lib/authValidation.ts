/** Client-side rules (server enforces the same). */
export const VANLANG_EMAIL_DOMAIN = '@vanlanguni.vn';

export function isVanLangSchoolEmail(email: string): boolean {
  const n = email.trim().toLowerCase();
  return n.endsWith(VANLANG_EMAIL_DOMAIN);
}

export function isNumericStudentId(id: string): boolean {
  return /^\d+$/.test(id.trim());
}

export type UserRole = 'user' | 'admin';

export interface PublicUser {
  id: number;
  name: string;
  schoolEmail: string;
  studentId: string;
  role: UserRole;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  orderCount?: number;
  totalSpent?: number;
}

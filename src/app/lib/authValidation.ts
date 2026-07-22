/** Client-side rules for PolyStore auth. */

export function isVanLangSchoolEmail(email: string): boolean {
  return isValidEmail(email);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isNumericStudentId(id: string): boolean {
  return /^\d+$/.test(id.trim());
}

export type UserRole = 'user' | 'admin';

export interface PublicUser {
  id: number;
  name: string;
  phone?: string | null;
  schoolEmail: string | null;
  role: UserRole;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  orderCount?: number;
  totalSpent?: number;
}

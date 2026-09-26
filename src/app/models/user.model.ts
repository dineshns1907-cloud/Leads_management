export type UserRole = 'salesperson' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title: string;
  avatarText: string;
  department: string;
  phone?: string;
}

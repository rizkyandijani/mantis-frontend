export type Role = 'admin' | 'student' | 'instructor';

export interface User {
  id: number;
  email: string;
  password: string;
  name?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
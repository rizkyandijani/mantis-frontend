export type Role = 'admin' | 'student' | 'instructor';

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
}

export interface UserData {
  id: number;
  email: string;
  password?: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
export type UserRole = 'member' | 'admin';

// A senha não faz parte do modelo: só o UsersService conhece o campo `password` do db.json.
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

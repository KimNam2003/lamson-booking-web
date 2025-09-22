export interface JwtPayload {
  sub: number;      // id của user
  email: string;
  role: 'doctor' | 'patient' | string;
  roleId?: number;
}
import { Request as ExpressRequest } from 'express';

// Gộp kiểu với Express Request
export type RequestWithUser = ExpressRequest & { user?: JwtPayload };
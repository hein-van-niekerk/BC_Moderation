import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import sql from './db';

const SECRET = process.env.JWT_SECRET || 'dev-secret';


export async function login(email: string, password: string): Promise<{ token: string; user: { lecturer_id: number; email: string; role: string; lecturer_name: string } } | null> {
  try {
    const pool = await (await import('./db')).poolPromise;
    if (!pool) throw new Error('Database connection failed');
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, password)
      .query(`SELECT lecturer_id, email, role, lecturer_name FROM Lecturers WHERE email = @email AND password = @password AND (role = 'Lecturer' OR role = 'Department Head')`);
    console.log('Login query result:', result.recordset); // <-- Add this line
    if (!result.recordset || result.recordset.length === 0) return null;
    const u = result.recordset[0];
    const payload = { id: u.lecturer_id, email: u.email, role: u.role, name: u.lecturer_name };
    const token = jwt.sign(payload, SECRET, { expiresIn: '8h' });
    return { token, user: { lecturer_id: u.lecturer_id, email: u.email, role: u.role, lecturer_name: u.lecturer_name } };
  } catch (err) {
    console.error('Login error:', err);
    return null;
  }
}
export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; name: string };
}

export function authMiddleware(requiredRole?: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Missing token' });
    const token = auth.replace('Bearer ', '');
    try {
      const data = jwt.verify(token, SECRET) as any;
      req.user = { id: data.id, email: data.email, role: data.role, name: data.name };
      if (requiredRole && req.user.role !== requiredRole) return res.status(403).json({ message: 'Forbidden' });
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

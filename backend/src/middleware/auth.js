import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { listRows, SHEETS } from '../services/sheetService.js';

export function issueToken(profile) {
  return jwt.sign(profile, env.jwtSecret, { expiresIn: '8h' });
}

export function requireAuth(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, env.jwtSecret);
      const users = await listRows(SHEETS.users);
      const sheetUser = users.find((user) => user.email.toLowerCase() === decoded.email.toLowerCase());
      const role = sheetUser?.role || 'view';
      req.user = { ...decoded, role };
      if (allowedRoles.length && !allowedRoles.includes(role)) {
        return res.status(403).json({ message: 'Forbidden for this role' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
  };
}

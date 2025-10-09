import { Request, Response, NextFunction } from 'express';
import type { User } from '@shared/schema';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      fullName: string;
      role: 'admin' | 'bendahara' | 'ketua' | 'tim_konstruksi' | 'tim_procurement';
      isActive: number;
    }
  }
}

// Check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please login first.' });
}

// Check if user has specific role
export function hasRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Forbidden. You do not have permission to access this resource.' 
      });
    }

    next();
  };
}

// Check if user is admin
export const isAdmin = hasRole('admin');

// Check if user is bendahara or admin
export const isBendaharaOrAdmin = hasRole('admin', 'bendahara');

// Check if user is ketua or admin
export const isKetuaOrAdmin = hasRole('admin', 'ketua');

// Check if user can create transactions (admin, tim_konstruksi, tim_procurement)
export const canCreateTransaction = hasRole('admin', 'tim_konstruksi', 'tim_procurement');

// Check if user can approve as bendahara
export const canApproveBendahara = hasRole('admin', 'bendahara');

// Check if user can approve as ketua
export const canApproveKetua = hasRole('admin', 'ketua');

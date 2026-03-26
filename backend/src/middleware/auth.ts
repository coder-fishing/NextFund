import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export const verifyInternalRequest = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const internalSecret = process.env.INTERNAL_API_SECRET;
  const providedSecretHeader = req.headers['x-internal-secret'];
  const userEmailHeader = req.headers['x-user-email'];

  const providedSecret = Array.isArray(providedSecretHeader)
    ? providedSecretHeader[0]
    : providedSecretHeader;

  const userEmail = Array.isArray(userEmailHeader)
    ? userEmailHeader[0]
    : userEmailHeader;

  if (!internalSecret) {
    res.status(500).json({ message: 'Server internal auth is not configured' });
    return;
  }

  if (typeof providedSecret !== 'string' || providedSecret.trim() !== internalSecret.trim()) {
    res.status(401).json({ message: 'Unauthorized internal request' });
    return;
  }

  if (typeof userEmail !== 'string' || !userEmail.trim()) {
    res.status(401).json({ message: 'Missing user context' });
    return;
  }

  req.user = {
    email: userEmail.trim(),
  };

  next();
};

// JWT Optional - không bắt buộc nhưng nếu có thì verify
export const verifyJWTOptional = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (token) {
      // Nếu có token, verify nó
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = decoded;
      req.token = token;
    }
    // Không có token cũng được, tiếp tục

    next();
  } catch (error) {
    // Token invalid nhưng vẫn cho qua (optional)
    console.warn('JWT verification failed (optional):', error);
    next();
  }
};

// JWT Required - bắt buộc có token hợp lệ
export const verifyJWTRequired = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Missing authorization token' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Generate JWT
export const generateJWT = (data: any): string => {
  return jwt.sign(data, process.env.JWT_SECRET!, {
    expiresIn: '7d', // Token hết hạn sau 7 ngày
  });
};

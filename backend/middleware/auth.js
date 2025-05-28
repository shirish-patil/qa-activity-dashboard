const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authMiddleware = {
  verifyToken: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ 
          message: 'Authorization header missing',
          code: 'AUTH_HEADER_MISSING'
        });
      }

      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          message: 'Token not provided',
          code: 'TOKEN_MISSING'
        });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Verify user still exists and is active
        const user = await prisma.user.findUnique({
          where: { id: decoded.id }
        });

        if (!user) {
          return res.status(401).json({
            message: 'User no longer exists',
            code: 'USER_NOT_FOUND'
          });
        }

        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        };
        
        next();
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          return res.status(401).json({
            message: 'Token has expired',
            code: 'TOKEN_EXPIRED'
          });
        }
        
        return res.status(401).json({
          message: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        message: 'Internal server error during authentication',
        code: 'AUTH_ERROR'
      });
    }
  },

  checkRole: (allowedRoles) => {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
        }

        if (!Array.isArray(allowedRoles)) {
          allowedRoles = [allowedRoles];
        }

        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            message: 'Access denied. Insufficient permissions.',
            code: 'INSUFFICIENT_PERMISSIONS'
          });
        }

        next();
      } catch (error) {
        console.error('Role check error:', error);
        return res.status(500).json({
          message: 'Internal server error during role verification',
          code: 'ROLE_CHECK_ERROR'
        });
      }
    };
  }
};

module.exports = authMiddleware;

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  console.log('[AUTH MIDDLEWARE] URL:', req.path);
  console.log('[AUTH MIDDLEWARE] Headers:', req.headers);
  
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('[AUTH MIDDLEWARE] Token found:', token.substring(0, 20) + '...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[AUTH MIDDLEWARE] Token decoded:', decoded);
      req.user = decoded;
      return next();
    } catch (error) {
      console.log('[AUTH MIDDLEWARE] Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  console.log('[AUTH MIDDLEWARE] No token found in headers');
  return res.status(401).json({ message: 'Not authorized, no token' });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    const normalizedRole = req.user?.role ? req.user.role.toLowerCase() : null;
    const normalizedRoles = roles.map((r) => r.toLowerCase());

    if (!req.user || !normalizedRoles.includes(normalizedRole)) {
      return res.status(403).json({ message: `Role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route` });
    }

    next();
  };
};

module.exports = { protect, authorize };

const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  console.log('Auth header:', authHeader);
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        console.log('JWT verification error:', err);
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      console.log('Decoded JWT:', decoded);
      
      // Create user property on request with both standard formats
      req.user = {
        id: decoded.UserInfo.id || decoded.UserInfo._id,
        _id: decoded.UserInfo.id || decoded.UserInfo._id,
        role: decoded.UserInfo.role,
        email: decoded.UserInfo.email
      };
      
      console.log('User set in request:', req.user);
      next();
    }
  );
};

module.exports = verifyJWT;
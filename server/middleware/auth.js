const jwt = require('jsonwebtoken');
const User = require('../models/User');

//User Authentication Middleware
const protect = async (req, res, next) => {
  let token = req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null;
  if(token){
    try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if(!req.user){
        return res.status(401).json({error: 'Not authorized, user not found'});
      }
      next();

    } catch (error) {
      res.status(401).json({error: 'Not authorized, token failed'});
    }
  }
  else{
    res.status(401).json({error: 'Not authorized, no token'});
  }
};


const admin = (req, res, next) => {
  if(req.user && req.user.role === 'admin'){
    next();
  } else {
    res.status(401).json({error: 'Not authorized, user is not an admin'});
  }
};

module.exports = { protect, admin };
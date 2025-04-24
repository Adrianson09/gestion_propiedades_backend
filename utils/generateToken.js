const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

module.exports = generateToken;

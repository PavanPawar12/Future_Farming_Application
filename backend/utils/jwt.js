const jwt = require('jsonwebtoken');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const sendTokenCookie = (res, user) => {
  const token = signToken(user._id, user.role);
  const days = Number(process.env.COOKIE_EXPIRE_DAYS || 7);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
  });
  return token;
};

module.exports = { signToken, sendTokenCookie };

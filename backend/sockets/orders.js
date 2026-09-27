const jwt = require('jsonwebtoken');
const User = require('../models/User');

function initSockets(io) {
  io.on('connection', async (socket) => {
    // try auth from cookie-less handshake: client sends token via auth payload
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          socket.join(`user:${user._id}`);
          if (user.role === 'admin') socket.join('admin');
          socket.data.userId = String(user._id);
        }
      }
    } catch { /* anonymous socket */ }

    socket.on('join-admin', () => socket.join('admin'));
    socket.on('join-user', (userId) => { if (userId) socket.join(`user:${userId}`); });

    socket.on('disconnect', () => {});
  });
  return io;
}

module.exports = initSockets;

require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { setupCloudinary } = require('./config/cloudinary');
const initSockets = require('./sockets/orders');

const PORT = process.env.PORT || 5000;

setupCloudinary();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: [process.env.CLIENT_URL || 'http://localhost:5173'], credentials: true },
});
app.set('io', io);
initSockets(io);

connectDB()
  .then(() => server.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => { console.error(err); process.exit(1); });

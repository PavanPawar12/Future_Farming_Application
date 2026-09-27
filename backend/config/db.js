const dns = require('dns');
const mongoose = require('mongoose');

const connectDB = async () => {
  // Local-dev workaround: some ISP/router DNS servers refuse SRV lookups
  // which breaks mongodb+srv strings. Set DNS_SERVERS=8.8.8.8,1.1.1.1 in .env
  // to make Node resolve via public DNS. Leave unset in production.
  if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
  }
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined');
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;

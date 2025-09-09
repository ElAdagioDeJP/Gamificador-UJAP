
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Importa y conecta la lógica de duelos
const setupDuelSocket = require('./duelManager');

(async () => {
  try {
    await connectDB();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

  // Inicializa la lógica de duelos
  setupDuelSocket(io);

    // Aquí se agregará la lógica de duelos con Socket.IO
    // Ejemplo:
    // io.on('connection', (socket) => {
    //   console.log('Usuario conectado:', socket.id);
    // });

    httpServer.listen(PORT, HOST, () => {
      const nets = os.networkInterfaces();
      const addrs = [];
      Object.values(nets).forEach(list => list && list.forEach(i => {
        if (i.family === 'IPv4' && !i.internal) addrs.push(i.address);
      }));
      console.log('[STARTUP] API y Socket.IO escuchando en:');
      console.log(`  -> http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
      addrs.forEach(a => console.log(`  -> http://${a}:${PORT}`));
      console.log(`  Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('Shutting down server...');
      httpServer.close(() => process.exit(0));
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

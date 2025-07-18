import { Server } from 'socket.io';
import { initChatEvents } from './ws-events/chat_events.js';

export default async (expressServer, expressApp) => {
  console.log('WS: Start loading...');
  const io = new Server(expressServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      // allowedHeaders: ['my-custom-header'],
      credentials: true,
    },
    pingInterval: 2000,
    pingTimeout: 2000,
  });

  expressApp.use((req, res, next) => {
    req.io = io;
    next();
  });

  initChatEvents(io.of('/chat'));
};

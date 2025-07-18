import jwt from 'jsonwebtoken';
import pkg from 'mongoose';
import { jwtSecretKey } from '../../config/index.js';
import { User, Room } from '../../models/index.js';
import Role from '../../models/role.js';

// eslint-disable-next-line import/prefer-default-export
export const initChatEvents = (io) => {
  io.on('connection', (socket) => {
    const { room_id: roomId } = socket.handshake.query;
    if (roomId) {
      socket.join(roomId);
    }
    socket.on('disconnect', () => {
      //
    });
  });

  const getAllClients = (room) => {
    const clients = io.adapter.rooms.get(room);
    const clientData = [];
    clients.forEach((clientId) => {
      // this is the socket of each client in the room.
      const clientSocket = io.sockets.get(clientId);
      clientData.push({
        id: clientSocket.id,
        username: clientSocket.user.name,
      });
    });
    return clientData;
  };

  io.adapter.on('join-room', async (room, id) => {
    if (room === id) return;
    const currentClient = io.sockets.get(id);
    let hasSAdmin = false;
    try {
      const sAdminRole = await Role.findOne({ name: 'SAdmin' });
      if (!sAdminRole) {
        console.log('SAdmin role not found');
        return;
      }

      if (sAdminRole && currentClient.user && currentClient.user.roles) {
        const sAdminRoleId = sAdminRole._id.toString();
        hasSAdmin = currentClient.user.roles.some(role => {
          if (typeof role === 'string') {
            return role === sAdminRoleId;
          }
          if (role && (role._id || role.id)) {
            return (role._id || role.id).toString() === sAdminRoleId;
          }
          return false;
        });
      }
    } catch (e) {
      console.error('Error checking SAdmin role:', e);
    }

    const roomData = await Room.findOne({ _id: room });

    const isInClass = currentClient.user.classes.some(cls => cls._id.toString() === roomData.class.toString());

    if (!hasSAdmin && !isInClass) {
      console.log('kicked from room', room, id);
      currentClient.leave(room);
    
      io.to(id).emit('leave_room_user', {
        msg: `${currentClient.user.name} leave this group`,
        room,
        id,
      });
      return;
    }
    console.log('new_room_user', {
      room, id,
      hasSAdmin,
      isInClass,
    });
    io.to(room).emit('new_room_user', {
      msg: `${currentClient.user.name} joined this group`,
      room,
      id,
      clients: getAllClients(room),
    });
  });

  io.adapter.on('leave-room', (room, id) => {
    if (room === id) return;
    const currentClient = io.sockets.get(id);
    io.to(room).emit('leave_room_user', {
      msg: `${currentClient.user.name} leave this group`,
      room,
      id,
      clients: getAllClients(room),
    });
  });

  io.use(async (socket, next) => {
    const { Types } = pkg;
    const { verify } = jwt;
    const { token } = socket.handshake.auth;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      socket.user = verify(token, jwtSecretKey);
      if (!Types.ObjectId.isValid(socket.user._id)) return next(new Error('Invalid user id'));

      const user = await User.findOne(
        { _id: socket.user._id, isVerified: true, isActivated: true },
      ).populate({
        path: 'classes',
        select: 'name id',
      })
        .catch((err) => next(new Error(err.message)));

      if (!user) return next(new Error('User not found'));

      // const tokenExists = await Token.exists({ userId: socket.user._id, status: true })
      //   .catch((err) => next(new Error(err.message)));
      //
      // if (!tokenExists) return next(new Error('Token not found'));

      socket.user = user;

      next();
    } catch (err) {
      return next(new Error(err.message));
    }
    return next();
  });
  console.log('WS: Chat events loaded');
};

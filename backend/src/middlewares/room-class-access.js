import Room from '../models/room.js';
import Class from '../models/class.js';

import Role from '../models/role.js';

export default async function roomClassAccess(req, res, next) {
  const roomId = req.params.room_id || req.body.room_id || req.body.roomId;
  if (!roomId) {
    return res.status(400).json({ message: 'Room ID is required' });
  }
  const room = await Room.findById(roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  // If no class assigned, allow anyone
  if (!room.class) {
    return next();
  }

  // Get sAdmin role record from db
  const sAdminRole = await Role.findOne({ name: 'SAdmin' });
  let hasSAdmin = false;
  if (sAdminRole && req.user && req.user.roles) {
    const sAdminRoleId = sAdminRole._id.toString();
    if (Array.isArray(req.user.roles)) {
      hasSAdmin = req.user.roles.some(role => {
        if (typeof role === 'string') {
          return role === sAdminRoleId;
        }
        if (role && (role._id || role.id)) {
          return (role._id || role.id).toString() === sAdminRoleId;
        }
        return false;
      });
    } else if (typeof req.user.roles === 'string') {
      hasSAdmin = req.user.roles === sAdminRoleId;
    } else if (req.user.roles && (req.user.roles._id || req.user.roles.id)) {
      hasSAdmin = (req.user.roles._id || req.user.roles.id).toString() === sAdminRoleId;
    }
  }
  if (hasSAdmin) {
    return next();
  }

  // Check if user is a student in the class
  const classDoc = await Class.findById(room.class);
  if (!classDoc) {
    return res.status(404).json({ message: 'Class not found' });
  }
  const userId = req.user && req.user._id ? req.user._id.toString() : null;
  const isStudent = classDoc.students.some(
    s => s.user && s.user.toString() === userId && s.status === 'enrolled'
  );
  if (!isStudent) {
    return res.status(403).json({ message: 'Access denied: not a student in this class' });
  }
  next();
} 
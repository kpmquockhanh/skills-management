import { Router } from 'express';
import { auth, imageUpload, roomClassAccess } from '../../middlewares/index.js';
import {
  getMessages, sendMessage, createRoom, getRooms, deleteRoom, updateRoom, assignClassToRoom,
} from '../../controllers/chat/chat.controller.js';

const router = Router();

router.get('/:room_id', auth, roomClassAccess, getMessages);
router.post('/:room_id', auth, roomClassAccess, sendMessage);
router.post('/', auth, createRoom);
router.get('/', auth, getRooms);
router.delete('/:room_id', auth, deleteRoom);
router.put('/:room_id', auth, imageUpload(2000000), updateRoom);
// Endpoint to assign a class to a room (one-time only)
router.post('/:room_id/assign-class', auth, assignClassToRoom);

export default router;

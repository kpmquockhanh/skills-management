import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUserManagement,
  getAllClasses,
  assignUserToClass,
  getUserClasses,
} from '../../controllers/user/index.js';
import { auth } from '../../middlewares/index.js';
import { can } from '../../middlewares/auth/check-permission.js';

const router = Router();

// User Management Routes
router.get('/', auth, can('users'), can('classes'), can('skills'), getAllUsers);
router.post('/', auth, can('users'), can('classes'), can('skills'), createUser);

router.get('/classes', auth, can('classes'), can('users'), can('skills'), getAllClasses);

router.get('/:userId', auth, can('users'), can('classes'), can('skills'), getUserById);
router.put('/:userId', auth, can('users'), can('classes'), can('skills'), updateUser);
router.delete('/:userId', auth, can('users'), can('classes'), can('skills'), deleteUserManagement);

// // Class Management Routes
router.post('/:userId/classes', auth, can('classes'), can('users'), can('skills'), assignUserToClass);
router.get('/:userId/classes', auth, can('classes'), can('users'), can('skills'), getUserClasses);


export default router; 
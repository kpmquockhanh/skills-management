import { Router } from 'express';
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  enrollStudent,
  removeStudent,
  updateStudentProgress,
  getClassesBySkillTree,
  getClassesByTeacher,
  getClassesByStudent,
  assignTeacherToClass,
  removeTeacherFromClass,
} from '../../controllers/class/class.controller.js';
import { auth } from '../../middlewares/index.js';
import { can } from '../../middlewares/auth/check-permission.js';

const router = Router();

// Public routes (if needed)
router.get('/skill-tree/:skillTreeId', getClassesBySkillTree);

// Protected routes
router.get('/', auth, getAllClasses);
router.get('/teacher/:teacherId', auth, getClassesByTeacher);
router.get('/student/:studentId', auth, getClassesByStudent);
router.get('/:classId', auth, getClassById);

// Class management routes (require permissions)
router.post('/', auth, can('permissions'), createClass);
router.put('/:classId', auth, can('permissions'), updateClass);
router.delete('/:classId', auth, can('permissions'), deleteClass);

// Student enrollment routes
router.post('/:classId/enroll', auth, enrollStudent);
router.delete('/:classId/students/:userId', auth, removeStudent);
router.put('/:classId/students/:userId/progress', auth, updateStudentProgress);

// Teacher assignment routes
router.post('/:classId/teachers', auth, can('permissions'), assignTeacherToClass);
router.delete('/:classId/teachers/:teacherId', auth, can('permissions'), removeTeacherFromClass);

export default router; 
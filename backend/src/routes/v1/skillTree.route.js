import { Router } from 'express';
import {
  getAllSkillTrees,
  getSkillTreeById,
  createSkillTree,
  updateSkillTree,
  deleteSkillTree,
  addSkillToTree,
  removeSkillFromTree,
  addLearningPath,
  removeLearningPath,
  getSkillTreesByType,
  getSkillTreesByCreator,
  getSkillTreesBySkill,
  searchSkillTrees,
  getSkillTreeStats,
  bulkAssignSkills,
  bulkRemoveSkills,
  getSkillAssignments,
  getAllSkillAssignments,
} from '../../controllers/skillTree/skillTree.controller.js';
import { auth } from '../../middlewares/index.js';
import { can } from '../../middlewares/auth/check-permission.js';

const router = Router();

// Public routes
router.get('/search', searchSkillTrees);
router.get('/type/:type', getSkillTreesByType);

// Protected routes
router.get('/', auth, getAllSkillTrees);
router.get('/creator/:creatorId', auth, getSkillTreesByCreator);
router.get('/skill/:skillId', auth, getSkillTreesBySkill);
router.get('/:treeId', auth, getSkillTreeById);
router.get('/:treeId/stats', auth, getSkillTreeStats);

// Skill tree management routes (require permissions)
router.post('/', auth, can('permissions'), createSkillTree);
router.put('/:treeId', auth, can('permissions'), updateSkillTree);
router.delete('/:treeId', auth, can('permissions'), deleteSkillTree);

// Skill management within tree
router.post('/:treeId/skills', auth, can('permissions'), addSkillToTree);
router.delete('/:treeId/skills/:skillId', auth, can('permissions'), removeSkillFromTree);

// Bulk skill assignment
router.post('/:treeId/assign-skills', auth, can('permissions'), bulkAssignSkills);
router.delete('/:treeId/assign-skills', auth, can('permissions'), bulkRemoveSkills);
router.get('/:treeId/assignments', auth, getSkillAssignments);

// Global skill assignments
router.get('/assignments/all', auth, getAllSkillAssignments);

// Learning path management
router.post('/:treeId/paths', auth, can('permissions'), addLearningPath);
router.delete('/:treeId/paths/:pathName', auth, can('permissions'), removeLearningPath);

export default router; 
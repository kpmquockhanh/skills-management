import { Router } from 'express';
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  addPrerequisite,
  removePrerequisite,
  addRelatedSkill,
  removeRelatedSkill,
  getSkillsByCategory,
  getSkillsByLevel,
  getPopularSkills,
  getHighDemandSkills,
  searchSkills,
  getSkillCategories,
} from '../../controllers/skill/skill.controller.js';
import { auth } from '../../middlewares/index.js';
import { can } from '../../middlewares/auth/check-permission.js';

const router = Router();

// Public routes
router.get('/categories', getSkillCategories);
router.get('/popular', getPopularSkills);
router.get('/high-demand', getHighDemandSkills);
router.get('/search', searchSkills);
router.get('/category/:category', getSkillsByCategory);
router.get('/level/:level', getSkillsByLevel);

// Protected routes
router.get('/', auth, getAllSkills);
router.get('/:skillId', auth, getSkillById);

// Skill management routes (require permissions)
router.post('/', auth, can('permissions'), createSkill);
router.put('/:skillId', auth, can('permissions'), updateSkill);
router.delete('/:skillId', auth, can('permissions'), deleteSkill);

// Prerequisite management routes
router.post('/:skillId/prerequisites', auth, can('permissions'), addPrerequisite);
router.delete('/:skillId/prerequisites/:prerequisiteId', auth, can('permissions'), removePrerequisite);

// Related skill management routes
router.post('/:skillId/related', auth, can('permissions'), addRelatedSkill);
router.delete('/:skillId/related/:relatedSkillId', auth, can('permissions'), removeRelatedSkill);

export default router; 
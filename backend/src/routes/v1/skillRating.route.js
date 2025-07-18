import express from 'express';
import {
  createOrUpdateSkillRating,
  getUserSkillRatings,
  getSkillRatings,
  archiveUserSkill,
  unarchiveUserSkill,
  getArchivedUserSkills,
  addAssessment,
  addNote,
  updateSkillProgress,
  getAllCompletedSkills
} from '../../controllers/skill/skillRating.controller.js';
import { auth } from '../../middlewares/index.js';

const router = express.Router();

// Create or update skill rating
router.post('/rate', auth, createOrUpdateSkillRating);

// Archive a skill for a user
router.post('/user/:userId/skill/:skillId/archive', auth, archiveUserSkill);

// Unarchive a skill for a user
router.post('/user/:userId/skill/:skillId/unarchive', auth, unarchiveUserSkill);

// Get archived skills for a user
router.get('/user/:userId/archived', auth, getArchivedUserSkills);

// Add assessment to a skill rating
router.post('/rating/:ratingId/assessment', auth, addAssessment);

// Add note to a skill rating
router.post('/user/:userId/skill/:skillId/note', auth, addNote);

// Update skill progress
router.put('/user/:userId/skill/:skillId/progress', auth, updateSkillProgress);

// Get skill ratings for a user
router.get('/user/:userId', auth, getUserSkillRatings);

// Get skill ratings for a specific skill
router.get('/skill/:skillId', auth, getSkillRatings);

// Get all completed skills from all users
router.get('/completed/all', auth, getAllCompletedSkills);

export default router; 
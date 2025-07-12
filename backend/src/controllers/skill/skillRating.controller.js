import { UserSkillRating, Skill, User, SkillTree, Class } from '../../models/index.js';
import responseHelper from '../../utils/helpers/response-helper.js';

// Create or update a skill rating for a user
export const createOrUpdateSkillRating = async (req, res) => {
  try {
    const { userId, skillId, rating, progress, status, skillTreeId, classId, notes } = req.body;
    const raterId = req.user._id;

    // Validate required fields
    if (!userId || !skillId || !rating || !classId) {
      return res.status(400).json(responseHelper(400, { 
        error: 'User ID, Skill ID, Class ID, and Rating are required' 
      }));
    }

    // Validate rating range
    if (rating < 1 || rating > 10) {
      return res.status(400).json(responseHelper(400, { 
        error: 'Rating must be between 1 and 10' 
      }));
    }

    // Check if user, skill, and class exist
    const [user, skill, classDoc] = await Promise.all([
      User.findById(userId),
      Skill.findById(skillId),
      Class.findById(classId)
    ]);

    if (!user) {
      return res.status(404).json(responseHelper(404, { 
        error: 'User not found' 
      }));
    }

    if (!skill) {
      return res.status(404).json(responseHelper(404, { 
        error: 'Skill not found' 
      }));
    }

    if (!classDoc) {
      return res.status(404).json(responseHelper(404, { 
        error: 'Class not found' 
      }));
    }

    // Check if skill tree exists if provided
    if (skillTreeId) {
      const skillTree = await SkillTree.findById(skillTreeId);
      if (!skillTree) {
        return res.status(404).json(responseHelper(404, { 
          error: 'Skill tree not found' 
        }));
      }
    }

    // Find existing rating by user, skill, and class combination
    let skillRating = await UserSkillRating.findOne({ 
      user: userId, 
      skill: skillId,
      class: classId
    });

    if (skillRating) {
      // Update existing rating
      skillRating.rating = rating;
      skillRating.ratedBy = raterId;
      
      if (progress !== undefined) {
        skillRating.progress = Math.min(100, Math.max(0, progress));
      }
      
      if (status) {
        skillRating.status = status;
      }
      
      if (skillTreeId) {
        skillRating.skillTree = skillTreeId;
      }

      // Add note if provided
      if (notes) {
        skillRating.notes.push({
          content: notes,
          author: raterId,
          createdAt: new Date()
        });
      }

      await skillRating.save();
    } else {
      // Create new rating
      const ratingData = {
        user: userId,
        skill: skillId,
        class: classId,
        rating,
        ratedBy: raterId,
        progress: progress || 0,
        status: status || 'active',
        startedAt: new Date(),
        lastPracticedAt: new Date()
      };

      if (skillTreeId) {
        ratingData.skillTree = skillTreeId;
      }

      if (notes) {
        ratingData.notes = [{
          content: notes,
          author: raterId,
          createdAt: new Date()
        }];
      }

      skillRating = new UserSkillRating(ratingData);
      await skillRating.save();
    }

    // Populate references for response
    await skillRating.populate([
      { path: 'user', select: 'name username email type' },
      { path: 'skill', select: 'name description category level color icon' },
      { path: 'skillTree', select: 'name description' },
      { path: 'class', select: 'name code' },
      { path: 'ratedBy', select: 'name username' }
    ]);

    return res.json(responseHelper(200, { 
      message: 'Skill rating saved successfully',
      skillRating 
    }));

  } catch (error) {
    console.error('Error in createOrUpdateSkillRating:', error);
    return res.status(500).json(responseHelper(500, { 
      error: 'Internal server error' 
    }));
  }
};

// Get skill ratings for a user
export const getUserSkillRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, isArchived, skillTreeId, classId, page = 1, limit = 10 } = req.query;

    console.log({userId, status, isArchived, skillTreeId, classId, page, limit});
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(responseHelper(404, { 
        error: 'User not found' 
      }));
    }

    // Build query options
    const options = {};
    if (status) options.status = status;
    if (isArchived !== undefined) options.isArchived = isArchived === 'true';
    if (skillTreeId) options.skillTree = skillTreeId;
    if (classId) options.class = classId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get ratings with pagination
    const [ratings, total] = await Promise.all([
      UserSkillRating.findByUser(userId, options)
        .skip(skip)
        .limit(parseInt(limit)),
      UserSkillRating.countDocuments({ user: userId, ...options })
    ]);

    // Get user skill statistics
    const statsResult = await UserSkillRating.getUserSkillStats(userId);
    const stats = statsResult.length > 0 ? statsResult[0] : {
      totalSkills: 0,
      activeSkills: 0,
      completedSkills: 0,
      archivedSkills: 0,
      averageRating: 0,
      averageProgress: 0,
      totalTimeSpent: 0
    };

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    return res.json(responseHelper(200, { 
      message: 'User skill ratings retrieved successfully',
      ratings, 
      stats, 
      pagination 
    }));

  } catch (error) {
    console.error('Error in getUserSkillRatings:', error);
    return res.status(500).json(responseHelper(500, { 
      error: 'Internal server error' 
    }));
  }
};

// Get skill ratings for a specific skill
export const getSkillRatings = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { status, isArchived, page = 1, limit = 10 } = req.query;

    // Validate skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json(responseHelper(404, { 
        error: 'Skill not found' 
      }));
    }

    // Build query options
    const options = {};
    if (status) options.status = status;
    if (isArchived !== undefined) options.isArchived = isArchived === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get ratings with pagination
    const [ratings, total] = await Promise.all([
      UserSkillRating.findBySkill(skillId, options)
        .skip(skip)
        .limit(parseInt(limit)),
      UserSkillRating.countDocuments({ skill: skillId, ...options })
    ]);

    // Get skill statistics
    const statsResult = await UserSkillRating.getSkillStats(skillId);
    const stats = statsResult.length > 0 ? statsResult[0] : {
      totalUsers: 0,
      averageRating: 0,
      averageProgress: 0,
      completedUsers: 0,
      archivedUsers: 0
    };

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    return res.json(responseHelper(200, { 
      message: 'Skill ratings retrieved successfully',
      ratings, 
      stats, 
      pagination 
    }));

  } catch (error) {
    console.error('Error in getSkillRatings:', error);
    return res.status(500).json(responseHelper(500, { 
      error: 'Internal server error' 
    }));
  }
};

// Archive a skill for a user
export const archiveUserSkill = async (req, res) => {
  try {
    const { userId, skillId } = req.params;
    const { reason, notes } = req.body;
    const raterId = req.user._id;

    // Validate required fields
    if (!reason) {
      return res.status(400).json(responseHelper(400, { 
        error: 'Archive reason is required' 
      }));
    }

    // Find the skill rating
    const skillRating = await UserSkillRating.findOne({ user: userId, skill: skillId });

    if (!skillRating) {
      return responseHelper(res, 404, getText('en', '00001'), {
        en: 'Skill rating not found',
        tr: 'Beceri değerlendirmesi bulunamadı'
      });
    }

    // Archive the skill
    await skillRating.archiveSkill(reason, notes);

    // Add note about archiving
    skillRating.notes.push({
      content: `Skill archived: ${reason}. ${notes || ''}`,
      author: raterId,
      createdAt: new Date()
    });

    await skillRating.save();

    // Populate references for response
    await skillRating.populate([
      { path: 'user', select: 'name username email type' },
      { path: 'skill', select: 'name description category level color icon' },
      { path: 'ratedBy', select: 'name username' }
    ]);

    return res.json(responseHelper(200, { 
      message: 'Skill archived successfully',
      skillRating 
    }));

  } catch (error) {
    console.error('Error in archiveUserSkill:', error);
    return res.status(500).json(responseHelper(500, { 
      error: 'Internal server error' 
    }));
  }
};

// Unarchive a skill for a user
export const unarchiveUserSkill = async (req, res) => {
  try {
    const { userId, skillId } = req.params;
    const raterId = req.user._id;

    // Find the skill rating
    const skillRating = await UserSkillRating.findOne({ user: userId, skill: skillId });

    if (!skillRating) {
      return responseHelper(res, 404, getText('en', '00001'), {
        en: 'Skill rating not found',
        tr: 'Beceri değerlendirmesi bulunamadı'
      });
    }

    if (!skillRating.isArchived) {
      return res.status(400).json(responseHelper(400, { 
        error: 'Skill is not archived' 
      }));
    }

    // Unarchive the skill
    await skillRating.unarchiveSkill();

    // Add note about unarchiving
    skillRating.notes.push({
      content: 'Skill unarchived',
      author: raterId,
      createdAt: new Date()
    });

    await skillRating.save();

    // Populate references for response
    await skillRating.populate([
      { path: 'user', select: 'name username email type' },
      { path: 'skill', select: 'name description category level color icon' },
      { path: 'ratedBy', select: 'name username' }
    ]);

    return res.json(responseHelper(200, { 
      message: 'Skill unarchived successfully',
      skillRating 
    }));

  } catch (error) {
    console.error('Error in unarchiveUserSkill:', error);
    return res.status(500).json(responseHelper(500, { 
      error: 'Internal server error' 
    }));
  }
};

// Get archived skills for a user
export const getArchivedUserSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return responseHelper(res, 404, getText('en', '00001'), {
        en: 'User not found',
        tr: 'Kullanıcı bulunamadı'
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get archived skills with pagination
    const [archivedSkills, total] = await Promise.all([
      UserSkillRating.findArchivedByUser(userId)
        .skip(skip)
        .limit(parseInt(limit)),
      UserSkillRating.countDocuments({ user: userId, isArchived: true })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    return res.json(responseHelper(200, { 
      message: 'Archived skills retrieved successfully',
      archivedSkills, 
      pagination 
    }));

  } catch (error) {
    console.error('Error in getArchivedUserSkills:', error);
    return res.status(500).json(responseHelper(500, { 
      error: 'Internal server error' 
    }));
  }
};

// Add assessment to a skill rating
export const addAssessment = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { title, score, maxScore = 100, type, feedback } = req.body;
    const raterId = req.user._id;

    // Validate required fields
    if (!title || score === undefined || !type) {
      return res.status(400).json(responseHelper(400, { 
        error: 'Title, score, and type are required' 
      }));
    }

    // Validate score range
    if (score < 0 || score > maxScore) {
      return res.status(400).json(responseHelper(400, { 
        error: 'Score must be between 0 and max score' 
      }));
    }

    // Find the skill rating by ID
    const skillRating = await UserSkillRating.findById(ratingId);

    if (!skillRating) {
      return res.status(404).json(responseHelper(404, { 
        error: 'Skill rating not found' 
      }));
    }

    // Add assessment
    const assessmentData = {
      title,
      score,
      maxScore,
      type,
      feedback,
      completedAt: new Date()
    };

    await skillRating.addAssessment(assessmentData);

    // Update progress based on assessment score
    const progressPercentage = (score / maxScore) * 100;
    if (progressPercentage > skillRating.progress) {
      await skillRating.updateProgress(progressPercentage);
    }

    // Populate references for response
    await skillRating.populate([
      { path: 'user', select: 'name username email type' },
      { path: 'skill', select: 'name description category level color icon' },
      { path: 'ratedBy', select: 'name username' }
    ]);

    return res.json(responseHelper(200, { 
      message: 'Assessment added successfully',
      skillRating 
    }));

  } catch (error) {
    console.error('Error in addAssessment:', error);
    return res.status(500).json(responseHelper(500, { 
      error: 'Internal server error' 
    }));
  }
};

// Add note to a skill rating
export const addNote = async (req, res) => {
  try {
    const { userId, skillId } = req.params;
    const { content, isPrivate = false } = req.body;
    const authorId = req.user._id;

    // Validate required fields
    if (!content) {
      return res.status(400).json(responseHelper(400, { 
        error: 'Note content is required' 
      }));
    }

    // Find the skill rating
    const skillRating = await UserSkillRating.findOne({ user: userId, skill: skillId });

    if (!skillRating) {
      return res.status(404).json(responseHelper(404, { 
        error: 'Skill rating not found' 
      }));
    }

    // Add note
    const noteData = {
      content,
      author: authorId,
      isPrivate,
      createdAt: new Date()
    };

    await skillRating.addNote(noteData);

    // Populate references for response
    await skillRating.populate([
      { path: 'user', select: 'name username email type' },
      { path: 'skill', select: 'name description category level color icon' },
      { path: 'notes.author', select: 'name username' }
    ]);

    return res.json(responseHelper(200, { 
      message: 'Note added successfully',
      skillRating 
    }));

  } catch (error) {
    console.error('Error in addNote:', error);
    return res.status(500).json(responseHelper(500, { 
      error: 'Internal server error' 
    }));
  }
};

// Update skill progress
export const updateSkillProgress = async (req, res) => {
  try {
    const { userId, skillId } = req.params;
    const { progress, timeSpent = 0 } = req.body;
    const raterId = req.user._id;

    // Validate required fields
    if (progress === undefined) {
      return res.status(400).json(responseHelper(400, { 
        error: 'Progress is required' 
      }));
    }

    // Validate progress range
    if (progress < 0 || progress > 100) {
      return res.status(400).json(responseHelper(400, { 
        error: 'Progress must be between 0 and 100' 
      }));
    }

    // Find the skill rating
    const skillRating = await UserSkillRating.findOne({ user: userId, skill: skillId });

    if (!skillRating) {
      return res.status(404).json(responseHelper(404, { 
        error: 'Skill rating not found' 
      }));
    }

    // Update progress
    await skillRating.updateProgress(progress, timeSpent);

    // Add note about progress update
    skillRating.notes.push({
      content: `Progress updated to ${progress}%`,
      author: raterId,
      createdAt: new Date()
    });

    await skillRating.save();

    // Populate references for response
    await skillRating.populate([
      { path: 'user', select: 'name username email type' },
      { path: 'skill', select: 'name description category level color icon' },
      { path: 'ratedBy', select: 'name username' }
    ]);

    return res.json(responseHelper(200, { 
      message: 'Progress updated successfully',
      skillRating 
    }));

  } catch (error) {
    console.error('Error in updateSkillProgress:', error);
    return res.status(500).json(responseHelper(500, { 
      error: 'Internal server error' 
    }));
  }
}; 
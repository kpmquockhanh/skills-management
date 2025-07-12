import { Skill } from '../../models/index.js';
import responseHelper from '../../utils/helpers/response-helper.js';
import getText from '../../utils/lang/get-text.js';

// Get all skills with pagination and filters
export const getAllSkills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      subcategory,
      level,
      type,
      status,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Subcategory filter
    if (subcategory) {
      query.subcategory = subcategory;
    }

    // Level filter
    if (level) {
      query.level = level;
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const skills = await Skill.find(query)
      .populate('createdBy', 'name email photoUrl')
      .populate('prerequisites', 'name description level')
      .populate('relatedSkills', 'name description level')
      .populate('thumbnail', 'url')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Skill.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: totalPages
    };

    res.json(responseHelper(200, {
      skills,
      pagination
    }));
  } catch (error) {
    console.error('Error getting skills:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get skill by ID
export const getSkillById = async (req, res) => {
  try {
    const { skillId } = req.params;

    const skill = await Skill.findById(skillId)
      .populate('createdBy', 'name email photoUrl')
      .populate('prerequisites', 'name description level category')
      .populate('relatedSkills', 'name description level category')
      .populate('thumbnail', 'url')
      .lean();

    if (!skill) {
      return res.status(404).json(responseHelper(404, { error: 'Skill not found' }));
    }

    res.json(responseHelper(200, { skill }));
  } catch (error) {
    console.error('Error getting skill:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Create new skill
export const createSkill = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      subcategory,
      level,
      type,
      icon,
      color,
      learningObjectives,
      keyConcepts,
      estimatedTime,
      difficulty,
      marketDemand,
      salaryImpact,
      tags,
      content
    } = req.body;

    // Check if skill name already exists
    const existingSkill = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingSkill) {
      return res.status(400).json(responseHelper(400, { error: 'Skill name already exists' }));
    }

    const skillData = new Skill({
      name,
      description,
      shortDescription,
      category,
      subcategory,
      level,
      type,
      icon,
      color,
      learningObjectives,
      keyConcepts,
      estimatedTime,
      difficulty,
      marketDemand,
      salaryImpact,
      tags,
      content,
      createdBy: req.user._id,
      stats: {
        totalUsers: 0,
        averageProgress: 0,
        completionRate: 0,
        averageRating: 0,
        totalRatings: 0
      }
    });

    await skillData.save();

    const populatedSkill = await Skill.findById(skillData._id)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .lean();

    res.status(201).json(responseHelper(201, { skill: populatedSkill }));
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Update skill
export const updateSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const updateData = req.body;

    // If name is being updated, check for uniqueness
    if (updateData.name) {
      const existingSkill = await Skill.findOne({ 
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: skillId }
      });
      if (existingSkill) {
        return res.status(400).json(responseHelper(400, { error: 'Skill name already exists' }));
      }
    }

    const skill = await Skill.findByIdAndUpdate(
      skillId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email photoUrl')
      .populate('prerequisites', 'name description level')
      .populate('relatedSkills', 'name description level')
      .populate('thumbnail', 'url')
      .lean();

    if (!skill) {
      return res.status(404).json(responseHelper(404, { error: 'Skill not found' }));
    }

    res.json(responseHelper(200, { skill }));
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Delete skill
export const deleteSkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    const skill = await Skill.findByIdAndDelete(skillId);

    if (!skill) {
      return res.status(404).json(responseHelper(404, { error: 'Skill not found' }));
    }

    res.json(responseHelper(200, { message: 'Skill deleted successfully' }));
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Add prerequisite to skill
export const addPrerequisite = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { prerequisiteId } = req.body;

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json(responseHelper(404, { error: 'Skill not found' }));
    }

    // Check if prerequisite exists
    const prerequisite = await Skill.findById(prerequisiteId);
    if (!prerequisite) {
      return res.status(404).json(responseHelper(404, { error: 'Prerequisite skill not found' }));
    }

    // Check for circular dependencies
    if (skillId === prerequisiteId) {
      return res.status(400).json(responseHelper(400, { error: 'Skill cannot be its own prerequisite' }));
    }

    await skill.addPrerequisite(prerequisiteId);

    const updatedSkill = await Skill.findById(skillId)
      .populate('createdBy', 'name email photoUrl')
      .populate('prerequisites', 'name description level')
      .populate('relatedSkills', 'name description level')
      .populate('thumbnail', 'url')
      .lean();

    res.json(responseHelper(200, { skill: updatedSkill }));
  } catch (error) {
    console.error('Error adding prerequisite:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Remove prerequisite from skill
export const removePrerequisite = async (req, res) => {
  try {
    const { skillId, prerequisiteId } = req.params;

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json(responseHelper(404, { error: 'Skill not found' }));
    }

    await skill.removePrerequisite(prerequisiteId);

    const updatedSkill = await Skill.findById(skillId)
      .populate('createdBy', 'name email photoUrl')
      .populate('prerequisites', 'name description level')
      .populate('relatedSkills', 'name description level')
      .populate('thumbnail', 'url')
      .lean();

    res.json(responseHelper(200, { skill: updatedSkill }));
  } catch (error) {
    console.error('Error removing prerequisite:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Add related skill
export const addRelatedSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { relatedSkillId } = req.body;

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json(responseHelper(404, { error: 'Skill not found' }));
    }

    // Check if related skill exists
    const relatedSkill = await Skill.findById(relatedSkillId);
    if (!relatedSkill) {
      return res.status(404).json(responseHelper(404, { error: 'Related skill not found' }));
    }

    await skill.addRelatedSkill(relatedSkillId);

    const updatedSkill = await Skill.findById(skillId)
      .populate('createdBy', 'name email photoUrl')
      .populate('prerequisites', 'name description level')
      .populate('relatedSkills', 'name description level')
      .populate('thumbnail', 'url')
      .lean();

    res.json(responseHelper(200, { skill: updatedSkill }));
  } catch (error) {
    console.error('Error adding related skill:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Remove related skill
export const removeRelatedSkill = async (req, res) => {
  try {
    const { skillId, relatedSkillId } = req.params;

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json(responseHelper(404, { error: 'Skill not found' }));
    }

    await skill.removeRelatedSkill(relatedSkillId);

    const updatedSkill = await Skill.findById(skillId)
      .populate('createdBy', 'name email photoUrl')
      .populate('prerequisites', 'name description level')
      .populate('relatedSkills', 'name description level')
      .populate('thumbnail', 'url')
      .lean();

    res.json(responseHelper(200, { skill: updatedSkill }));
  } catch (error) {
    console.error('Error removing related skill:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get skills by category
export const getSkillsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const skills = await Skill.findByCategory(category)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Skill.countDocuments({ category });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json(responseHelper(200, {
      skills,
      pagination
    }));
  } catch (error) {
    console.error('Error getting skills by category:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get skills by level
export const getSkillsByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const skills = await Skill.findByLevel(level)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Skill.countDocuments({ level });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json(responseHelper(200, {
      skills,
      pagination
    }));
  } catch (error) {
    console.error('Error getting skills by level:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get popular skills
export const getPopularSkills = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const skills = await Skill.findPopular(parseInt(limit))
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .lean();

    res.json(responseHelper(200, { skills }));
  } catch (error) {
    console.error('Error getting popular skills:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get high-demand skills
export const getHighDemandSkills = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const skills = await Skill.findHighDemand(parseInt(limit))
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .lean();

    res.json(responseHelper(200, { skills }));
  } catch (error) {
    console.error('Error getting high-demand skills:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Search skills
export const searchSkills = async (req, res) => {
  try {
    const { q } = req.query;
    const { page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json(responseHelper(400, { error: 'Search query is required' }));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const skills = await Skill.searchSkills(q)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Skill.countDocuments({ $text: { $search: q } });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json(responseHelper(200, {
      skills,
      pagination
    }));
  } catch (error) {
    console.error('Error searching skills:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get skill categories
export const getSkillCategories = async (req, res) => {
  try {
    const categories = await Skill.distinct('category');
    const subcategories = await Skill.distinct('subcategory');

    res.json(responseHelper(200, {
      categories,
      subcategories: subcategories.filter(sub => sub) // Remove null/undefined values
    }));
  } catch (error) {
    console.error('Error getting skill categories:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
}; 
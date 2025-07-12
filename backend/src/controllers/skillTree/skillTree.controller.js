import { SkillTree, Skill } from '../../models/index.js';
import responseHelper from '../../utils/helpers/response-helper.js';
import getText from '../../utils/lang/get-text.js';

// Get all skill trees with pagination and filters
export const getAllSkillTrees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      creatorId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Creator filter
    if (creatorId) {
      query.createdBy = creatorId;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const skillTrees = await SkillTree.find(query)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'structure.roots.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await SkillTree.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: totalPages
    };

    res.json(responseHelper(200, {
      skillTrees,
      pagination
    }));
  } catch (error) {
    console.error('Error getting skill trees:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get skill tree by ID with full structure
export const getSkillTreeById = async (req, res) => {
  try {
    const { treeId } = req.params;

    const skillTree = await SkillTree.findById(treeId)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'structure.roots.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'learningPaths.sequence.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'learningPaths.prerequisites',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .lean();

    if (!skillTree) {
      return res.status(404).json(responseHelper(404, { error: 'Skill tree not found' }));
    }

    res.json(responseHelper(200, { skillTree }));
  } catch (error) {
    console.error('Error getting skill tree:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Create new skill tree
export const createSkillTree = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      type,
      icon,
      color,
      tags,
      structure,
      learningPaths,
      settings
    } = req.body;

    // Check if skill tree name already exists
    const existingTree = await SkillTree.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingTree) {
      return res.status(400).json(responseHelper(400, { error: 'Skill tree name already exists' }));
    }

    const skillTreeData = new SkillTree({
      name,
      description,
      shortDescription,
      type,
      icon,
      color,
      tags,
      structure: structure || { roots: [] },
      learningPaths: learningPaths || [],
      settings: settings || {},
      createdBy: req.user._id,
      stats: {
        totalSkills: 0,
        totalPaths: 0,
        totalUsers: 0,
        averageCompletionTime: 0,
        completionRate: 0,
        averageRating: 0,
        totalRatings: 0
      }
    });

    await skillTreeData.save();

    const populatedTree = await SkillTree.findById(skillTreeData._id)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .lean();

    res.status(201).json(responseHelper(201, { skillTree: populatedTree }));
  } catch (error) {
    console.error('Error creating skill tree:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Update skill tree
export const updateSkillTree = async (req, res) => {
  try {
    const { treeId } = req.params;
    const updateData = req.body;

    // If name is being updated, check for uniqueness
    if (updateData.name) {
      const existingTree = await SkillTree.findOne({ 
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: treeId }
      });
      if (existingTree) {
        return res.status(400).json(responseHelper(400, { error: 'Skill tree name already exists' }));
      }
    }

    const skillTree = await SkillTree.findByIdAndUpdate(
      treeId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .lean();

    if (!skillTree) {
      return res.status(404).json(responseHelper(404, { error: 'Skill tree not found' }));
    }

    res.json(responseHelper(200, { skillTree }));
  } catch (error) {
    console.error('Error updating skill tree:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Delete skill tree
export const deleteSkillTree = async (req, res) => {
  try {
    const { treeId } = req.params;

    const skillTree = await SkillTree.findByIdAndDelete(treeId);

    if (!skillTree) {
      return res.status(404).json(responseHelper(404, { error: 'Skill tree not found' }));
    }

    res.json(responseHelper(200, { message: 'Skill tree deleted successfully' }));
  } catch (error) {
    console.error('Error deleting skill tree:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Add skill to tree
export const addSkillToTree = async (req, res) => {
  try {
    const { treeId } = req.params;
    const { skillId, parentId, properties } = req.body;

    const skillTree = await SkillTree.findById(treeId);
    if (!skillTree) {
      return res.status(404).json(responseHelper(404, { error: 'Skill tree not found' }));
    }

    // Check if skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json(responseHelper(404, { error: 'Skill not found' }));
    }

    await skillTree.addSkill(skillId, parentId, properties);

    const updatedTree = await SkillTree.findById(treeId)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'structure.roots.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .lean();

    res.json(responseHelper(200, { skillTree: updatedTree }));
  } catch (error) {
    console.error('Error adding skill to tree:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Remove skill from tree
export const removeSkillFromTree = async (req, res) => {
  try {
    const { treeId, skillId } = req.params;

    const skillTree = await SkillTree.findById(treeId);
    if (!skillTree) {
      return res.status(404).json(responseHelper(404, { error: 'Skill tree not found' }));
    }

    await skillTree.removeSkill(skillId);

    const updatedTree = await SkillTree.findById(treeId)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'structure.roots.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .lean();

    res.json(responseHelper(200, { skillTree: updatedTree }));
  } catch (error) {
    console.error('Error removing skill from tree:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Add learning path to tree
export const addLearningPath = async (req, res) => {
  try {
    const { treeId } = req.params;
    const pathData = req.body;

    const skillTree = await SkillTree.findById(treeId);
    if (!skillTree) {
      return res.status(404).json(responseHelper(404, { error: 'Skill tree not found' }));
    }

    await skillTree.addLearningPath(pathData);

    const updatedTree = await SkillTree.findById(treeId)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'learningPaths.sequence.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'learningPaths.prerequisites',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .lean();

    res.json(responseHelper(200, { skillTree: updatedTree }));
  } catch (error) {
    console.error('Error adding learning path:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Remove learning path from tree
export const removeLearningPath = async (req, res) => {
  try {
    const { treeId, pathName } = req.params;

    const skillTree = await SkillTree.findById(treeId);
    if (!skillTree) {
      return res.status(404).json(responseHelper(404, { error: 'Skill tree not found' }));
    }

    await skillTree.removeLearningPath(pathName);

    const updatedTree = await SkillTree.findById(treeId)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'learningPaths.sequence.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .lean();

    res.json(responseHelper(200, { skillTree: updatedTree }));
  } catch (error) {
    console.error('Error removing learning path:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get skill trees by type
export const getSkillTreesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const skillTrees = await SkillTree.findByType(type)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'structure.roots.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await SkillTree.countDocuments({ type });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json(responseHelper(200, {
      skillTrees,
      pagination
    }));
  } catch (error) {
    console.error('Error getting skill trees by type:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get skill trees by creator
export const getSkillTreesByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const skillTrees = await SkillTree.findByCreator(creatorId)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'structure.roots.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await SkillTree.countDocuments({ createdBy: creatorId });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json(responseHelper(200, {
      skillTrees,
      pagination
    }));
  } catch (error) {
    console.error('Error getting skill trees by creator:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get skill trees by skill
export const getSkillTreesBySkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const skillTrees = await SkillTree.findBySkill(skillId)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'structure.roots.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await SkillTree.countDocuments({
      $or: [
        { 'structure.roots.skillId': skillId },
        { 'structure.roots.children.skillId': skillId },
        { 'structure.roots.children.children.skillId': skillId },
        { 'learningPaths.sequence.skillId': skillId }
      ]
    });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json(responseHelper(200, {
      skillTrees,
      pagination
    }));
  } catch (error) {
    console.error('Error getting skill trees by skill:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Search skill trees
export const searchSkillTrees = async (req, res) => {
  try {
    const { q } = req.query;
    const { page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json(responseHelper(400, { error: 'Search query is required' }));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const skillTrees = await SkillTree.searchTrees(q)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'structure.roots.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await SkillTree.countDocuments({ $text: { $search: q } });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json(responseHelper(200, {
      skillTrees,
      pagination
    }));
  } catch (error) {
    console.error('Error searching skill trees:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get skill tree statistics
export const getSkillTreeStats = async (req, res) => {
  try {
    const { treeId } = req.params;

    const skillTree = await SkillTree.findById(treeId);
    if (!skillTree) {
      return res.status(404).json(responseHelper(404, { error: 'Skill tree not found' }));
    }

    // Get all skills in the tree
    const allSkills = skillTree.getAllSkills();
    
    // Get skill details for statistics
    const skills = await Skill.find({ _id: { $in: allSkills } })
      .select('name level type difficulty marketDemand stats')
      .lean();

    // Calculate statistics
    const stats = {
      totalSkills: skills.length,
      skillsByLevel: {},
      skillsByType: {},
      averageDifficulty: 0,
      averageMarketDemand: 0,
      totalUsers: 0,
      averageProgress: 0,
      completionRate: 0
    };

    let totalDifficulty = 0;
    let totalMarketDemand = 0;
    let totalUsers = 0;
    let totalProgress = 0;
    let totalCompletionRate = 0;

    skills.forEach(skill => {
      // Count by level
      stats.skillsByLevel[skill.level] = (stats.skillsByLevel[skill.level] || 0) + 1;
      
      // Count by type
      stats.skillsByType[skill.type] = (stats.skillsByType[skill.type] || 0) + 1;
      
      // Sum difficulties and market demands
      totalDifficulty += skill.difficulty || 0;
      totalMarketDemand += skill.marketDemand || 0;
      
      // Sum user statistics
      if (skill.stats) {
        totalUsers += skill.stats.totalUsers || 0;
        totalProgress += skill.stats.averageProgress || 0;
        totalCompletionRate += skill.stats.completionRate || 0;
      }
    });

    // Calculate averages
    if (skills.length > 0) {
      stats.averageDifficulty = totalDifficulty / skills.length;
      stats.averageMarketDemand = totalMarketDemand / skills.length;
      stats.averageProgress = totalProgress / skills.length;
      stats.completionRate = totalCompletionRate / skills.length;
    }

    stats.totalUsers = totalUsers;

    res.json(responseHelper(200, { stats }));
  } catch (error) {
    console.error('Error getting skill tree statistics:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Bulk assign skills to skill tree
export const bulkAssignSkills = async (req, res) => {
  try {
    const { treeId } = req.params;
    const { assignments } = req.body; // Array of { skillId, parentId?, properties? }

    const skillTree = await SkillTree.findById(treeId);
    if (!skillTree) {
      return res.status(404).json(responseHelper(404, { error: 'Skill tree not found' }));
    }

    // Process each assignment
    for (const assignment of assignments) {
      const { skillId, parentId, properties } = assignment;
      
      // Check if skill exists
      const skill = await Skill.findById(skillId);
      if (!skill) {
        console.warn(`Skill ${skillId} not found, skipping assignment`);
        continue;
      }

      // Add skill to tree
      await skillTree.addSkill(skillId, parentId, properties);
    }

    const updatedTree = await SkillTree.findById(treeId)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'structure.roots.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .lean();

    res.json(responseHelper(200, { skillTree: updatedTree }));
  } catch (error) {
    console.error('Error bulk assigning skills:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Bulk remove skills from skill tree
export const bulkRemoveSkills = async (req, res) => {
  try {
    const { treeId } = req.params;
    const { skillIds } = req.body; // Array of skill IDs to remove

    const skillTree = await SkillTree.findById(treeId);
    if (!skillTree) {
      return res.status(404).json(responseHelper(404, { error: 'Skill tree not found' }));
    }

    const allSkills = skillTree.getAllSkills();
    // Convert ObjectIds to strings for comparison
    const allSkillsStrings = allSkills.map(skillId => skillId.toString());
    console.log('allSkills', {allSkillsStrings, skillIds})
    
    // Process each removal
    for (const skillId of skillIds) {
      // Check if skill exists in the tree before removing
      
      if (allSkillsStrings.includes(skillId)) {
        await skillTree.removeSkill(skillId);
      } else {
        console.warn(`Skill ${skillId} not found in tree, skipping removal`);
      }
    }

    const updatedTree = await SkillTree.findById(treeId)
      .populate('createdBy', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .populate({
        path: 'structure.roots.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .populate({
        path: 'structure.roots.children.skillId',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' }
        ]
      })
      .lean();

    res.json(responseHelper(200, { skillTree: updatedTree }));
  } catch (error) {
    console.error('Error bulk removing skills:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get skill assignments for a skill tree
export const getSkillAssignments = async (req, res) => {
  try {
    const { treeId } = req.params;

    const skillTree = await SkillTree.findById(treeId);
    if (!skillTree) {
      return res.status(404).json(responseHelper(404, { error: 'Skill tree not found' }));
    }

    // Extract all skill IDs from the tree structure
    const skillIds = skillTree.getAllSkills();

    // Get skill details
    const skills = await Skill.find({ _id: { $in: skillIds } })
      .select('name description category level type icon color')
      .lean();

    // Create assignments mapping
    const assignments = skillIds.map(skillId => {
      const skill = skills.find(s => s._id.toString() === skillId.toString());
      return {
        skillId,
        skill: skill || null
      };
    });

    res.json(responseHelper(200, { assignments }));
  } catch (error) {
    console.error('Error getting skill assignments:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get all skill assignments across all skill trees
export const getAllSkillAssignments = async (req, res) => {
  try {
    const skillTrees = await SkillTree.find()
      .select('_id name type structure')
      .populate('structure.roots.skillId', 'name category level')
      .populate('structure.roots.children.skillId', 'name category level')
      .lean();

    // Create a mapping of skillId -> treeIds
    const skillToTrees = new Map();

    skillTrees.forEach(tree => {
      const skillIds = tree.getAllSkills();
      skillIds.forEach(skillId => {
        if (!skillToTrees.has(skillId.toString())) {
          skillToTrees.set(skillId.toString(), []);
        }
        skillToTrees.get(skillId.toString()).push({
          treeId: tree._id,
          treeName: tree.name,
          treeType: tree.type
        });
      });
    });

    res.json(responseHelper(200, { 
      assignments: Object.fromEntries(skillToTrees),
      totalAssignments: Array.from(skillToTrees.values()).reduce((sum, trees) => sum + trees.length, 0)
    }));
  } catch (error) {
    console.error('Error getting all skill assignments:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
}; 
import { Class } from '../../models/index.js';
import responseHelper from '../../utils/helpers/response-helper.js';
import getText from '../../utils/lang/get-text.js';

// Get all classes with pagination and filters
export const getAllClasses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      level,
      status,
      teacherId,
      skill,
      tag,
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

    // Level filter
    if (level) {
      query.level = level;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Teacher filter
    if (teacherId) {
      query.$or = [
        { createdBy: teacherId },
        { teachers: teacherId }
      ];
    }

    // Skill tree filter
    if (skill) {
      query['skillTrees.skillTree'] = skill;
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const classes = await Class.find(query)
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate('students.user', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .populate('thumbnail', 'url')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Class.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: totalPages
    };

    res.json(responseHelper(200, {
      classes,
      pagination
    }));
  } catch (error) {
    console.error('Error getting classes:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get class by ID
export const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId)
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate('students.user', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .populate('thumbnail', 'url')
      .lean();

    if (!classData) {
      return res.status(404).json(responseHelper(404, { error: 'Class not found' }));
    }

    res.json(responseHelper(200, { class: classData }));
  } catch (error) {
    console.error('Error getting class:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Create new class
export const createClass = async (req, res) => {
  try {
    const {
      name,
      description,
      code,
      type,
      level,
      skillTrees,
      objectives,
      duration,
      maxStudents,
      schedule,
      teachers,
      settings,
      tags
    } = req.body;

    // Check if class code already exists
    const existingClass = await Class.findOne({ code: code.toUpperCase() });
    if (existingClass) {
      return res.status(400).json(responseHelper(400, { error: 'Class code already exists' }));
    }

    const classData = new Class({
      name,
      description,
      code: code.toUpperCase(),
      type,
      level,
      skillTrees,
      objectives,
      duration,
      maxStudents,
      schedule,
      teachers,
      settings,
      tags,
      createdBy: req.user._id,
      students: []
    });

    await classData.save();

    const populatedClass = await Class.findById(classData._id)
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .populate('thumbnail', 'url')
      .lean();

    res.status(201).json(responseHelper(201, { class: populatedClass }));
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Update class
export const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const updateData = req.body;

    // If code is being updated, check for uniqueness
    if (updateData.code) {
      const existingClass = await Class.findOne({ 
        code: updateData.code.toUpperCase(),
        _id: { $ne: classId }
      });
      if (existingClass) {
        return res.status(400).json(responseHelper(400, { error: 'Class code already exists' }));
      }
      updateData.code = updateData.code.toUpperCase();
    }

    const classData = await Class.findByIdAndUpdate(
      classId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate('students.user', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .populate('thumbnail', 'url')
      .lean();

    if (!classData) {
      return res.status(404).json(responseHelper(404, { error: 'Class not found' }));
    }

    res.json(responseHelper(200, { class: classData }));
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Delete class
export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findByIdAndDelete(classId);

    if (!classData) {
      return res.status(404).json(responseHelper(404, { error: 'Class not found' }));
    }

    res.json(responseHelper(200, { message: 'Class deleted successfully' }));
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Enroll student in class
export const enrollStudent = async (req, res) => {
  try {
    const { classId } = req.params;
    const { userId, status = 'enrolled' } = req.body;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json(responseHelper(404, { error: 'Class not found' }));
    }

    // Check if class is full
    if (classData.enrolledStudents >= classData.maxStudents) {
      return res.status(400).json(responseHelper(400, { error: 'Class is full' }));
    }

    await classData.addStudent(userId, status);

    const updatedClass = await Class.findById(classId)
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate('students.user', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .lean();

    res.json(responseHelper(200, { class: updatedClass }));
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Remove student from class
export const removeStudent = async (req, res) => {
  try {
    const { classId, userId } = req.params;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json(responseHelper(404, { error: 'Class not found' }));
    }

    await classData.removeStudent(userId);

    const updatedClass = await Class.findById(classId)
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate('students.user', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .lean();

    res.json(responseHelper(200, { class: updatedClass }));
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Update student progress
export const updateStudentProgress = async (req, res) => {
  try {
    const { classId, userId } = req.params;
    const { progress, completedSkillTrees } = req.body;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json(responseHelper(404, { error: 'Class not found' }));
    }

    await classData.updateStudentProgress(userId, progress, completedSkillTrees);

    const updatedClass = await Class.findById(classId)
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate('students.user', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .populate('students.completedSkillTrees.skillTree', 'name description type icon color')
      .lean();

    res.json(responseHelper(200, { class: updatedClass }));
  } catch (error) {
    console.error('Error updating student progress:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get classes by skill tree
export const getClassesBySkillTree = async (req, res) => {
  try {
    const { skillTreeId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const classes = await Class.findBySkillTree(skillTreeId)
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .populate('thumbnail', 'url')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Class.countDocuments({
      'skillTrees.skillTree': skillTreeId
    });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json(responseHelper(200, {
      classes,
      pagination
    }));
  } catch (error) {
    console.error('Error getting classes by skill tree:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get classes by teacher
export const getClassesByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const classes = await Class.findByTeacher(teacherId)
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .populate('thumbnail', 'url')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Class.countDocuments({
      $or: [
        { createdBy: teacherId },
        { teachers: teacherId }
      ]
    });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json(responseHelper(200, {
      classes,
      pagination
    }));
  } catch (error) {
    console.error('Error getting classes by teacher:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Get classes by student
export const getClassesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const classes = await Class.findByStudent(studentId)
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .populate('thumbnail', 'url')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Class.countDocuments({
      'students.user': studentId
    });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json(responseHelper(200, {
      classes,
      pagination
    }));
  } catch (error) {
    console.error('Error getting classes by student:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Assign teacher to class
export const assignTeacherToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { teacherId } = req.body;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json(responseHelper(404, { error: 'Class not found' }));
    }

    // Check if teacher is already assigned
    if (classData.teachers.includes(teacherId)) {
      return res.status(400).json(responseHelper(400, { error: 'Teacher is already assigned to this class' }));
    }

    // Add teacher to class
    classData.teachers.push(teacherId);
    await classData.save();

    const updatedClass = await Class.findById(classId)
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate('students.user', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .populate('thumbnail', 'url')
      .lean();

    res.json(responseHelper(200, { class: updatedClass }));
  } catch (error) {
    console.error('Error assigning teacher to class:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
};

// Remove teacher from class
export const removeTeacherFromClass = async (req, res) => {
  try {
    const { classId, teacherId } = req.params;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json(responseHelper(404, { error: 'Class not found' }));
    }

    // Check if teacher is assigned to this class
    if (!classData.teachers.includes(teacherId)) {
      return res.status(400).json(responseHelper(400, { error: 'Teacher is not assigned to this class' }));
    }

    // Remove teacher from class
    classData.teachers = classData.teachers.filter(id => id.toString() !== teacherId);
    await classData.save();

    const updatedClass = await Class.findById(classId)
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate('students.user', 'name email photoUrl')
      .populate({
        path: 'skillTrees.skillTree',
        populate: [
          { path: 'createdBy', select: 'name email photoUrl' },
          { path: 'thumbnail', select: 'url' },
          {
            path: 'structure.roots.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          },
          {
            path: 'structure.roots.children.children.skillId',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' }
            ]
          }
        ]
      })
      .populate('thumbnail', 'url')
      .lean();

    res.json(responseHelper(200, { class: updatedClass }));
  } catch (error) {
    console.error('Error removing teacher from class:', error);
    res.status(500).json(responseHelper(500, { error: error.message }));
  }
}; 
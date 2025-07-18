import pick from 'lodash/pick.js';
import { User, Class } from '../../models/index.js';
import { errorHelper, getText, logger } from '../../utils/index.js';
import { validateGetListUsers } from '../../validators/role_permission.validator.js';
import { validateCreateUser, validateUpdateUser } from '../../validators/user.validator.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res) => {
  const { error } = validateGetListUsers(req.query);
  if (error) return res.status(400).json(errorHelper('00066', req, error.details[0].message));

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || '';
  const type = req.query.type || '';
  const isActivated = req.query.isActivated;

  try {
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      query.type = type;
    }
    
    if (isActivated !== undefined) {
      query.isActivated = isActivated === 'true';
    }

    // Exclude deleted users
    query.deletedAt = { $exists: false };

    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .populate('photo')
      .populate('roles')
      .populate('permissions')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return res.json({
      code: 200,
      data: {
        users: users.map(user => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          type: user.type,
          language: user.language,
          isActivated: user.isActivated,
          isVerified: user.isVerified,
          isPremium: user.isPremium,
          gender: user.gender,
          photoUrl: user.photo?.src || null,
          roles: user.roles,
          permissions: user.permissions,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
    });
  } catch (err) {
    logger('00093', req.user._id, getText('en', '00093'), 'Error', req);
    return res.status(500).json(errorHelper('00093', req, err.message));
  }
};

export const createUser = async (req, res) => {
  try {
    // Validate request body
    const { error } = validateCreateUser(req.body);
    if (error) {
      return res.status(400).json(errorHelper('00108', req, error.details[0].message));
    }

    const {
      name,
      email,
      username,
      password,
      type = 'user',
      language = 'en',
      gender,
      isActivated = true,
      isVerified = true,
      isPremium = false
    } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json(errorHelper('00109', req, 'Email already exists'));
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json(errorHelper('00110', req, 'Username already exists'));
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      type,
      language,
      gender,
      isActivated,
      isVerified,
      isPremium,
      platform: 'Web', // Default for admin-created users
      deviceId: 'admin-created', // Default for admin-created users
      timezone: 0 // Default timezone
    });

    await newUser.save();

    // Populate the user with roles and permissions
    const populatedUser = await User.findById(newUser._id)
      .populate('roles')
      .populate('permissions');

    logger('00111', req.user._id, getText('en', '00111'), 'Info', req);
    return res.status(201).json({
      resultMessage: { en: getText('en', '00111'), tr: getText('tr', '00111') },
      resultCode: '00111',
      user: {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        username: populatedUser.username,
        type: populatedUser.type,
        language: populatedUser.language,
        isActivated: populatedUser.isActivated,
        isVerified: populatedUser.isVerified,
        isPremium: populatedUser.isPremium,
        gender: populatedUser.gender,
        photoUrl: populatedUser.photo?.src || null,
        roles: populatedUser.roles,
        permissions: populatedUser.permissions,
        createdAt: populatedUser.createdAt,
        updatedAt: populatedUser.updatedAt,
        lastLogin: populatedUser.lastLogin
      }
    });
  } catch (err) {
    logger('00112', req.user._id, getText('en', '00112'), 'Error', req);
    return res.status(500).json(errorHelper('00112', req, err.message));
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('photo')
      .populate('roles')
      .populate('permissions');

    if (!user) {
      return res.status(404).json(errorHelper('00094', req, 'User not found'));
    }

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        type: user.type,
        language: user.language,
        isActivated: user.isActivated,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        gender: user.gender,
        photoUrl: user.photo?.src || null,
        roles: user.roles,
        permissions: user.permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    logger('00095', req.user._id, getText('en', '00095'), 'Error', req);
    return res.status(500).json(errorHelper('00095', req, err.message));
  }
};

export const updateUser = async (req, res) => {
  try {
    // Validate request body
    const { error } = validateUpdateUser(req.body);
    if (error) {
      return res.status(400).json(errorHelper('00096', req, error.details[0].message));
    }

    const { userId } = req.params;
    const updateData = pick(req.body, [
      'name', 'username', 'type', 'language', 'gender', 
      'isActivated', 'isVerified', 'isPremium'
    ]);

    // Check if username is being changed and if it's unique
    if (updateData.username) {
      const existingUser = await User.findOne({ 
        username: updateData.username, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json(errorHelper('00096', req, 'Username already exists'));
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).populate('photo').populate('roles').populate('permissions');

    if (!user) {
      return res.status(404).json(errorHelper('00094', req, 'User not found'));
    }

    logger('00097', req.user._id, getText('en', '00097'), 'Info', req);
    return res.json({
      resultMessage: { en: getText('en', '00097'), tr: getText('tr', '00097') },
      resultCode: '00097',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        type: user.type,
        language: user.language,
        isActivated: user.isActivated,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        gender: user.gender,
        photoUrl: user.photo?.src || null,
        roles: user.roles,
        permissions: user.permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    logger('00098', req.user._id, getText('en', '00098'), 'Error', req);
    return res.status(500).json(errorHelper('00098', req, err.message));
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorHelper('00094', req, 'User not found'));
    }

    // Prevent deletion of admin users
    if (user.type === 'admin') {
      return res.status(403).json(errorHelper('00099', req, 'Cannot delete admin users'));
    }

    // Soft delete - mark as deleted
    await User.findByIdAndUpdate(userId, {
      isActivated: false,
      deletedAt: new Date()
    });

    logger('00100', req.user._id, getText('en', '00100'), 'Info', req);
    return res.json({
      resultMessage: { en: getText('en', '00100'), tr: getText('tr', '00100') },
      resultCode: '00100'
    });
  } catch (err) {
    logger('00101', req.user._id, getText('en', '00101'), 'Error', req);
    return res.status(500).json(errorHelper('00101', req, err.message));
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('skills.skill', 'name description category level type icon color')
      .populate('createdBy', 'name email photoUrl')
      .populate('teachers', 'name email photoUrl')
      .populate('thumbnail', 'url')
      .sort({ createdAt: -1 });

    return res.json({
      classes: classes.map(cls => ({
        _id: cls._id,
        name: cls.name,
        description: cls.description,
        code: cls.code,
        type: cls.type,
        level: cls.level,
        status: cls.status,
        thumbnailUrl: cls.thumbnail?.url || cls.thumbnailUrl,
        createdBy: cls.createdBy,
        teachers: cls.teachers,
        enrolledStudents: cls.enrolledStudents,
        maxStudents: cls.maxStudents,
        skills: cls.skills,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt
      }))
    });
  } catch (err) {
    logger('00102', req.user._id, getText('en', '00102'), 'Error', req);
    return res.status(500).json(errorHelper('00102', req, err.message));
  }
};

export const assignUserToClass = async (req, res) => {
  try {
    const { userId, classId, action } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorHelper('00094', req, 'User not found'));
    }

    // Validate class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json(errorHelper('00103', req, 'Class not found'));
    }

    if (action === 'assign') {
      // Check if class is full
      if (classData.enrolledStudents >= classData.maxStudents) {
        return res.status(400).json(errorHelper('00107', req, 'Class is full'));
      }

      // Add class to user's classes array
      await User.findByIdAndUpdate(userId, {
        $addToSet: { classes: classId }
      });

      // Add user to class's students array using the class method
      await classData.addStudent(userId, 'enrolled');
    } else if (action === 'remove') {
      // Remove class from user's classes array
      await User.findByIdAndUpdate(userId, {
        $pull: { classes: classId }
      });

      // Remove user from class's students array using the class method
      await classData.removeStudent(userId);
    }

    logger('00104', req.user._id, getText('en', '00104'), 'Info', req);
    return res.json({
      resultMessage: { en: getText('en', '00104'), tr: getText('tr', '00104') },
      resultCode: '00104'
    });
  } catch (err) {
    logger('00105', req.user._id, getText('en', '00105'), 'Error', req);
    return res.status(500).json(errorHelper('00105', req, err.message));
  }
};

export const getUserClasses = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate({
        path: 'classes',
        populate: [
          {
            path: 'createdBy',
            select: 'name email photoUrl'
          },
          {
            path: 'teachers',
            select: 'name email photoUrl'
          },
          {
            path: 'skillTrees.skillTree',
            populate: [
              { path: 'createdBy', select: 'name email photoUrl' },
              { path: 'thumbnail', select: 'url' },
              {
                path: 'structure.roots.skillId',
                select: 'name description category level type icon color'
              },
              {
                path: 'structure.roots.children.skillId',
                select: 'name description category level type icon color'
              },
              {
                path: 'structure.roots.children.children.skillId',
                select: 'name description category level type icon color'
              }
            ]
          },
          {
            path: 'thumbnail',
            select: 'url'
          }
        ]
      });

    if (!user) {
      return res.status(404).json(errorHelper('00094', req, 'User not found'));
    }

    return res.json({
      classes: user.classes?.map(cls => ({
        _id: cls._id,
        name: cls.name,
        description: cls.description,
        code: cls.code,
        type: cls.type,
        level: cls.level,
        status: cls.status,
        thumbnailUrl: cls.thumbnail?.url || cls.thumbnailUrl,
        createdBy: cls.createdBy,
        teachers: cls.teachers,
        skillTrees: cls.skillTrees,
        enrolledStudents: cls.enrolledStudents,
        maxStudents: cls.maxStudents,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt
      })) || []
    });
  } catch (err) {
    logger('00106', req.user._id, getText('en', '00106'), 'Error', req);
    return res.status(500).json(errorHelper('00106', req, err.message));
  }
}; 
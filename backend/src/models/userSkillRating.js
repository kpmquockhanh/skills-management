import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSkillRatingSchema = new Schema(
  {
    // User who is being rated
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Skill being rated
    skill: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    // Skill tree context (optional - for skills within skill trees)
    skillTree: {
      type: Schema.Types.ObjectId,
      ref: 'SkillTree',
    },
    // Class context (optional - for skills within classes)
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    // Rater (teacher/admin who is rating the user)
    ratedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Rating score (1-10 scale)
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    // Progress percentage (0-100)
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    // Mastery level
    masteryLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    // Status of the skill for this user
    status: {
      type: String,
      enum: ['active', 'in_progress', 'completed', 'archived', 'paused'],
      default: 'active',
    },
    // Whether the skill is archived for this user
    isArchived: {
      type: Boolean,
      default: false,
    },
    // Archive reason
    archiveReason: {
      type: String,
      enum: ['not_interested', 'too_difficult', 'not_relevant', 'completed_elsewhere', 'other'],
    },
    // Archive notes
    archiveNotes: {
      type: String,
      trim: true,
    },
    // Date when skill was archived
    archivedAt: {
      type: Date,
    },
    // Date when skill was completed
    completedAt: {
      type: Date,
    },
    // Date when skill was started
    startedAt: {
      type: Date,
      default: Date.now,
    },
    // Last practice date
    lastPracticedAt: {
      type: Date,
    },
    // Time spent on this skill (in minutes)
    timeSpent: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Assessment scores
    assessments: [{
      title: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      maxScore: {
        type: Number,
        min: 0,
        default: 100,
      },
      type: {
        type: String,
        enum: ['quiz', 'project', 'assignment', 'certification', 'practice'],
        required: true,
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
      feedback: {
        type: String,
        trim: true,
      },
    }],
    // Notes and feedback from teachers
    notes: [{
      content: {
        type: String,
        required: true,
        trim: true,
      },
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      isPrivate: {
        type: Boolean,
        default: false,
      },
    }],
    // Learning resources used
    resourcesUsed: [{
      title: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['video', 'article', 'book', 'course', 'tutorial', 'documentation', 'practice'],
        required: true,
      },
      url: {
        type: String,
        trim: true,
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
    }],
    // Goals and objectives
    goals: [{
      description: {
        type: String,
        required: true,
        trim: true,
      },
      targetDate: {
        type: Date,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
      completedAt: {
        type: Date,
      },
    }],
    // Difficulty rating by user (1-10)
    userDifficultyRating: {
      type: Number,
      min: 1,
      max: 10,
    },
    // Interest level by user (1-10)
    userInterestRating: {
      type: Number,
      min: 1,
      max: 10,
    },
    // Confidence level (1-10)
    confidenceLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    // Tags for categorization
    tags: [{
      type: String,
      trim: true,
    }],
    // Metadata
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
userSkillRatingSchema.index({ user: 1, skill: 1, class: 1 }, { unique: true });
userSkillRatingSchema.index({ user: 1, status: 1 });
userSkillRatingSchema.index({ user: 1, isArchived: 1 });
userSkillRatingSchema.index({ skill: 1, status: 1 });
userSkillRatingSchema.index({ ratedBy: 1 });
userSkillRatingSchema.index({ skillTree: 1 });
userSkillRatingSchema.index({ class: 1 });
userSkillRatingSchema.index({ rating: -1 });
userSkillRatingSchema.index({ progress: -1 });
userSkillRatingSchema.index({ lastPracticedAt: -1 });

// Virtual for average assessment score
userSkillRatingSchema.virtual('averageAssessmentScore').get(function() {
  if (!this.assessments || this.assessments.length === 0) {
    return 0;
  }
  
  const totalScore = this.assessments.reduce((sum, assessment) => {
    return sum + (assessment.score / assessment.maxScore) * 100;
  }, 0);
  
  return Math.round(totalScore / this.assessments.length);
});

// Virtual for completion status
userSkillRatingSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' || this.progress >= 100;
});

// Pre-save middleware to update timestamps
userSkillRatingSchema.pre('save', function(next) {
  // Update completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Update archivedAt when skill is archived
  if (this.isModified('isArchived') && this.isArchived && !this.archivedAt) {
    this.archivedAt = new Date();
  }
  
  // Update mastery level based on rating and progress
  if (this.isModified('rating') || this.isModified('progress')) {
    if (this.rating >= 9 && this.progress >= 90) {
      this.masteryLevel = 'expert';
    } else if (this.rating >= 7 && this.progress >= 70) {
      this.masteryLevel = 'advanced';
    } else if (this.rating >= 5 && this.progress >= 50) {
      this.masteryLevel = 'intermediate';
    } else {
      this.masteryLevel = 'beginner';
    }
  }
  
  next();
});

// Method to add assessment
userSkillRatingSchema.methods.addAssessment = function(assessmentData) {
  this.assessments.push(assessmentData);
  return this.save();
};

// Method to add note
userSkillRatingSchema.methods.addNote = function(noteData) {
  this.notes.push(noteData);
  return this.save();
};

// Method to add goal
userSkillRatingSchema.methods.addGoal = function(goalData) {
  this.goals.push(goalData);
  return this.save();
};

// Method to archive skill
userSkillRatingSchema.methods.archiveSkill = function(reason, notes) {
  this.isArchived = true;
  this.status = 'archived';
  this.archiveReason = reason;
  this.archiveNotes = notes;
  this.archivedAt = new Date();
  return this.save();
};

// Method to unarchive skill
userSkillRatingSchema.methods.unarchiveSkill = function() {
  this.isArchived = false;
  this.status = 'active';
  this.archiveReason = undefined;
  this.archiveNotes = undefined;
  this.archivedAt = undefined;
  return this.save();
};

// Method to complete skill
userSkillRatingSchema.methods.completeSkill = function() {
  this.status = 'completed';
  this.progress = 100;
  this.completedAt = new Date();
  return this.save();
};

// Method to update progress
userSkillRatingSchema.methods.updateProgress = function(progress, timeSpent = 0) {
  this.progress = Math.min(100, Math.max(0, progress));
  this.timeSpent += timeSpent;
  this.lastPracticedAt = new Date();
  
  if (this.progress >= 100) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Method to update rating
userSkillRatingSchema.methods.updateRating = function(rating, ratedBy) {
  this.rating = Math.min(10, Math.max(1, rating));
  this.ratedBy = ratedBy;
  return this.save();
};

// Static method to find ratings by user
userSkillRatingSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.isArchived !== undefined) {
    query.isArchived = options.isArchived;
  }
  
  if (options.skillTree) {
    query.skillTree = options.skillTree;
  }
  
  if (options.class) {
    query.class = options.class;
  }
  
  return this.find(query)
    .populate('skill', 'name description category level color icon')
    .populate('skillTree', 'name description')
    .populate('class', 'name code')
    .populate('ratedBy', 'name username')
   
    .sort({ updatedAt: -1 });
};

// Static method to find ratings by skill
userSkillRatingSchema.statics.findBySkill = function(skillId, options = {}) {
  const query = { skill: skillId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.isArchived !== undefined) {
    query.isArchived = options.isArchived;
  }
  
  return this.find(query)
    .populate('user', 'name username email type')
    .populate('ratedBy', 'name username')
    .sort({ rating: -1 });
};

// Static method to find archived skills by user
userSkillRatingSchema.statics.findArchivedByUser = function(userId) {
  return this.find({ user: userId, isArchived: true })
    .populate('skill', 'name description category level color icon')
    .populate('skillTree', 'name description')
    .populate('class', 'name code')
    .sort({ archivedAt: -1 });
};

// Static method to get user skill statistics
userSkillRatingSchema.statics.getUserSkillStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId } },
    {
      $group: {
        _id: null,
        totalSkills: { $sum: 1 },
        activeSkills: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        completedSkills: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        archivedSkills: { $sum: { $cond: ['$isArchived', 1, 0] } },
        averageRating: { $avg: '$rating' },
        averageProgress: { $avg: '$progress' },
        totalTimeSpent: { $sum: '$timeSpent' },
      }
    }
  ]);
};

// Static method to get skill statistics
userSkillRatingSchema.statics.getSkillStats = function(skillId) {
  return this.aggregate([
    { $match: { skill: mongoose.Types.ObjectId.isValid(skillId) ? new mongoose.Types.ObjectId(skillId) : skillId } },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        averageProgress: { $avg: '$progress' },
        completedUsers: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        archivedUsers: { $sum: { $cond: ['$isArchived', 1, 0] } },
      }
    }
  ]);
};

const UserSkillRating = model('UserSkillRating', userSkillRatingSchema);
export default UserSkillRating; 
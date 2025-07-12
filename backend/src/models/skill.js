import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const skillSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    // Skill category (e.g., Programming, Design, Business, etc.)
    category: {
      type: String,
      required: true,
      trim: true,
    },
    // Subcategory for more specific organization
    subcategory: {
      type: String,
      trim: true,
    },
    // Skill level/difficulty
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    // Skill type
    type: {
      type: String,
      enum: ['technical', 'soft', 'domain', 'tool', 'framework', 'language', 'methodology'],
      default: 'technical',
    },
    // Skill status
    status: {
      type: String,
      enum: ['active', 'inactive', 'deprecated', 'emerging'],
      default: 'active',
    },
    // Skill icon/emoji
    icon: {
      type: String,
      trim: true,
    },
    // Skill color for UI
    color: {
      type: String,
      trim: true,
      default: '#3B82F6', // Default blue
    },
    // Skill thumbnail
    thumbnail: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment',
    },
    thumbnailUrl: {
      type: String,
    },
    // Prerequisites - skills that should be learned before this skill
    prerequisites: [{
      type: Schema.Types.ObjectId,
      ref: 'Skill',
    }],
    // Related skills - skills that are related but not prerequisites
    relatedSkills: [{
      type: Schema.Types.ObjectId,
      ref: 'Skill',
    }],
    // Learning objectives for this skill
    learningObjectives: [{
      type: String,
      trim: true,
    }],
    // Key concepts covered
    keyConcepts: [{
      type: String,
      trim: true,
    }],
    // Estimated learning time in hours
    estimatedTime: {
      type: Number,
      min: 0,
    },
    // Difficulty rating (1-10)
    difficulty: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    // Popularity score (can be calculated based on usage)
    popularity: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Market demand score (1-10)
    marketDemand: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    // Average salary impact (percentage)
    salaryImpact: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    // Skill creator
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Skill tags for search and categorization
    tags: [{
      type: String,
      trim: true,
    }],
    // Skill metadata
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    // Skill statistics
    stats: {
      totalUsers: {
        type: Number,
        default: 0,
      },
      averageProgress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      completionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
    },
    // Skill content
    content: {
      overview: {
        type: String,
        trim: true,
      },
      resources: [{
        title: {
          type: String,
          required: true,
          trim: true,
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
        description: {
          type: String,
          trim: true,
        },
        duration: {
          type: Number, // in minutes
        },
        difficulty: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
        },
        isFree: {
          type: Boolean,
          default: true,
        },
        rating: {
          type: Number,
          min: 0,
          max: 5,
        },
      }],
      assessments: [{
        title: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: ['quiz', 'project', 'assignment', 'certification'],
          required: true,
        },
        description: {
          type: String,
          trim: true,
        },
        passingScore: {
          type: Number,
          min: 0,
          max: 100,
          default: 70,
        },
        timeLimit: {
          type: Number, // in minutes
        },
        questions: [{
          question: {
            type: String,
            required: true,
          },
          type: {
            type: String,
            enum: ['multiple_choice', 'true_false', 'short_answer', 'essay'],
            default: 'multiple_choice',
          },
          options: [{
            type: String,
          }],
          correctAnswer: {
            type: Schema.Types.Mixed,
          },
          points: {
            type: Number,
            default: 1,
          },
        }],
      }],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
skillSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });
skillSchema.index({ category: 1 });
skillSchema.index({ subcategory: 1 });
skillSchema.index({ level: 1 });
skillSchema.index({ type: 1 });
skillSchema.index({ status: 1 });
skillSchema.index({ createdBy: 1 });
skillSchema.index({ tags: 1 });
skillSchema.index({ popularity: -1 });
skillSchema.index({ marketDemand: -1 });

// Virtual for full category path
skillSchema.virtual('categoryPath').get(function() {
  return this.subcategory ? `${this.category} > ${this.subcategory}` : this.category;
});

// Pre-save middleware to update popularity based on usage
skillSchema.pre('save', function(next) {
  // You can add logic here to calculate popularity based on various factors
  next();
});

// Method to add prerequisite
skillSchema.methods.addPrerequisite = function(skillId) {
  if (!this.prerequisites.includes(skillId)) {
    this.prerequisites.push(skillId);
  }
  return this.save();
};

// Method to remove prerequisite
skillSchema.methods.removePrerequisite = function(skillId) {
  this.prerequisites = this.prerequisites.filter(id => id.toString() !== skillId.toString());
  return this.save();
};

// Method to add related skill
skillSchema.methods.addRelatedSkill = function(skillId) {
  if (!this.relatedSkills.includes(skillId)) {
    this.relatedSkills.push(skillId);
  }
  return this.save();
};

// Method to remove related skill
skillSchema.methods.removeRelatedSkill = function(skillId) {
  this.relatedSkills = this.relatedSkills.filter(id => id.toString() !== skillId.toString());
  return this.save();
};

// Method to update statistics
skillSchema.methods.updateStats = function(stats) {
  this.stats = { ...this.stats, ...stats };
  return this.save();
};

// Static method to find skills by category
skillSchema.statics.findByCategory = function(category) {
  return this.find({ category: category });
};

// Static method to find skills by level
skillSchema.statics.findByLevel = function(level) {
  return this.find({ level: level });
};

// Static method to find skills by type
skillSchema.statics.findByType = function(type) {
  return this.find({ type: type });
};

// Static method to find popular skills
skillSchema.statics.findPopular = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ popularity: -1 })
    .limit(limit);
};

// Static method to find high-demand skills
skillSchema.statics.findHighDemand = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ marketDemand: -1 })
    .limit(limit);
};

// Static method to find skills by tags
skillSchema.statics.findByTags = function(tags) {
  return this.find({ tags: { $in: tags } });
};

// Static method to search skills
skillSchema.statics.searchSkills = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm }
  }).sort({ score: { $meta: 'textScore' } });
};

const Skill = model('Skill', skillSchema);
export default Skill; 
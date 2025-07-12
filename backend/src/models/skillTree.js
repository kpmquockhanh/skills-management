import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const skillTreeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    // Tree type/category
    type: {
      type: String,
      enum: ['career', 'domain', 'technology', 'role', 'certification', 'custom'],
      default: 'career',
    },
    // Tree status
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft', 'archived'],
      default: 'active',
    },
    // Tree icon/emoji
    icon: {
      type: String,
      trim: true,
    },
    // Tree color for UI
    color: {
      type: String,
      trim: true,
      default: '#10B981', // Default green
    },
    // Tree thumbnail
    thumbnail: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment',
    },
    thumbnailUrl: {
      type: String,
    },
    // Tree creator
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Tree tags
    tags: [{
      type: String,
      trim: true,
    }],
    // Tree structure - hierarchical organization of skills
    structure: {
      // Root nodes of the tree
      roots: [{
        skillId: {
          type: Schema.Types.ObjectId,
          ref: 'Skill',
          required: true,
        },
        position: {
          x: { type: Number, default: 0 },
          y: { type: Number, default: 0 },
        },
        // Custom properties for this node in this tree
        properties: {
          required: {
            type: Boolean,
            default: true,
          },
          estimatedTime: {
            type: Number,
            min: 0,
          },
          priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
          },
          notes: {
            type: String,
            trim: true,
          },
        },
        // Children of this node
        children: [{
          skillId: {
            type: Schema.Types.ObjectId,
            ref: 'Skill',
            required: true,
          },
          position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
          },
          properties: {
            required: {
              type: Boolean,
              default: true,
            },
            estimatedTime: {
              type: Number,
              min: 0,
            },
            priority: {
              type: String,
              enum: ['low', 'medium', 'high', 'critical'],
              default: 'medium',
            },
            notes: {
              type: String,
              trim: true,
            },
          },
          children: [{
            skillId: {
              type: Schema.Types.ObjectId,
              ref: 'Skill',
              required: true,
            },
            position: {
              x: { type: Number, default: 0 },
              y: { type: Number, default: 0 },
            },
            properties: {
              required: {
                type: Boolean,
                default: true,
              },
              estimatedTime: {
                type: Number,
                min: 0,
              },
              priority: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                default: 'medium',
              },
              notes: {
                type: String,
                trim: true,
              },
            },
            children: [], // Can be extended for deeper nesting
          }],
        }],
      }],
    },
    // Learning paths - predefined sequences through the tree
    learningPaths: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'beginner',
      },
      estimatedDuration: {
        type: Number, // in hours
        min: 0,
      },
      // Sequence of skill IDs in this path
      sequence: [{
        skillId: {
          type: Schema.Types.ObjectId,
          ref: 'Skill',
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
        isOptional: {
          type: Boolean,
          default: false,
        },
        estimatedTime: {
          type: Number, // in hours
          min: 0,
        },
        notes: {
          type: String,
          trim: true,
        },
      }],
      // Path prerequisites
      prerequisites: [{
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      }],
      // Path outcomes
      outcomes: [{
        type: String,
        trim: true,
      }],
      // Path status
      status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active',
      },
    }],
    // Tree settings
    settings: {
      allowCustomPaths: {
        type: Boolean,
        default: true,
      },
      requireSequentialLearning: {
        type: Boolean,
        default: false,
      },
      allowSkillSkipping: {
        type: Boolean,
        default: false,
      },
      enableProgressTracking: {
        type: Boolean,
        default: true,
      },
      enableCertification: {
        type: Boolean,
        default: false,
      },
      isPublic: {
        type: Boolean,
        default: true,
      },
      allowForking: {
        type: Boolean,
        default: false,
      },
    },
    // Tree statistics
    stats: {
      totalSkills: {
        type: Number,
        default: 0,
      },
      totalPaths: {
        type: Number,
        default: 0,
      },
      totalUsers: {
        type: Number,
        default: 0,
      },
      averageCompletionTime: {
        type: Number, // in hours
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
    // Tree metadata
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    // Version information
    version: {
      type: String,
      default: '1.0.0',
    },
    // Tree history for versioning
    history: [{
      version: {
        type: String,
        required: true,
      },
      changes: {
        type: String,
        trim: true,
      },
      changedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      changedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
skillTreeSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });
skillTreeSchema.index({ type: 1 });
skillTreeSchema.index({ status: 1 });
skillTreeSchema.index({ createdBy: 1 });
skillTreeSchema.index({ tags: 1 });
skillTreeSchema.index({ 'structure.roots.skillId': 1 });
skillTreeSchema.index({ 'learningPaths.status': 1 });

// Virtual for total skills count
skillTreeSchema.virtual('totalSkillsCount').get(function() {
  let count = 0;
  const countSkills = (nodes) => {
    nodes.forEach(node => {
      count++;
      if (node.children && node.children.length > 0) {
        countSkills(node.children);
      }
    });
  };
  countSkills(this.structure.roots);
  return count;
});

// Pre-save middleware to update statistics
skillTreeSchema.pre('save', function(next) {
  // Update total skills count
  this.stats.totalSkills = this.totalSkillsCount;
  
  // Update total paths count
  this.stats.totalPaths = this.learningPaths ? this.learningPaths.length : 0;
  
  next();
});

// Method to add skill to tree
skillTreeSchema.methods.addSkill = function(skillId, parentId = null, properties = {}) {
  const newNode = {
    skillId,
    position: { x: 0, y: 0 },
    properties: {
      required: properties.required !== undefined ? properties.required : true,
      estimatedTime: properties.estimatedTime || 0,
      priority: properties.priority || 'medium',
      notes: properties.notes || '',
    },
    children: [],
  };

  if (!parentId) {
    // Add as root node
    this.structure.roots.push(newNode);
  } else {
    // Add as child of specified parent
    const addToParent = (nodes) => {
      for (let node of nodes) {
        if (node.skillId.toString() === parentId.toString()) {
          node.children.push(newNode);
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (addToParent(node.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    if (!addToParent(this.structure.roots)) {
      throw new Error('Parent skill not found in tree');
    }
  }
  
  return this.save();
};

// Method to remove skill from tree
skillTreeSchema.methods.removeSkill = function(skillId) {
  const removeFromNodes = (nodes) => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].skillId.toString() === skillId.toString()) {
        // Move children to parent or remove them
        if (nodes[i].children && nodes[i].children.length > 0) {
          // For now, just remove the node and its children
          // You might want to implement more sophisticated logic
        }
        nodes.splice(i, 1);
        return true;
      }
      if (nodes[i].children && nodes[i].children.length > 0) {
        if (removeFromNodes(nodes[i].children)) {
          return true;
        }
      }
    }
    return false;
  };
  
  removeFromNodes(this.structure.roots);
  return this.save();
};

// Method to add learning path
skillTreeSchema.methods.addLearningPath = function(pathData) {
  const newPath = {
    name: pathData.name,
    description: pathData.description || '',
    difficulty: pathData.difficulty || 'beginner',
    estimatedDuration: pathData.estimatedDuration || 0,
    sequence: pathData.sequence || [],
    prerequisites: pathData.prerequisites || [],
    outcomes: pathData.outcomes || [],
    status: pathData.status || 'active',
  };
  
  this.learningPaths.push(newPath);
  return this.save();
};

// Method to remove learning path
skillTreeSchema.methods.removeLearningPath = function(pathName) {
  this.learningPaths = this.learningPaths.filter(path => path.name !== pathName);
  return this.save();
};

// Method to get all skills in tree
skillTreeSchema.methods.getAllSkills = function() {
  const skills = [];
  const collectSkills = (nodes) => {
    nodes.forEach(node => {
      skills.push(node.skillId);
      if (node.children && node.children.length > 0) {
        collectSkills(node.children);
      }
    });
  };
  collectSkills(this.structure.roots);
  return skills;
};

// Method to get skill path (breadcrumb)
skillTreeSchema.methods.getSkillPath = function(skillId) {
  const path = [];
  const findPath = (nodes, targetId) => {
    for (let node of nodes) {
      path.push(node.skillId);
      if (node.skillId.toString() === targetId.toString()) {
        return true;
      }
      if (node.children && node.children.length > 0) {
        if (findPath(node.children, targetId)) {
          return true;
        }
      }
      path.pop();
    }
    return false;
  };
  
  findPath(this.structure.roots, skillId);
  return path;
};

// Static method to find trees by type
skillTreeSchema.statics.findByType = function(type) {
  return this.find({ type: type });
};

// Static method to find trees by status
skillTreeSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

// Static method to find trees by creator
skillTreeSchema.statics.findByCreator = function(creatorId) {
  return this.find({ createdBy: creatorId });
};

// Static method to find trees by skill
skillTreeSchema.statics.findBySkill = function(skillId) {
  return this.find({
    $or: [
      { 'structure.roots.skillId': skillId },
      { 'structure.roots.children.skillId': skillId },
      { 'structure.roots.children.children.skillId': skillId },
      { 'learningPaths.sequence.skillId': skillId }
    ]
  });
};

// Static method to search trees
skillTreeSchema.statics.searchTrees = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm }
  }).sort({ score: { $meta: 'textScore' } });
};

const SkillTree = model('SkillTree', skillTreeSchema);
export default SkillTree; 
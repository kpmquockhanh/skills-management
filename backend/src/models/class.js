import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const classSchema = new Schema(
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
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    thumbnail: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment',
    },
    // Class type/category
    type: {
      type: String,
      enum: ['course', 'workshop', 'seminar', 'tutorial', 'project', 'other'],
      default: 'course',
    },
    // Difficulty level
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    // Class status
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived', 'draft'],
      default: 'inactive',
    },
    // Skill trees covered in this class
    skillTrees: [{
      skillTree: {
        type: Schema.Types.ObjectId,
        ref: 'SkillTree',
        required: true,
      },
      level: {
        type: String,
        enum: ['basic', 'intermediate', 'advanced'],
        default: 'basic',
      },
      order: {
        type: Number,
        default: 0,
      },
      isRequired: {
        type: Boolean,
        default: true,
      },
    }],
    // Learning objectives
    objectives: [{
      type: String,
      trim: true,
    }],
    // Duration in hours
    duration: {
      type: Number,
      min: 0,
    },
    // Maximum number of students
    maxStudents: {
      type: Number,
      min: 1,
      default: 50,
    },
    // Current number of enrolled students
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    // Class schedule
    schedule: {
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      sessions: [{
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
        startTime: {
          type: String, // Format: "HH:MM"
        },
        endTime: {
          type: String, // Format: "HH:MM"
        },
        duration: {
          type: Number, // Duration in minutes
        },
      }],
    },
    // Class creator/teacher
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Teachers/instructors for this class
    teachers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    // Students enrolled in this class
    students: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      enrolledAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['enrolled', 'completed', 'dropped', 'pending'],
        default: 'enrolled',
      },
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      completedSkillTrees: [{
        skillTree: {
          type: Schema.Types.ObjectId,
          ref: 'SkillTree',
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        feedback: {
          type: String,
          trim: true,
        },
      }],
    }],
    // Class settings
    settings: {
      allowSelfEnrollment: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
      isPublic: {
        type: Boolean,
        default: true,
      },
      allowGuestAccess: {
        type: Boolean,
        default: false,
      },
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
classSchema.index({ name: 'text', description: 'text' });
classSchema.index({ code: 1 });
classSchema.index({ status: 1 });
classSchema.index({ type: 1 });
classSchema.index({ level: 1 });
classSchema.index({ createdBy: 1 });
classSchema.index({ 'students.user': 1 });
classSchema.index({ tags: 1 });

// Virtual for student count
classSchema.virtual('studentCount').get(function() {
  return this.students ? this.students.length : 0;
});

// Pre-save middleware to update enrolledStudents count
classSchema.pre('save', function(next) {
  if (this.students) {
    this.enrolledStudents = this.students.filter(student => 
      student.status === 'enrolled' || student.status === 'completed'
    ).length;
  }
  next();
});

// Method to add student to class
classSchema.methods.addStudent = function(userId, status = 'enrolled') {
  const existingStudent = this.students.find(student => 
    student.user.toString() === userId.toString()
  );
  
  if (existingStudent) {
    existingStudent.status = status;
    existingStudent.enrolledAt = new Date();
  } else {
    this.students.push({
      user: userId,
      status: status,
      enrolledAt: new Date(),
      progress: 0,
      completedSkillTrees: [],
    });
  }
  
  return this.save();
};

// Method to remove student from class
classSchema.methods.removeStudent = function(userId) {
  this.students = this.students.filter(student => 
    student.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to update student progress
classSchema.methods.updateStudentProgress = function(userId, progress, completedSkillTrees = []) {
  const student = this.students.find(student => 
    student.user.toString() === userId.toString()
  );
  
  if (student) {
    student.progress = Math.min(100, Math.max(0, progress));
    if (completedSkillTrees.length > 0) {
      student.completedSkillTrees = completedSkillTrees;
    }
  }
  
  return this.save();
};

// Static method to find classes by skill tree
classSchema.statics.findBySkillTree = function(skillTreeId) {
  return this.find({
    'skillTrees.skillTree': skillTreeId
  });
};

// Static method to find classes by teacher
classSchema.statics.findByTeacher = function(teacherId) {
  return this.find({
    $or: [
      { createdBy: teacherId },
      { teachers: teacherId }
    ]
  });
};

// Static method to find classes by student
classSchema.statics.findByStudent = function(studentId) {
  return this.find({
    'students.user': studentId
  });
};

// Method to populate skill trees with full skill tree details
classSchema.methods.populateSkillTrees = function() {
  return this.populate('skillTrees.skillTree');
};

// Method to populate completed skill trees for a specific student
classSchema.methods.populateStudentCompletedSkillTrees = function(studentId) {
  return this.populate({
    path: 'students',
    match: { user: studentId },
    populate: {
      path: 'completedSkillTrees.skillTree'
    }
  });
};

const Class = model('Class', classSchema);
export default Class; 
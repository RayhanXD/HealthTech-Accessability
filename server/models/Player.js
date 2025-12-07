const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Trend Data Schema
const trendDataSchema = new mongoose.Schema({
  StartDateTime: {
    type: String,
    required: true
  },
  endDateTime: {
    type: String,
    required: true
  },
  Value: {
    type: Number,
    required: true
  },
  percentChangeFromPrevious: {
    type: Number,
    required: true
  }
});

// Trend Schema
const trendSchema = new mongoose.Schema({
  Category: {
    type: String,
    required: true
  },
  Name: {
    type: String,
    required: true
  },
  State: {
    type: String,
    required: true
  },
  isHigherBetter: {
    type: Boolean,
    required: true
  },
  valueRange: {
    type: Number,
    required: true
  },
  Unit: {
    type: String,
    required: true
  },
  trendStartTime: {
    type: String,
    required: true
  },
  trendEndTime: {
    type: String,
    required: true
  },
  Data: {
    type: [trendDataSchema],
    default: []
  }
});

// Comparison Data Schema
const comparisonDataSchema = new mongoose.Schema({
  Type: {
    type: String,
    required: true
  },
  Value: {
    type: String,
    required: true
  }
});

// Comparison Schema
const comparisonSchema = new mongoose.Schema({
  Category: {
    type: String,
    required: true
  },
  Name: {
    type: String,
    required: true
  },
  Value: {
    type: String,
    required: true
  },
  Unit: {
    type: String,
    required: true
  },
  isHigherBetter: {
    type: Boolean,
    required: true
  },
  startDateTime: {
    type: String,
    required: true
  },
  endDateTime: {
    type: String,
    required: true
  },
  Data: {
    type: [comparisonDataSchema],
    default: []
  },
  Percentile: {
    type: Number,
    required: true
  },
  Difference: {
    type: String,
    required: true
  },
  percentageDifference: {
    type: String,
    required: true
  },
  State: {
    type: String,
    required: true
  },
  Properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Insights Schema
const insightsSchema = new mongoose.Schema({
  Trends: {
    type: [trendSchema],
    default: []
  },
  Comparisons: {
    type: [comparisonSchema],
    default: []
  }
});

// Main Player Schema
const playerSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  Password: {
    type: String,
    required: true,
    minlength: 6
  },
  fName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  Lname: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  Age: {
    type: Number,
    required: false
  },
  Bodyweight_in_pounds: {
    type: Number,
    required: false
  },
  Height_in_inches: {
    type: Number,
    required: false
  },
  SexAtBirth: {
    type: String,
    required: false,
    enum: ['Male', 'Female', 'Other']
  },
  sahhaProfileId: {
    type: String,
    default: null,
    index: true
  },
  sahhaProfileToken: {
    type: String,
    default: null
  },
  Insights: {
    type: insightsSchema,
    default: {
      Trends: [],
      Comparisons: []
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
// Note: Username and Email indexes are automatically created by unique: true
playerSchema.index({ fName: 1, Lname: 1 });

// Pre-save middleware to hash password
playerSchema.pre('save', async function(next) {
  if (!this.isModified('Password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.Password = await bcrypt.hash(this.Password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
playerSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.Password);
};

// Method to get public profile (without password)
playerSchema.methods.getPublicProfile = function() {
  const playerObject = this.toObject();
  delete playerObject.Password;
  return playerObject;
};

// Virtual for full name
playerSchema.virtual('fullName').get(function() {
  return `${this.fName} ${this.Lname}`;
});

// Ensure virtual fields are serialized
playerSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.Password;
    return ret;
  }
});

module.exports = mongoose.model('Player', playerSchema);

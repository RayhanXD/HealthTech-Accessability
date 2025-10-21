const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Main Trainer Schema
const trainerSchema = new mongoose.Schema({
  User: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
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
  lname: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  Players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }]
}, {
  timestamps: true
});

// Index for better query performance
trainerSchema.index({ User: 1 });
trainerSchema.index({ fName: 1, lname: 1 });

// Pre-save middleware to hash password
trainerSchema.pre('save', async function(next) {
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
trainerSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.Password);
};

// Method to get public profile (without password)
trainerSchema.methods.getPublicProfile = function() {
  const trainerObject = this.toObject();
  delete trainerObject.Password;
  return trainerObject;
};

// Virtual for full name
trainerSchema.virtual('fullName').get(function() {
  return `${this.fName} ${this.lname}`;
});

// Method to add player to trainer's list
trainerSchema.methods.addPlayer = function(playerId) {
  if (!this.Players.includes(playerId)) {
    this.Players.push(playerId);
  }
  return this.save();
};

// Method to remove player from trainer's list
trainerSchema.methods.removePlayer = function(playerId) {
  this.Players = this.Players.filter(id => !id.equals(playerId));
  return this.save();
};

// Ensure virtual fields are serialized
trainerSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.Password;
    return ret;
  }
});

module.exports = mongoose.model('Trainer', trainerSchema);

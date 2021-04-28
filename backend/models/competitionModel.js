const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const CompetitionSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    nameNormalized: String,
    image: String,
    isActive: Boolean,
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tasks' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    allowAny: { type: Boolean, default: false },
  },
  {
    autoCreate: true,
  },
);

const CompetitionModel = model('competitions', CompetitionSchema);

module.exports = CompetitionModel;

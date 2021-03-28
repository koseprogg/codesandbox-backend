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
  },
  {
    autoCreate: true,
  },
);

const CompetitionModel = model('competitions', CompetitionSchema);

module.exports = CompetitionModel;

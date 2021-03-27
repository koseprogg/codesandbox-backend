import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const SubmissionSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  submittedCode: String,
  score: Number,
  user: String,
  parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'tasks' },
}, {
  timestamps: true,
}, {
  collection: 'submissions',
});

const SubmissionModel = model('submissions', SubmissionSchema);

export default SubmissionModel;

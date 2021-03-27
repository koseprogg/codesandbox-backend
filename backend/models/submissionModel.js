import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const SubmissionSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  submittedCode: String,
  score: Number,
  user: String,
  date: Date,
  parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'tasks' },
}, {
  collection: 'submissions',
});

const SubmissionModel = model('submissions', SubmissionSchema);

export default SubmissionModel;

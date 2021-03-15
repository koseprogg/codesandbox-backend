import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const CompetitionSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  activeFrom: Date,
  image: String,
  activeTo: Date,
  tasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'tasks'}]
}, {
  collection: 'competitions'
});

const CompetitionModel = model('competitions', CompetitionSchema);

export default CompetitionModel;

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const upvoteSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  recordId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Upvote', upvoteSchema);
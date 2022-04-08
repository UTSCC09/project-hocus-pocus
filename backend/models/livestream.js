const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const livestreamSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  in_progress: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('Livestream', livestreamSchema);
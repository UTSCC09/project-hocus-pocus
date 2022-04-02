const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const recordSchema = new Schema({
  author: {
    type: String,
    required: true
  },
  simpleRecord: {
    type: Array,
    required: true
  },
  record: {
    type: Array,
    required: true
  },
  published: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('Record', recordSchema);
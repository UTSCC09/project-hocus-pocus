const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const recordSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  record: {
    type: Array,
    required: true
  },
  published: {
    type: Boolean,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Record', recordSchema);
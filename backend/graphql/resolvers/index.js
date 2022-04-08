const authResolver = require('./auth');
const recordResolver = require('./record');
const upvoteResolver = require('./upvote');
const livestreamResolver = require('./livestream');

const rootResolver = {
  ...authResolver,
  ...recordResolver,
  ...upvoteResolver,
  ...livestreamResolver
};

module.exports = rootResolver;
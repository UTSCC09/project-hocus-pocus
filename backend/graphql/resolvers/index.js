const authResolver = require('./auth');
const recordResolver = require('./record');
const upvoteResolver = require('./upvote');

const rootResolver = {
  ...authResolver,
  ...recordResolver,
  ...upvoteResolver
};

module.exports = rootResolver;
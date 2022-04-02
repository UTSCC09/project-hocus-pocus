const authResolver = require('./auth');
const recordResolver = require('./record');

const rootResolver = {
  ...authResolver,
  ...recordResolver
};

module.exports = rootResolver;
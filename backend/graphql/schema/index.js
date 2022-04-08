const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type User {
  _id: ID!
  email: String!
  password: String
}

type AuthData {
  userId: ID!
  token: String!
  tokenExpiration: Int!
}

type Sound {
  instrument: String!
  note: String!
}

type Note {
  offset: Int!
  sound: Sound!
  action: String!
}

type Record {
  _id: ID!
  title: String!
  author: String!
  record: [Note!]!
  published: Boolean!
  upvote: Int!
  date: String!
}

type Status {
  success: Boolean!
}

type Upvote {
  email: String!
  recordId: String!
}

input UserInput {
  email: String!
  password: String!
}

input inputSound {
  instrument: String!
  note: String!
}

input inputNote {
  offset: Int!
  sound: inputSound!
  action: String!
}

type RootQuery {
  login(email: String!, password: String!): AuthData!
  getRecordsByAuthor: [Record]!
  getRecordById(recordId: ID!): Record!
  getPublishedRecordsByPage(page: Int): [Record]!
  getUpvotesByUser: [Upvote]!
}

type RootMutation {
  createUser(userInput: UserInput): User!
  createRecord(record: [inputNote!]!, title: String!): Record!
  publishRecord(recordId: ID!): Status!
  unpublishRecord(recordId: ID!): Status!
  deleteRecord(recordId: ID!): Status!
  upvoteRecord(recordId: ID!): Status!
  undoUpvoteRecord(recordId: ID!): Status!
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`);
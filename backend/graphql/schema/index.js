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
  offset: Float!
  sound: Sound!
  action: String!
}

type Record {
  _id: ID!
  author: String!
  simpleRecord: [String!]!
  record: [Note!]!
  published: Boolean!
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
  offset: Float!
  sound: inputSound!
  action: String!
}

input inputRecord {
  simpleRecord: [String!]!
  record: [inputNote!]!
}

type RootQuery {
  login(email: String!, password: String!): AuthData!
  getRecordsByAuthor: [Record]!
  getPublishedRecordsByPage(page: Int): [Record]!
}

type RootMutation {
  createUser(userInput: UserInput): User!
  createRecord(recordInput: inputRecord): Record!
  publishRecord(recordId: ID!): Boolean!
  unpublishRecord(recordId: ID!): Boolean!
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`);
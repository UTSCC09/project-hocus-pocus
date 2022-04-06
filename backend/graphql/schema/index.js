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
  offset: String!
  sound: Sound!
  action: String!
}

type Record {
  _id: ID!
  author: String!
  record: [Note!]!
  published: Boolean!
}

type Status {
  success: Boolean!
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
  offset: String!
  sound: inputSound!
  action: String!
}

type RootQuery {
  login(email: String!, password: String!): AuthData!
  getRecordsByAuthor: [Record]!
  getPublishedRecordsByPage(page: Int): [Record]!
}

type RootMutation {
  createUser(userInput: UserInput): User!
  createRecord(record: [inputNote!]!): Record!
  publishRecord(recordId: ID!): Status!
  unpublishRecord(recordId: ID!): Status!
  deleteRecord(recordId: ID!): Status!
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`);
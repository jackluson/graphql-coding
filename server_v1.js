const express = require('express');
const graphqlHTTP = require('express-graphql');
// const { introspectionQuery } = require("graphql");
const _graphql = require('graphql');
const fetch = require("node-fetch");
const fs = require("fs");
const { makeExecutableSchema } = require("graphql-tools");
const UserRepository = require('./user-repository')

const { graphql, graphqlSync, buildSchema, buildClientSchema, printSchema, getIntrospectionQuery } = _graphql;
const userRepository = new UserRepository();

// 使用 GraphQL Schema Language 创建一个 schema
console.log('getIntrospectionQuery', getIntrospectionQuery)
console.log('userRepository', userRepository)
var schema = buildSchema(`
  "A user ."
  type User {
    id: Int!
    login: String!
    firstName: String!
    lastName: String!
  }
  "The root of it all."
  
  type Query {
    "Returns a list of users."
    users: [User],
    hello: String,
    "Returns a single user matching an ID."
    user(id: Int!): User
  }

`);

const sdlSchema = `
  type Author {
    firstName: String
    lastName: String
  }
  type Query {
    author(id: Int!): Author
  }
`;

const graphqlSchemaObj = makeExecutableSchema({
  typeDefs: sdlSchema,
  resolvers: {
    Query: {
      author: () => ({ firstName: "Ada", lastName: "Lovelace" })
    }
  }
});
console.log('-->',printSchema(graphqlSchemaObj));


const sdlString = `
  type Query {
    hello: String
  }
`;

const graphqlSchemaObj_v1 = buildSchema(sdlString);
const result = graphqlSync(graphqlSchemaObj_v1, getIntrospectionQuery()).data;
console.log('result', result)
// fetch("https://graphql-coding.jackluson.repl.co/graphql", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ query: getIntrospectionQuery() })
// })
//   .then(res => res.json())
//   .then(res =>
//     fs.writeFileSync("result.json", JSON.stringify(res.data, null, 2))
//   );

// root 提供所有 API 入口端点相应的解析器函数
var root = {
  users: () => {
    const users = userRepository.findAll();
    console.log('users', users)
    return users;
  },
  user:(params) => {
    console.log('params',params)
    return userRepository.getOneById(params.id);
  },
  hello: ()=> {
    return 'Hello World!'
  }
};

var app = express();
app.use('/graphql', graphqlHTTP.graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
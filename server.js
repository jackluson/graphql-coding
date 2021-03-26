
const express = require('express');
const graphqlHTTP = require('express-graphql');
const UserRepository = require('./user-repository')
const RoleRepository = require('./role-repository');

const userRepository = new UserRepository();
const roleRepository = new RoleRepository();
const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLSchema
} = require('graphql');

const RoleType = new GraphQLObjectType({
  name: 'Role',
  fields: {
    id: {
        type: new GraphQLNonNull(GraphQLInt)
    },
    name: {
        type: new GraphQLNonNull(GraphQLString)
    },
  }
});


const UserType = new GraphQLObjectType({ // complex type (with fields)
    name: 'User',
    fields: {
        id: {
            type: new GraphQLNonNull(GraphQLInt) // non-nullable integer
        },
        login: {
            type: new GraphQLNonNull(GraphQLString) // non-nullable string
        },
        firstName: {
            type: new GraphQLNonNull(GraphQLString) 
        },
        lastName: {
            type: new GraphQLNonNull(GraphQLString)
        },
        roles: {
          type: RoleType,
          resolve:(user)=> {
            return roleRepository.findByUserId(user.id);
          }
        }
    }
});

const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        users: {
            type: new GraphQLList(UserType), // a list of users
            resolve: () => {
                return userRepository.findAll();
            }
        },
        user: {
            type: UserType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            /* in this notation, the resolver function takes the
             * parent object as first parameter, and the arguments
             * as second.
             */
            resolve: (user, args) => { 
                return userRepository.findOneById(args.id);
            }
        }
    }
});

const MutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createUser: {
          type: UserType,
            args: {
                login: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                firstName: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                lastName: {
                    type: new GraphQLNonNull(GraphQLString)
                },
            },
            resolve: (root, args) => {
                console.log('args', args)
                return userRepository.create(args);
            }
        }
    }
});

/* 4. Stitch everything together.
 */
const schema = new GraphQLSchema({
    query: QueryType,
    mutation: MutationType
});     

/* 5. Update the GraphQL middleware options.
 */

var app = express();
app.use('/graphql', graphqlHTTP.graphqlHTTP({
    schema,
    graphiql: true,
}));


// app.use('/graphql', graphqlHTTP.graphqlHTTP({
//   schema: schema,
//   rootValue: root,
//   graphiql: true,
// }));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql'); 
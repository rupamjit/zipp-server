import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import { ApolloServer } from "@apollo/server";
import bodyParser from "body-parser";

export async function initServer() {
  const app = express();
  app.use(bodyParser.json())
  const server = new ApolloServer({
    typeDefs: `
    type Query {
    sayHello:String
    }
    `,
    resolvers: {
      Query: {
        sayHello: () => console.log("Hello from Graphql server"),
      },
      
    },
  });

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  return app;
}

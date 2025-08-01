import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import { ApolloServer } from "@apollo/server";
import bodyParser from "body-parser";
import { User } from "./user";
import cors from "cors"
export async function initServer() {
  const app = express();
  app.use(cors())
  app.use(bodyParser.json());
  const server = new ApolloServer({
    typeDefs: `
    ${User.types}

    type Query {
        ${User.queries}
    }

    `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
      },
    },
  });

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  return app;
}

import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import { ApolloServer } from "@apollo/server";
import bodyParser from "body-parser";
import { User } from "./user";
import cors from "cors";
import { GraphqlContext } from "../interfaces";
import JWTService from "../services/jwt";
import { Tweet } from "./tweet";
export async function initServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `
    ${User.types}
    ${Tweet.types}

    type Query {
        ${User.queries}
        ${Tweet.queries}
    }

    type Mutation {
        ${Tweet.mutations}
    }

    `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
        ...Tweet.resolvers.queries
      },
      Mutation:{
        ...Tweet.resolvers.mutations
      },
      ...Tweet.resolvers.extraResolvers,
      ...User.resolvers.extraResolvers
    },
  });

  await graphqlServer.start();

  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || "";

        const token = authHeader.startsWith("Bearer ")
          ? authHeader.substring(7)
          : "";

        const user = token ? JWTService.decodeToken(token) : null;
        return { user };
      },
    })
  );

  return app;
}

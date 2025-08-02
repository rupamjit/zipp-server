import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import { ApolloServer } from "@apollo/server";
import bodyParser from "body-parser";
import { User } from "./user";
import cors from "cors";
import { GraphqlContext } from "../interfaces";
import JWTService from "../services/jwt";
export async function initServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  const graphqlServer = new ApolloServer<GraphqlContext>({
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

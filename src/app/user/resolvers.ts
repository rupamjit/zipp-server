import axios from "axios";
import { prismaClient } from "../../client/db";
import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../interfaces";
import { User } from "@prisma/client";

interface GoogleTokenResult {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: string;
  nbf: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: string;
  exp: string;
  jti: string;
  alg: string;
  kid: string;
  typ: string;
}

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const googleToken = token;
    const googleOauthBaseURL = new URL(
      "https://oauth2.googleapis.com/tokeninfo"
    );
    googleOauthBaseURL.searchParams.set("id_token", googleToken);

    const { data: googleResponse } = await axios.get<GoogleTokenResult>(
      googleOauthBaseURL.toString(),
      {
        responseType: "json",
      }
    );

    const checkForUser = await prismaClient.user.findUnique({
      where: {
        email: googleResponse.email,
      },
    });

    if (!checkForUser) {
      await prismaClient.user.create({
        data: {
          email: googleResponse.email,
          firstName: googleResponse.given_name,
          lastName: googleResponse.family_name,
          profileImageUrl: googleResponse.picture,
        },
      });
    }

    const userInDB = await prismaClient.user.findUnique({
      where: {
        email: googleResponse.email,
      },
    });

    if (!userInDB) throw new Error("User with this email not found!!!");

    const userToken = JWTService.generateTokenForUser(userInDB);

    return userToken;
  },
  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    const id = ctx.user?.id;
    if (!id) return null;
    const getUser = await prismaClient.user.findUnique({
      where: {
        id,
      },
    });
    return getUser;
  },

};

const extraResolvers = {
  User :{
    tweets:async(parent:User)=>{
      const tweets = prismaClient.tweet.findMany({
        where:{
          authorId:parent.id
        }
      })
      return tweets
  }
  }
}

export const resolvers = { queries,extraResolvers };

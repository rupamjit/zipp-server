import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";

interface CreateTweetPayload {
  content: string;
  imageUrl?: string;
}

const mutations = {
  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("You are not authenticated");

    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl,
        author: { connect: { id: ctx.user.id } },
      },
    });

    return tweet;
  },
};

const extraResolvers = {
  Tweet:{
    author:async(parent:Tweet)=>{
      const author = await prismaClient.user.findUnique({
        where:{
          id:parent.authorId
        }
      })
      return author
    }
  }
}

const queries = {
  getAllTweets:async()=>{
    const allTweets = prismaClient.tweet.findMany({
      orderBy:{
        createdAt:"desc"
      }
    });
    return allTweets;
  }
}

export const resolvers = {mutations,extraResolvers,queries}


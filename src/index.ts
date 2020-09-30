import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

const main = async () => {
  // connection to the database
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  // initiate express server
  const app = express();
  // redis implementation
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  // run the session middleware before the apollo middleware because it will be used inside apollo
  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        // look into this setting
        sameSite: "lax",
        secure: __prod__, // cookie only works in https
      },
      secret: "aaroisetnarosietnaorisetnaorisent",
      resave: false,
    })
  );
  // create a new instance of ApolloServer
  const apolloServer = new ApolloServer({
    // passing in our schema
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      // not sure why false
      validate: false,
    }),
    // context is an object that is accessible by all the resolvers
    context: ({req, res}): MyContext => ({ em: orm.em, req, res }),
  });
  // apply apollo middleware
  apolloServer.applyMiddleware({ app });
  // listen on port 4000
  app.listen(4000, () => {
    console.log("server started on localhost: 4000");
  });
};

main().catch((err) => {
  console.error(err);
});

// import { Post } from "./entities/Posts";
// example of how to create a post with mikro-orm
// const post = orm.em.create(Post, {title: 'my first post'});
// await orm.em.persistAndFlush(post);

// example of how to fetch for all posts with mikro-orm
// const posts = await orm.em.find(Post, {});

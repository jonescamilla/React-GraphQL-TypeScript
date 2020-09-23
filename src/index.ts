import 'reflect-metadata';
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  // connection to the database
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  // initiate express server
  const app = express();
  // create a new instance of ApolloServer
  const apolloServer = new ApolloServer({
    // passing in our schema
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      // not sure why false
      validate: false
    }),
    // context is an object that is accessible by all the resolvers
    context: () => ({ em: orm.em })
  });
  // apply apollo middleware
  apolloServer.applyMiddleware({ app });
  // listen on port 4000
  app.listen(4000, () => {
    console.log('server started on localhost: 4000');
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
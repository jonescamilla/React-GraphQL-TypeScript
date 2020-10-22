// apollo and type imports
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
// sessions imports
import Redis from 'ioredis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './constants';
// resolvers
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
// typeorm
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';

const main = async () => {
  await createConnection({
    type: 'postgres',
    database: 'lireddit2',
    // username: 'postgres',
    // password: 'postgres',
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [Post, User],
  });

  // await conn.runMigrations();
  // initiate express server
  const app = express();
  // redis implementation
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );
  // run the session middleware before the apollo middleware because it will be used inside apollo
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        // look into this setting
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https
      },
      // turn off saving data that isn't initialized
      saveUninitialized: false,
      secret: 'aaroisetnarosietnaorisetnaorisent',
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
    context: ({ req, res }) => ({ req, res, redis }),
  });
  // apply apollo middleware
  apolloServer.applyMiddleware({ app, cors: false });
  // listen on port 4000
  app.listen(4000, () => {
    console.log('server started on localhost: 4000');
  });
};

// error handler
main().catch((err) => {
  console.error(err);
});

// import { Post } from './entities/Posts';
// example of how to create a post with mikro-orm
// const post = orm.em.create(Post, {title: 'my first post'});
// await orm.em.persistAndFlush(post);

// example of how to fetch for all posts with mikro-orm
// const posts = await orm.em.find(Post, {});

/*
sessions notes

// store information
req.session.userId = user.id;

{ userId: 1 } -> send this to redis

// step 1
sess: oirsentaoinoaires -> { userId: 1 }

// step 2
express-session will set a cookie on my browser ex: oairesnto39458lrsietn3oienatorisent

// step 3 - when a user makes a request
oairesnto39458lrsietn3oienatorisent -> sent to the server

// step 4 - the server will decrypt the cookie
oairesnto39458lrsietn3oienatorisent -> sess: oirsentaoinoaires

// step 5 - make a request to redis
sess: oirsentaoinoaires -> { userId: 1 }

req.session
*/

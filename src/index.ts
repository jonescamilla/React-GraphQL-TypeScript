import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Posts";
import microConfig from './mikro-orm.config';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  // example of how to create a post with mikro-orm
  // const post = orm.em.create(Post, {title: 'my first post'});
  // await orm.em.persistAndFlush(post);

  // example of how to fetch for all posts with mikro-orm
  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
};

main().catch((err) => {
  console.error(err);
});

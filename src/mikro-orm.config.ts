import { __prod__ } from "./constants";
import { Post } from "./entities/Posts";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';

export default {
  migrations: {
    // create an absolute path to where it was called in using dirname
    path: path.join(__dirname, './migrations'),
    // allow to work with both js and ts files
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  // array of entities
  entities: [Post],
  dbName: 'lireddit',
  // empty is allowed for both the user and the password because postgresql are running natively
  user: '',
  password: '',
  // type of database for mikro-orm
  type: 'postgresql',
  // enabling based on reference on production or lack of
  debug: !__prod__,
  // getting the parameters of MikroORM and setting it to the first of the array that is returned in <typeof>
} as Parameters<typeof MikroORM.init>[0];
import { __prod__ } from "./constrants";

import { Post } from "./entities/post";
import { User } from "./entities/user";

import { MikroORM } from "@mikro-orm/core";

import path from "path";

const mikroConfig: Parameters<typeof MikroORM.init>[0] = {
  entities: [Post, User],
  dbName: "lireddit",
  type: "postgresql",
  user: "postgres",
  password: "mysecretpassword",
  debug: !__prod__,
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
};

export default mikroConfig;

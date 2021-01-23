import { __prod__ } from "./constrants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";

import path from "path";

const mikroConfig: Parameters<typeof MikroORM.init>[0] = {
  entities: [Post],
  dbName: "lireddit",
  type: "postgresql",
  debug: !__prod__,
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
};

export default mikroConfig;

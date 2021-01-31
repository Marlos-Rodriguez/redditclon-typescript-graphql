import "reflect-metadata";

import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./mikro-orm.config";
import express, { Express } from "express";

import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import redis from "redis";
import session from "express-session";

import redisSession from "connect-redis";
import { __prod__ } from "./constrants";
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  console.log("DB Connect");

  const app: Express = express();

  const RedisStore = redisSession(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: __prod__, sameSite: "lax" },
      secret: "mhinugmbu",
      saveUninitialized: false,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("Server on port 4000");
  });
};

main().catch((err) => console.error(err));

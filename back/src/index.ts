import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./mikro-orm.config";
import express, { Express } from "express";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app: Express = express();

  app.listen(4000, () => {
    console.log("Server on port 4000");
  });
};

main().catch((err) => console.error(err));

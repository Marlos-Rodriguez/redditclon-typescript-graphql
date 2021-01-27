import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/user";

import argon2 from "argon2";

@InputType()
class UserInput {
  @Field()
  usermame: string;

  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  //Register User
  @Mutation(() => [User])
  async register(@Ctx() { em }: MyContext, @Arg("options") options: UserInput): Promise<User> {
    const hashPassword = await argon2.hash(options.password);

    const user = em.create(User, { username: options.usermame, password: hashPassword });
    await em.persistAndFlush(user);

    return user;
  }
}

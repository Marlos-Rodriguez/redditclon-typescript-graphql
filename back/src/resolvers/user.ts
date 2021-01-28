import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
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

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  //Register User
  @Mutation(() => User)
  async register(@Ctx() { em }: MyContext, @Arg("options") options: UserInput): Promise<User> {
    const hashPassword = await argon2.hash(options.password);

    const user = em.create(User, {
      username: options.usermame.toLocaleLowerCase(),
      password: hashPassword,
    });
    await em.persistAndFlush(user);

    return user;
  }
  //Login User
  @Mutation(() => UserResponse)
  async login(@Ctx() { em }: MyContext, @Arg("options") options: UserInput): Promise<UserResponse> {
    const user = await em.findOneOrFail(User, { username: options.usermame.toLocaleLowerCase() });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Username not found",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrent Passowrd",
          },
        ],
      };
    }

    return { user };
  }
}

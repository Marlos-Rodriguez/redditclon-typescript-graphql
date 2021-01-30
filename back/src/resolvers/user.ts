import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/user";

import argon2 from "argon2";

@InputType()
class UserInput {
  @Field()
  username: string;

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
  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em }: MyContext,
    @Arg("options") options: UserInput
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [{ field: "username", message: "Username must be at least 2 characters long" }],
      };
    }

    if (options.password.length < 6) {
      return {
        errors: [{ field: "password", message: "Password must be at least 6 characters long" }],
      };
    }
    const hashPassword = await argon2.hash(options.password);

    const user = em.create(User, {
      username: options.username.toLocaleLowerCase(),
      password: hashPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (
        error.code === "23505" ||
        error.detail.includes("already exists" || error.message.includes("duplicate key value"))
      ) {
        return {
          errors: [{ field: "username", message: "Username Already Exits" }],
        };
      }
    }

    return { user };
  }
  //Login User
  @Mutation(() => UserResponse)
  async login(@Ctx() { em }: MyContext, @Arg("options") options: UserInput): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username.toLocaleLowerCase() });

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

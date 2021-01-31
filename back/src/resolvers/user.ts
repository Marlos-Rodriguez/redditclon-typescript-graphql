import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver, Query } from "type-graphql";
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
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });

    if (!user) {
      return null;
    }

    return user;
  }
  //Register User
  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em, req }: MyContext,
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

    req.session.userId = user.id;

    return { user };
  }
  //Login User
  @Mutation(() => UserResponse)
  async login(
    @Ctx() { em, req }: MyContext,
    @Arg("options") options: UserInput
  ): Promise<UserResponse> {
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

    req.session.userId = user.id;

    return { user };
  }
}

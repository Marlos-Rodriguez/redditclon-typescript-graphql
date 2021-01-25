import { Post } from "../entities/post";
import { Ctx, Query, Resolver } from "type-graphql";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  post(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }
}

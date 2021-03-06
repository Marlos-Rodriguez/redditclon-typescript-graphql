import { Post } from "../entities/post";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
  //Get all post
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  //Get one post
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  //Create Post
  @Mutation(() => Post)
  async createPost(@Arg("title") title: string, @Ctx() { em }: MyContext): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);

    return post;
  }

  //Update Post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("title") title: string,
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }

    if (title.trim().length > 0) {
      post.title = title;
      await em.persistAndFlush(post);
    }

    return post;
  }

  //Delete post
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<Boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  }
}

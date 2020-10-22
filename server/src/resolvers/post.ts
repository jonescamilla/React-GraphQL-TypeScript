import { isAuth } from '../middleware/isAuth';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { Post } from '../entities/Post';
import { getConnection } from 'typeorm';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver(Post)
export class PostResolver {
  // to set the type for type-graphql of an array you wrap the type in square brackets
  @Query(() => [Post])
  async posts(
    @Arg('limit', (_type) => Int) limit: number,
    // will be taking in the date of the posts last rendered
    @Arg('cursor', (_type) => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    // set a hard limit of fifty
    const realLimit = Math.min(50, limit);
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder('p')
      // wrap in single quotes to send the sting with the quotes else the sting gets auto-edited
      .orderBy('"createdAt"', 'DESC')
      .take(realLimit);
    // if we are passed in a cursor then we will add a where clause to our query builder
    if (cursor) {
      // if it is
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    }
    // return query at the end
    return qb.getMany();
  }

  // to set the type or potentially null type-graphql has an object with options
  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ id });
    if (!post) return null;
    if (typeof title !== undefined) {
      Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<Boolean> {
    await Post.delete(id);
    return false;
  }

  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    // set up a text snippet in the back end
    return root.text.slice(0, 50);
  }
}

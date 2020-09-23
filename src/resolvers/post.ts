import { Post } from '../entities/Posts';
import { MyContext } from 'src/types';
import { Resolver, Query, Ctx, Arg, Int } from 'type-graphql';

@Resolver()
export class PostResolver {
  // to set the type for type-graphql of an array you wrap the type in square brackets
  @Query(() => [Post])
  posts(@Ctx() {em}: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }
  // to set the type or potentially null type-graphql has an object with options
  @Query(() => Post, {nullable: true})
  post(
    @Arg('id', () => Int) id: number,
    @Ctx() {em}: MyContext
    ): Promise<Post | null> {
    return em.findOne(Post, {id});
  }
}
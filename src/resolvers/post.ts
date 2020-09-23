import { Post } from 'src/entities/Posts';
import { MyContext } from 'src/types';
import { Resolver, Query, Ctx } from 'type-graphql';

@Resolver()
export class PostResolver {
  // to set the type for type-graphql you 
  @Query(() => [Post])
  posts(@Ctx() {em}: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }
}
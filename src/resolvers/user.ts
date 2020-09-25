import { User } from 'src/entities/user';
import { MyContext } from 'src/types';
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

// a different way of doing your typing for type-graphql
// decorate with an inputType
@InputType()
class UserNamePasswordInput {
  // add necessary fields
  @Field()
  username: string
  @Field()
  password: string
}

@Resolver()
export class HelloResolver {
  @Mutation(() => String)
  async register(
    // label the args how you'd like and reference the class created above
    @Arg('options') options: UserNamePasswordInput,
    @Ctx() {em}: MyContext
  ) {
    const user = em.create(User, {username: options.username});
    await em.persistAndFlush(user);
    return 'bye';
  }
};
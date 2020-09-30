import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
  Query,
} from "type-graphql";
import argon2 from "argon2";

// a different way of doing your typing for type-graphql
// decorate with an inputType
@InputType()
class UserNamePasswordInput {
  // add necessary fields
  @Field()
  username: string;
  @Field()
  password: string;
}

// ObjectTypes are returnable unlike InputTypes that are argument/parameters
@ObjectType()
class FieldError {
  // where the error originated from
  @Field()
  field: string;
  // custom prompt
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  // if there is an error return the error
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  // if there is a user return the user
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  // Query for all users
  @Query(() => [User])
  users(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

  @Query(() => User, { nullable: true })
  user(
    @Arg("username") username: string,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    return em.findOne(User, { username });
  }

  @Mutation(() => UserResponse)
  async register(
    // label the args how you'd like and reference the class created above
    @Arg("options") options: UserNamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2)
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      };
    if (options.password.length <= 3)
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 3",
          },
        ],
      };
    // hash the password using argon2
    const hashedPassword = await argon2.hash(options.password);
    // create the user
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      // duplicate user error
      if (err.code === "23505")
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UserNamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    // query for the user in the db
    const user = await em.findOne(User, { username: options.username });
    // if the user doesn't exist then return an error
    if (!user)
      return {
        errors: [
          {
            field: "username",
            message: "that username doesn't exist",
          },
        ],
      };
    // receive the validation (boolean)from argon2 on the user's password
    const valid = await argon2.verify(user.password, options.password);
    // if the validation returned false then return an error
    if (!valid)
      return {
        errors: [
          {
            field: "password",
            message: "invalid login",
          },
        ],
      };
    return { user };
  }
}

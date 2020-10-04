import { EntityManager } from "@mikro-orm/postgresql";
import argon2 from "argon2";
import { validateRegister } from "../utils/validateRegister";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver
} from "type-graphql";
import { COOKIE_NAME } from "../constants";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { UsernamePasswordInput } from "./UsernamePasswordInput";

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
  // forgot password
  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") _email: string, @Ctx() { /* req */}: MyContext) {
    // const user = await email.findOne(User, { email });
    return true;
  }

  // Query for all users
  @Query(() => [User])
  users(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

  // me query
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    // you are not logged in
    if (!req.session.userId) return null;
    // else fetch the user
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  // individual user query
  @Query(() => User, { nullable: true })
  user(
    @Arg("username") username: string,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    return em.findOne(User, { username });
  }

  // register query with abstracted validation
  @Mutation(() => UserResponse)
  async register(
    // label the args how you'd like and reference the class created above
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // abstracted error/register validation
    const errors = validateRegister(options);
    // if there were errors in validation then return those errors
    if (errors) return { errors };
    // hash the password using argon2
    const hashedPassword = await argon2.hash(options.password);
    // create the user
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        // inserting all of the data below
        .insert({
          email: options.email,
          username: options.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        // returning all
        .returning("*");
      user = result[0];
    } catch (err) {
      // duplicate user error code
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }
    // store user id session and set a cookie on the user and keep them logged in
    req.session.userId = user.id;

    return { user };
  }

  // login mutation with inline login validation 
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // query for the user in the db
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
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
    const valid = await argon2.verify(user.password, password);
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
    // set the session id to be the user id
    req.session.userId = user.id;

    return { user };
  }

  // logout out mutation
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      // remove the cookie from redis
      req.session.destroy((err) => {
        // remove the cookie from the user
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}

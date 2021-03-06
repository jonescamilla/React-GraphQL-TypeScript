import argon2 from 'argon2';
import { validateRegister } from '../utils/validateRegister';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';
import { getConnection } from 'typeorm';

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
  users(@Ctx() {}: MyContext): Promise<User[]> {
    return User.find({});
  }

  // me query by session id
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // you are not logged in
    if (!req.session.userId) return null;
    // else fetch the user
    return User.findOne({ id: req.session.userId });
  }

  // individual user query by username
  @Query(() => User, { nullable: true })
  user(
    @Arg('username') username: string,
    @Ctx() {}: MyContext
  ): Promise<User | undefined> {
    return User.findOne({ where: { username } });
  }

  // register query with abstracted validation
  @Mutation(() => UserResponse)
  async register(
    // label the args how you'd like and reference the class created above
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
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
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: options.email,
          username: options.username,
          password: hashedPassword,
        })
        // returning all
        .returning('*')
        .execute();
      user = result.raw[0];
    } catch (err) {
      // duplicate user error code
      if (err.code === '23505') {
        return {
          errors: [{ field: 'username', message: 'username already taken' }],
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
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // query for the user in the db
    const user = await User.findOne({
      where: usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    });
    // if the user doesn't exist then return an error
    if (!user)
      return {
        errors: [{ field: 'usernameOrEmail', message: 'invalid user' }],
      };
    // receive the validation (boolean)from argon2 on the user's password
    const valid = await argon2.verify(user.password, password);
    // if the validation returned false then return an error
    if (!valid)
      return {
        errors: [
          {
            field: 'password',
            message: 'invalid password',
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
  // forgot password
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    // if no user then the email is not in db
    if (!user) return true;
    // creating a token with uuid
    const token = v4();
    // storing in redis
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      // up to 3 days to use forget password
      1000 * 60 * 60 * 24 * 3
    );

    await sendEmail(
      email,
      // when the user changes the password sends us this token back
      // we will look up the value to get the user id
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }

  // change password
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    // password validation;
    if (newPassword.length <= 2) {
      return {
        errors: [
          { field: 'newPassword', message: 'length must be greater than 2' },
        ],
      };
    }
    // user key for password change
    const key = FORGET_PASSWORD_PREFIX + token;
    // token validation through redis
    const userId = await redis.get(key);
    // if there is no user then the token was either tampered with or the token expired
    if (!userId) {
      return { errors: [{ field: 'token', message: 'expired token' }] };
    }
    // parsed int of user id that was originally num
    const userIdNum = parseInt(userId);
    // get the user from the db to modify them
    const user = await User.findOne(userIdNum);
    // if the user doesn't come back then the user must no longer exist
    if (!user) {
      return { errors: [{ field: 'token', message: 'user no longer exists' }] };
    }
    // once all the check have passed you can set the user's password to be the new hashed password
    // set the user in the db
    User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key);
    // log in user after change password
    req.session.userId = user.id;

    return { user };
  }
}

import { Field, InputType } from "type-graphql";

// a different way of doing your typing for type-graphql
// decorate with an inputType

@InputType()
export class UsernamePasswordInput {
  // add necessary fields
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}

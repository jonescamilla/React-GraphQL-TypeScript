import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

// decorator of ObjectType to convert classes to graphql type with graphql-type
@ObjectType()
// entity decorator
@Entity()
export class User {
  // Field decorator exposes to graphql schema
  @Field(() => Int)
  @PrimaryKey()
  id!: number;
  // there will be a date on creation
  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();
  // date on update
  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();
  // && title
  @Field()
  @Property({ type: "text", unique: true })
  username!: string;

  @Field()
  @Property({ type: "text", unique: true })
  email!: string;

  @Property({ type: "text" })
  password!: string;
}

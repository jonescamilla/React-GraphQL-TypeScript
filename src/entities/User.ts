import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType} from "type-graphql";

// decorator of ObjectType to convert classes to graphql type with graphql-type
@ObjectType()
// entity decorator
@Entity()
export class User {
  // Field decorator exposes to graphql schema
  @Field()
  @PrimaryKey()
  id!: number;
  // there will be a date on creation
  @Field(() => String)
  @Property({ type: 'date'})
  createdAt = new Date();
  // date on update
  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();
  // && title
  @Field()
  @Property({type: 'text', unique: true})
  title!: string;

  @Field()
  @Property({type: 'text'})
  password!: string;
}
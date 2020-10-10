import { Field, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// decorator of ObjectType to convert classes to graphql type with graphql-type
@ObjectType()
// entity decorator
@Entity()
export class Post {
  // Field decorator exposes to graphql schema
  // the post will have an id
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;
  // there will be a date on creation
  // the @CreateDateColumn will handle setting the date at creation
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
  // date on update
  // the @UpdateDateColumn will handle updating the date when modified
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
  // && title
  @Field()
  @Column()
  title!: string;
}

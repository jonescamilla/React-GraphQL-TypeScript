import { Field, Int, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
// decorator of ObjectType to convert classes to graphql type with graphql-type
@ObjectType()
// entity decorator
@Entity()
export class Post extends BaseEntity {
  // Field decorator exposes to graphql schema
  // the post will have an id
  @Field(() => Int)
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

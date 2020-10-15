import { Field, Int, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
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
  // expose and add a created Id to the creator
  @Field()
  @Column()
  creatorId: number;
  // expose and add a many to one of a user
  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number;
}

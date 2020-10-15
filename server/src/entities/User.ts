import { __Type } from 'graphql';
import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './Post';

// decorator of ObjectType to convert classes to graphql type with graphql-type
@ObjectType()
// entity decorator
@Entity()
// extends base entity allows calls to the class to auto refer to the primary generated column
export class User extends BaseEntity {
  // Field decorator exposes to graphql schema
  @Field((_type) => Int)
  @PrimaryGeneratedColumn()
  id!: number;
  // there will be a date on creation
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
  // date on update
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
  // && title
  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;
  // expose and a one to many with an arry of posts
  @Field((_type) => [Post])
  @OneToMany(() => Post, (post) => post.creatorId)
  posts: Post[];
}

import { Field, Int, ObjectType } from 'type-graphql';
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
export class User {
  // Field decorator exposes to graphql schema
  @Field(() => Int)
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
}

import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Post {
  // the post will have an id
  @PrimaryKey()
  id!: number;
  // there will be a date on creation
  @Property({ type: 'date'})
  createdAt = new Date();
  // date on update
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();
  // && title
  @Property({type: 'text'})
  title!: string;
}

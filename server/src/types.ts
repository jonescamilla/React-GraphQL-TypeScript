import { IDatabaseDriver, Connection, EntityManager } from "@mikro-orm/core";
import { Request, Response } from "express";

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  // setting the session and joining the two types
  req: Request & { session: Express.Session };
  res: Response;
};

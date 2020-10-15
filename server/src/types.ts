import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContext = {
  // setting the session and joining the two types
  req: Request & { session: Express.Session };
  res: Response;
  redis: Redis;
};

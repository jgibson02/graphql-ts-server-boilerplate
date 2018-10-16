import { Request, Response } from 'express';
import { User } from '../entity/User';
import { redis } from '../redis';

export const confirmEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userID = await redis.get(id);
  if (userID) {
    await User.update({ id: userID }, { confirmed: true });
    await redis.del(id);
    res.send("ok");
  } else {
    res.send('invalid');
  }
}
import * as Redis from "ioredis";
import fetch from 'node-fetch';

import { User } from "../entity/User";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeORMConn } from "./createTypeORMConn";

let userID = "";
const redis = new Redis();

beforeAll(async () => {
  await createTypeORMConn();
  const user = await User.create({
    email: "bob5@bob.com",
    password: "jsakldfjalsdf"
  }).save();
  userID = user.id;
});

describe('Test createConfirmEmailLink', () => {
  test('Make sure it confirms user and clears key in redis', async () => {
    const url = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userID,
      redis
    );

    const response = await fetch(url);
    const text = await response.text();
    expect(text).toEqual('ok');
    const user = await User.findOne({ where: { id: userID } });
    expect((user as User).confirmed).toBeTruthy();
    const chunks = url.split('/');
    const key = chunks[chunks.length - 1]; // grabbing ID from confirm link URL
    const value = await redis.get(key);
    expect(value).toBeNull();
  });
  test("Sends invalid back if bad id sent", async () => {
    const response = await fetch(`${process.env.TEST_HOST}/confirm/12083`);
    const text = await response.text();
    expect(text).toEqual('invalid');
  });
});
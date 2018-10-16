import * as Redis from "ioredis";
import fetch from "node-fetch";
import { Connection } from "typeorm";
import { User } from "../entity/User";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeORMConn } from "./createTypeORMConn";

let userID = "";
const redis = new Redis();

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeORMConn();
  const user = await User.create({
    email: "bob5@bob.com",
    password: "jsakldfjalsdf"
  }).save();
  userID = user.id;
});

afterAll(async () => {
  conn.close();
});

test("Make sure it confirms user and clears key in redis", async () => {
  const url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userID,
    redis
  );

  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual("ok");
  const user = await User.findOne({ where: { id: userID } });
  expect((user as User).confirmed).toBeTruthy();
  const chunks = url.split("/");
  const key = chunks[chunks.length - 1]; // grabbing ID from confirm link URL
  const value = await redis.get(key);
  expect(value).toBeNull();
});

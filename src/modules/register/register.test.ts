import { request } from 'graphql-request';
import { User } from '../../entity/User';
import { createTypeORMConn } from '../../utils/createTypeORMConn';
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './errorMessages';

const email = 'tom@bob.com';
const password = 'aeasdfasfd';

const mutation = (e: string, p: string) => `
mutation {
  register(email: "${e}", password: "${p}") {
    path
    message
  }
}
`

beforeAll(async () => {
  await createTypeORMConn();
});

describe("Register user", async () => {
  test('check able to register a user', async () => {
    const response = await request(process.env.TEST_HOST as string, mutation(email, password));
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  test('check for duplicate emails', async () => {
    const response: any = await request(process.env.TEST_HOST as string, mutation(email, password));
    expect(response.register).toHaveLength(1);
    expect(response.register[0]).toEqual({
      message: duplicateEmail,
      path: 'email'
    });
  });
  
  test('check bad email', async () => {
    const response: any = await request(process.env.TEST_HOST as string, mutation("b", password));
    expect(response).toEqual({
      register: [
        {
          message: emailNotLongEnough,
          path: "email"
        },
        {
          message: invalidEmail,
          path: "email"
        }
      ]
    });
  });  

  test('check bad password', async () => {
    const response: any = await request(process.env.TEST_HOST as string, mutation(email, 'ad'));
    expect(response).toEqual({
      register: [
        {
          message: passwordNotLongEnough,
          path: 'password'
        }
      ]
    });
  });

  test('check bad password and bad email', async () => {
    const response: any = await request(process.env.TEST_HOST as string, mutation('df', 'ad'));
    expect(response).toEqual({
      register: [
        {
          message: emailNotLongEnough,
          path: 'email'
        },
        {
          message: invalidEmail,
          path: 'email'
        },
        {
          message: passwordNotLongEnough,
          path: 'password'
        }
      ]
    });
  });
});
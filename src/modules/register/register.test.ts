import { request } from 'graphql-request';
import { User } from '../../entity/User';
import { startServer } from '../../startServer';
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './errorMessages';

let getHost = () => '';

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as any;
  getHost = () => `http://127.0.0.1:${port}`;
});

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

describe("Register user", async () => {
  test('check able to register a user', async () => {
    const response = await request(getHost(), mutation(email, password));
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  test('check for duplicate emails', async () => {
    const response: any = await request(getHost(), mutation(email, password));
    expect(response.register).toHaveLength(1);
    expect(response.register[0]).toEqual({
      message: duplicateEmail,
      path: 'email'
    });
  });
  
  test('check bad email', async () => {
    const response: any = await request(getHost(), mutation("b", password));
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
    const response: any = await request(getHost(), mutation(email, 'ad'));
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
    const response: any = await request(getHost(), mutation('df', 'ad'));
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
import * as bcrypt from 'bcryptjs';
import { User } from './entity/User';
import { ResolverMap } from './types/graphql-utils';
import { GQL } from './types/schema';

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword,
      });

      await user.save();
      return true;
    }
  },
  Query: {
    hello: (_, { name }: GQL.IHelloOnQueryArguments) => `Bye ${name || 'World'}`,
  }
}; 
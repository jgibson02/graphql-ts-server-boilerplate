import * as bcrypt from 'bcryptjs';
import * as yup from 'yup';
import { v4 } from 'uuid';
import { User } from '../../entity/User';
import { ResolverMap } from '../../types/graphql-utils';
import { formatYupError } from '../../utils/formatYupError';
import { createConfirmEmailLink } from './../../utils/createConfirmEmailLink';
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";
import { sendEmail } from "../../utils/sendEmail";
import { GQL } from "../../types/schema";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
  password: yup
    .string()
    .min(3, passwordNotLongEnough)
    .max(255)
});

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url }
    ) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }
      const { email, password } = args;
      const userAlreadyExists = await User.findOne({
        select: ["id"],
        where: { email }
      });
      if (userAlreadyExists) {
        return [{ message: duplicateEmail, path: "email" }];
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        id: v4(),
        email,
        password: hashedPassword
      });

      await user.save();

      if (process.env.NODE_ENV !== 'test ') {
        await sendEmail(email, await createConfirmEmailLink(url, user.id, redis));
      }

      return null;
    }
  },
  Query: { bye: () => "bye" }
};

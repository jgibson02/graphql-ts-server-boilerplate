import { ValidationError } from "yup";

export const formatYupError = (err: ValidationError) => {
  const errors: Array<{path: string, message: string}> = [];
  err.inner.forEach(e => {
    errors.push({
      message: e.message,
      path: e.path
    });
  });
  return errors;
}
import { validationResult } from 'express-validator';
import { error } from '../utils/response.js';

export default function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(
      res,
      422,
      'Validation failed',
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
}

import { error } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return error(res, 409, 'Resource already exists (duplicate entry)');
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return error(res, 422, 'Validation failed', errors);
  }
  // Mongoose invalid ObjectId (bad :id param)
  if (err.name === 'CastError') {
    return error(res, 400, 'Invalid resource id');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return error(res, statusCode, message);
}

export function notFound(req, res) {
  return error(res, 404, `Route ${req.originalUrl} not found`);
}

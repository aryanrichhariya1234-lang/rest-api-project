import { body, param, query } from 'express-validator';

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('category').optional().trim().isLength({ max: 100 }),
];

export const updateProductValidator = [
  param('id').isMongoId().withMessage('Invalid product id'),
  body('name').optional().trim().notEmpty().isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('quantity').optional().isInt({ min: 0 }),
  body('category').optional().trim().isLength({ max: 100 }),
];

export const idParamValidator = [param('id').isMongoId().withMessage('Invalid product id')];

export const listQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().trim(),
  query('search').optional().trim(),
];

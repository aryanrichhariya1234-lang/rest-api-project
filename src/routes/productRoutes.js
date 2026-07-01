import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  createProductValidator,
  updateProductValidator,
  idParamValidator,
  listQueryValidator,
} from '../validators/productValidator.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: List products (paginated, filterable)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of products }
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               quantity: { type: integer }
 *               category: { type: string }
 *     responses:
 *       201: { description: Product created }
 *       422: { description: Validation failed }
 */
router
  .route('/')
  .get(authenticate, listQueryValidator, validate, productController.getProducts)
  .post(authenticate, createProductValidator, validate, productController.createProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product found }
 *       404: { description: Product not found }
 *   put:
 *     summary: Update a product (owner or admin only)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product updated }
 *       403: { description: Forbidden }
 *       404: { description: Product not found }
 *   delete:
 *     summary: Delete a product (owner or admin only)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product deleted }
 *       403: { description: Forbidden }
 *       404: { description: Product not found }
 */
router
  .route('/:id')
  .get(authenticate, idParamValidator, validate, productController.getProductById)
  .put(authenticate, updateProductValidator, validate, productController.updateProduct)
  .delete(authenticate, idParamValidator, validate, productController.deleteProduct);

// Admin-only example: hard delete bypass / bulk operations could go here
router.delete(
  '/:id/force',
  authenticate,
  authorize('admin'),
  idParamValidator,
  validate,
  productController.deleteProduct
);

export default router;

import Product from '../models/productModel.js';
import { success, error } from '../utils/response.js';

export async function createProduct(req, res, next) {
  try {
    const { name, description, price, quantity, category } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      quantity: quantity || 0,
      category,
      createdBy: req.user.id,
    });
    return success(res, 201, 'Product created successfully', { product: product.toJSON() });
  } catch (err) {
    next(err);
  }
}

export async function getProducts(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { category, search } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return success(res, 200, 'Products fetched successfully', { products }, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return error(res, 404, 'Product not found');
    return success(res, 200, 'Product fetched successfully', { product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return error(res, 404, 'Product not found');

    // Non-admins may only update products they created
    if (req.user.role !== 'admin' && String(existing.createdBy) !== req.user.id) {
      return error(res, 403, 'You can only update products you created');
    }

    const allowedFields = ['name', 'description', 'price', 'quantity', 'category'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) existing[field] = req.body[field];
    }

    const product = await existing.save();
    return success(res, 200, 'Product updated successfully', { product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return error(res, 404, 'Product not found');

    if (req.user.role !== 'admin' && String(existing.createdBy) !== req.user.id) {
      return error(res, 403, 'You can only delete products you created');
    }

    await Product.deleteOne({ _id: req.params.id });
    return success(res, 200, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
}

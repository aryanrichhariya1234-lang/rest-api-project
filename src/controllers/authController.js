import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { success, error } from '../utils/response.js';

const REFRESH_TOKEN_TTL_DAYS = 7;

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return error(res, 409, 'An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Only allow admin role creation if explicitly seeded/trusted — in production,
    // gate this behind an admin-only endpoint. Kept open here for assignment/demo purposes.
    const user = await User.create({ name, email, passwordHash, role: role || 'user' });

    return success(res, 201, 'User registered successfully', { user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return error(res, 401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return error(res, 401, 'Invalid email or password');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ userId: user._id, token: refreshToken, expiresAt });

    return success(res, 200, 'Login successful', {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return error(res, 401, 'Invalid or expired refresh token');
    }

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) {
      return error(res, 401, 'Refresh token not recognized (may have been revoked)');
    }
    if (stored.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token: refreshToken });
      return error(res, 401, 'Refresh token expired, please log in again');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, 401, 'User no longer exists');
    }

    const newAccessToken = generateAccessToken(user);

    return success(res, 200, 'Token refreshed', { accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    return success(res, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 404, 'User not found');
    return success(res, 200, 'Current user fetched', { user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

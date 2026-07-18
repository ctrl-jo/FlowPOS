const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { prisma } = require('../../server');
const redis = require('../utils/redis');

// ---------------------
// Zod Schemas (strict — rejects unknown fields)
// ---------------------
const registerSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
}).strict();

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
}).strict();

// ---------------------
// Token helpers
// ---------------------
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, business_id: user.business_id },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, business_id: user.business_id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

// ---------------------
// POST /api/auth/register
// ---------------------
const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, 12);

    // Create Business + Owner in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: data.businessName,
          type: data.businessType,
        },
      });

      const user = await tx.user.create({
        data: {
          business_id: business.id,
          email: data.email,
          password_hash,
          role: 'OWNER',
        },
      });

      return { business, user };
    });

    const { business, user } = result;

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in Redis
    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', REFRESH_TOKEN_TTL);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(201).json({
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
      business: { id: business.id, name: business.name },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Register error:', error.message);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

// ---------------------
// POST /api/auth/login
// ---------------------
const login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const validPassword = await bcrypt.compare(data.password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in Redis
    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', REFRESH_TOKEN_TTL);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        business_id: user.business_id,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Login error:', error.message);
    return res.status(500).json({ error: 'Login failed' });
  }
};

// ---------------------
// POST /api/auth/refresh
// ---------------------
const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check token exists in Redis (prevents reuse after rotation)
    const storedToken = await redis.get(`refresh:${decoded.id}`);
    if (!storedToken || storedToken !== token) {
      // Possible token reuse attack — invalidate all tokens for this user
      await redis.del(`refresh:${decoded.id}`);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.active) {
      await redis.del(`refresh:${decoded.id}`);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Replace old refresh token in Redis
    await redis.set(`refresh:${user.id}`, newRefreshToken, 'EX', REFRESH_TOKEN_TTL);

    // Set new refresh token as httpOnly cookie
    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh error:', error.message);
    return res.status(500).json({ error: 'Token refresh failed' });
  }
};

// ---------------------
// POST /api/auth/logout
// ---------------------
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await redis.del(`refresh:${decoded.id}`);
      } catch {
        // Token invalid/expired — still clear the cookie
      }
    }

    res.clearCookie('refreshToken', { path: '/' });
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error.message);
    return res.status(500).json({ error: 'Logout failed' });
  }
};

module.exports = { register, login, refresh, logout };

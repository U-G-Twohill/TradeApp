import { Router } from 'express';
import { AuthService } from '../services/authService';
import { validate } from '../middleware/validationMiddleware';
import { userRegistrationSchema, userLoginSchema } from '../validation/schemas';
import { logger } from '../utils/logger';
import { authLimiter } from '../config/rateLimit';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [tradesperson, contractor, project_manager]
 *               specialization:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', authLimiter, validate(userRegistrationSchema), async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Registration error:', error);
    if (error instanceof Error && error.message.includes('already exists')) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error registering user' });
    }
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authLimiter, validate(userLoginSchema), async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const tokens = await AuthService.refreshToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    logger.error('Error refreshing token:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and revoke refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       204:
 *         description: Successfully logged out
 *       500:
 *         description: Error during logout
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await AuthService.revokeToken(refreshToken);
    }
    res.status(204).send();
  } catch (error) {
    logger.error('Error during logout:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
});

export { router as authRoutes }; 
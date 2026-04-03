const express = require('express');
const healthController = require('../controllers/health');
const todoRoutes = require('./todo');

const router = express.Router();

// Health endpoint

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health endpoint
 *     description: Returns the health status of the service.
 *     operationId: healthCheck
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// Mount Todo API routes under /api/todos
router.use('/api/todos', todoRoutes);

module.exports = router;

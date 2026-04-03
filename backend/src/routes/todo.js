/**
 * Todo Routes – Defines HTTP endpoints for Todo CRUD and reorder/move operations.
 *
 * Flow name: TodoRoutes
 * Purpose: Map HTTP verbs and paths to controller methods with validation middleware.
 *
 * All routes are prefixed with /api/todos (mounted in routes/index.js).
 */

const express = require('express');
const todoController = require('../controllers/todo');
const {
  validateCreateTodo,
  validateUpdateTodo,
  validateReorderMove,
  validateIdParam,
} = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the todo
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *         title:
 *           type: string
 *           description: Title of the todo item
 *           example: "Complete project documentation"
 *         description:
 *           type: string
 *           description: Optional description of the todo
 *           example: "Write API docs and update README"
 *         column:
 *           type: string
 *           enum: [todo, in-progress, done]
 *           description: The Kanban column this todo belongs to
 *           example: "todo"
 *         completed:
 *           type: boolean
 *           description: Whether the todo is completed
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: ISO 8601 creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: ISO 8601 last-updated timestamp
 *       required:
 *         - id
 *         - title
 *         - column
 *         - completed
 *         - createdAt
 *         - updatedAt
 *     CreateTodoRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the todo (max 200 characters)
 *           example: "New task"
 *         description:
 *           type: string
 *           description: Optional description (max 2000 characters)
 *           example: "Details about the task"
 *         column:
 *           type: string
 *           enum: [todo, in-progress, done]
 *           description: Target column (defaults to 'todo')
 *           example: "todo"
 *     UpdateTodoRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Updated title (max 200 characters)
 *           example: "Updated task title"
 *         description:
 *           type: string
 *           description: Updated description (max 2000 characters)
 *           example: "Updated details"
 *         completed:
 *           type: boolean
 *           description: Mark as completed or not
 *           example: true
 *     MoveReorderRequest:
 *       type: object
 *       required:
 *         - targetColumn
 *         - targetIndex
 *       properties:
 *         targetColumn:
 *           type: string
 *           enum: [todo, in-progress, done]
 *           description: Destination column
 *           example: "in-progress"
 *         targetIndex:
 *           type: integer
 *           minimum: 0
 *           description: Zero-based position in the target column
 *           example: 0
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           type: object
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "error"
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/todos:
 *   get:
 *     tags:
 *       - Todos
 *     summary: Get all todos
 *     description: Retrieves all todo items grouped by Kanban column (todo, in-progress, done) with preserved ordering within each column.
 *     operationId: getAllTodos
 *     responses:
 *       200:
 *         description: Successfully retrieved all todos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     columns:
 *                       type: object
 *                       properties:
 *                         todo:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Todo'
 *                         in-progress:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Todo'
 *                         done:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Todo'
 */
router.get('/', todoController.getAll.bind(todoController));

/**
 * @swagger
 * /api/todos/columns:
 *   get:
 *     tags:
 *       - Todos
 *     summary: Get valid column names
 *     description: Returns the list of valid Kanban column names that todos can be placed in.
 *     operationId: getColumns
 *     responses:
 *       200:
 *         description: Successfully retrieved column names
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["todo", "in-progress", "done"]
 */
router.get('/columns', todoController.getColumns.bind(todoController));

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     tags:
 *       - Todos
 *     summary: Get a todo by ID
 *     description: Retrieves a single todo item by its unique identifier.
 *     operationId: getTodoById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The todo's unique identifier
 *     responses:
 *       200:
 *         description: Successfully retrieved the todo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', validateIdParam, todoController.getById.bind(todoController));

/**
 * @swagger
 * /api/todos:
 *   post:
 *     tags:
 *       - Todos
 *     summary: Create a new todo
 *     description: Creates a new todo item and places it at the end of the specified column (defaults to 'todo').
 *     operationId: createTodo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTodoRequest'
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validateCreateTodo, todoController.create.bind(todoController));

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     tags:
 *       - Todos
 *     summary: Update a todo
 *     description: Updates one or more fields of an existing todo. At least one field (title, description, or completed) must be provided.
 *     operationId: updateTodo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The todo's unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTodoRequest'
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', validateIdParam, validateUpdateTodo, todoController.update.bind(todoController));

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     tags:
 *       - Todos
 *     summary: Delete a todo
 *     description: Permanently deletes a todo item and removes it from its column.
 *     operationId: deleteTodo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The todo's unique identifier
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Todo deleted successfully"
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', validateIdParam, todoController.remove.bind(todoController));

/**
 * @swagger
 * /api/todos/{id}/move:
 *   put:
 *     tags:
 *       - Todos
 *     summary: Reorder or move a todo
 *     description: Moves a todo to a different column and/or reorders it within a column. Specify the target column and the zero-based index position.
 *     operationId: reorderOrMoveTodo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The todo's unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoveReorderRequest'
 *     responses:
 *       200:
 *         description: Todo moved/reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Validation error or invalid column
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/move', validateIdParam, validateReorderMove, todoController.reorderOrMove.bind(todoController));

module.exports = router;

/**
 * TodoController – HTTP request/response boundary for Todo operations.
 *
 * Flow name: TodoAPIBoundary
 * Purpose: Parse and validate incoming HTTP requests, delegate to TodoService,
 *          and map service results to appropriate HTTP responses.
 *
 * Contract:
 *   Input: Express req/res objects (body already validated by middleware).
 *   Output: JSON responses with consistent structure:
 *     Success: { status: 'success', data: ... }
 *     Error:   { status: 'error', message: ... }
 *   Side effects: None (delegates to service layer).
 */

const todoService = require('../services/todo');

class TodoController {
  /**
   * GET /api/todos
   * Retrieves all todos grouped by column.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  // PUBLIC_INTERFACE
  getAll(req, res, next) {
    try {
      const result = todoService.getAllTodos();
      return res.status(200).json({
        status: 'success',
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/todos/:id
   * Retrieves a single todo by ID.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  // PUBLIC_INTERFACE
  getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = todoService.getTodoById(id);
      if (!result.success) {
        return res.status(404).json({
          status: 'error',
          message: result.error,
        });
      }
      return res.status(200).json({
        status: 'success',
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/todos
   * Creates a new todo.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  // PUBLIC_INTERFACE
  create(req, res, next) {
    try {
      const { title, description, column } = req.body;
      const result = todoService.createTodo({ title, description, column });
      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error,
        });
      }
      return res.status(201).json({
        status: 'success',
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/todos/:id
   * Updates an existing todo.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  // PUBLIC_INTERFACE
  update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, completed } = req.body;
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (completed !== undefined) updates.completed = completed;

      const result = todoService.updateTodo(id, updates);
      if (!result.success) {
        return res.status(404).json({
          status: 'error',
          message: result.error,
        });
      }
      return res.status(200).json({
        status: 'success',
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/todos/:id
   * Deletes a todo.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  // PUBLIC_INTERFACE
  remove(req, res, next) {
    try {
      const { id } = req.params;
      const result = todoService.deleteTodo(id);
      if (!result.success) {
        return res.status(404).json({
          status: 'error',
          message: result.error,
        });
      }
      return res.status(200).json({
        status: 'success',
        message: 'Todo deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/todos/:id/move
   * Reorders a todo within its column or moves it to a different column.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  // PUBLIC_INTERFACE
  reorderOrMove(req, res, next) {
    try {
      const { id } = req.params;
      const { targetColumn, targetIndex } = req.body;
      const result = todoService.reorderOrMoveTodo(id, { targetColumn, targetIndex });
      if (!result.success) {
        // Distinguish between not-found and invalid-column errors
        const isNotFound = result.error && result.error.includes('not found');
        const statusCode = isNotFound ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: result.error,
        });
      }
      return res.status(200).json({
        status: 'success',
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/todos/columns
   * Returns the list of valid column names.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  // PUBLIC_INTERFACE
  getColumns(req, res, next) {
    try {
      const result = todoService.getValidColumns();
      return res.status(200).json({
        status: 'success',
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TodoController();

/**
 * Validation middleware for Todo API inputs.
 *
 * Flow name: InputValidation
 * Purpose: Validate and sanitize request data at the API boundary before
 *          it reaches the controller/service layers.
 *
 * Contract:
 *   - Validates request body fields against defined rules.
 *   - Returns 400 with structured error on validation failure.
 *   - Passes control to next middleware on success.
 *
 * Invariants:
 *   - Title must be a non-empty string (max 200 chars) when required.
 *   - Column must be one of: 'todo', 'in-progress', 'done'.
 *   - targetIndex must be a non-negative integer.
 */

const VALID_COLUMNS = ['todo', 'in-progress', 'done'];
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

/**
 * Validates the request body for creating a todo.
 * Required: title (non-empty string).
 * Optional: description (string), column (valid column name).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// PUBLIC_INTERFACE
function validateCreateTodo(req, res, next) {
  const errors = [];
  const { title, description, column } = req.body;

  // Title validation
  if (title === undefined || title === null) {
    errors.push('title is required');
  } else if (typeof title !== 'string') {
    errors.push('title must be a string');
  } else if (title.trim().length === 0) {
    errors.push('title must not be empty');
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.push(`title must not exceed ${MAX_TITLE_LENGTH} characters`);
  }

  // Description validation (optional)
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.push('description must be a string');
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(`description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Column validation (optional)
  if (column !== undefined && column !== null) {
    if (typeof column !== 'string') {
      errors.push('column must be a string');
    } else if (!VALID_COLUMNS.includes(column)) {
      errors.push(`column must be one of: ${VALID_COLUMNS.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors,
    });
  }

  // Sanitize: trim title
  if (typeof title === 'string') {
    req.body.title = title.trim();
  }

  next();
}

/**
 * Validates the request body for updating a todo.
 * All fields are optional, but at least one must be provided.
 * Optional: title (non-empty string), description (string), completed (boolean).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// PUBLIC_INTERFACE
function validateUpdateTodo(req, res, next) {
  const errors = [];
  const { title, description, completed } = req.body;

  // At least one field must be provided
  if (title === undefined && description === undefined && completed === undefined) {
    errors.push('At least one field (title, description, completed) must be provided');
  }

  // Title validation (optional)
  if (title !== undefined && title !== null) {
    if (typeof title !== 'string') {
      errors.push('title must be a string');
    } else if (title.trim().length === 0) {
      errors.push('title must not be empty');
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.push(`title must not exceed ${MAX_TITLE_LENGTH} characters`);
    }
  }

  // Description validation (optional)
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.push('description must be a string');
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(`description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Completed validation (optional)
  if (completed !== undefined && completed !== null) {
    if (typeof completed !== 'boolean') {
      errors.push('completed must be a boolean');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors,
    });
  }

  // Sanitize: trim title if provided
  if (typeof title === 'string') {
    req.body.title = title.trim();
  }

  next();
}

/**
 * Validates the request body for reordering/moving a todo.
 * Required: targetColumn (valid column), targetIndex (non-negative integer).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// PUBLIC_INTERFACE
function validateReorderMove(req, res, next) {
  const errors = [];
  const { targetColumn, targetIndex } = req.body;

  // targetColumn validation
  if (targetColumn === undefined || targetColumn === null) {
    errors.push('targetColumn is required');
  } else if (typeof targetColumn !== 'string') {
    errors.push('targetColumn must be a string');
  } else if (!VALID_COLUMNS.includes(targetColumn)) {
    errors.push(`targetColumn must be one of: ${VALID_COLUMNS.join(', ')}`);
  }

  // targetIndex validation
  if (targetIndex === undefined || targetIndex === null) {
    errors.push('targetIndex is required');
  } else if (typeof targetIndex !== 'number' || !Number.isInteger(targetIndex)) {
    errors.push('targetIndex must be an integer');
  } else if (targetIndex < 0) {
    errors.push('targetIndex must be a non-negative integer');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

/**
 * Validates that the :id route parameter is a valid non-empty string.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// PUBLIC_INTERFACE
function validateIdParam(req, res, next) {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: ['id parameter is required and must be a non-empty string'],
    });
  }
  next();
}

module.exports = {
  validateCreateTodo,
  validateUpdateTodo,
  validateReorderMove,
  validateIdParam,
};

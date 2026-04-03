/**
 * TodoStore – In-memory data store for Todo items.
 *
 * Flow name: TodoStore
 * Entrypoint: This module exports a singleton store instance.
 *
 * Contract:
 *   - Todos are stored in a Map keyed by `id` (string UUID).
 *   - Column order is maintained in `columnOrder` Map keyed by column name,
 *     each value is an ordered array of todo IDs.
 *   - Valid columns: 'todo', 'in-progress', 'done'.
 *
 * Invariants:
 *   - Every todo ID in `columnOrder` arrays exists in the `todos` Map.
 *   - Every todo in the `todos` Map has its ID in exactly one `columnOrder` array.
 *   - Column names are always one of VALID_COLUMNS.
 */

const crypto = require('crypto');

// Valid column names for the Kanban board
const VALID_COLUMNS = ['todo', 'in-progress', 'done'];

/**
 * Generates a unique identifier for a todo item.
 * @returns {string} A UUID v4 string.
 */
function generateId() {
  return crypto.randomUUID();
}

class TodoStore {
  constructor() {
    /** @type {Map<string, object>} */
    this.todos = new Map();

    /** @type {Map<string, string[]>} */
    this.columnOrder = new Map();

    // Initialize empty ordered arrays for each valid column
    for (const col of VALID_COLUMNS) {
      this.columnOrder.set(col, []);
    }
  }

  /**
   * Returns the list of valid column names.
   * @returns {string[]}
   */
  // PUBLIC_INTERFACE
  getValidColumns() {
    return [...VALID_COLUMNS];
  }

  /**
   * Checks whether a column name is valid.
   * @param {string} column
   * @returns {boolean}
   */
  // PUBLIC_INTERFACE
  isValidColumn(column) {
    return VALID_COLUMNS.includes(column);
  }

  /**
   * Retrieves all todos, grouped by column with ordering preserved.
   *
   * @returns {{ columns: Object.<string, object[]> }}
   *   An object with a `columns` key mapping column names to ordered arrays of todo objects.
   */
  // PUBLIC_INTERFACE
  getAll() {
    const columns = {};
    for (const col of VALID_COLUMNS) {
      const ids = this.columnOrder.get(col) || [];
      columns[col] = ids.map((id) => this.todos.get(id)).filter(Boolean);
    }
    return { columns };
  }

  /**
   * Retrieves a single todo by its ID.
   *
   * @param {string} id - The todo ID.
   * @returns {object|null} The todo object, or null if not found.
   */
  // PUBLIC_INTERFACE
  getById(id) {
    return this.todos.get(id) || null;
  }

  /**
   * Creates a new todo item.
   *
   * @param {object} data
   * @param {string} data.title - The title of the todo (required).
   * @param {string} [data.description] - Optional description.
   * @param {string} [data.column] - Column to place the todo in (default: 'todo').
   * @returns {object} The created todo object.
   * @throws {Error} If column is invalid.
   */
  // PUBLIC_INTERFACE
  create(data) {
    const column = data.column || 'todo';
    if (!this.isValidColumn(column)) {
      throw new Error(`Invalid column: ${column}. Valid columns: ${VALID_COLUMNS.join(', ')}`);
    }

    const now = new Date().toISOString();
    const todo = {
      id: generateId(),
      title: data.title,
      description: data.description || '',
      column,
      completed: column === 'done',
      createdAt: now,
      updatedAt: now,
    };

    this.todos.set(todo.id, todo);

    // Append to end of column order
    const order = this.columnOrder.get(column);
    order.push(todo.id);

    return { ...todo };
  }

  /**
   * Updates an existing todo item.
   *
   * @param {string} id - The todo ID.
   * @param {object} updates
   * @param {string} [updates.title] - New title.
   * @param {string} [updates.description] - New description.
   * @param {boolean} [updates.completed] - Completion status.
   * @returns {object|null} The updated todo, or null if not found.
   */
  // PUBLIC_INTERFACE
  update(id, updates) {
    const todo = this.todos.get(id);
    if (!todo) {
      return null;
    }

    const now = new Date().toISOString();

    if (updates.title !== undefined) {
      todo.title = updates.title;
    }
    if (updates.description !== undefined) {
      todo.description = updates.description;
    }
    if (updates.completed !== undefined) {
      todo.completed = updates.completed;
      // Auto-move to 'done' when completed, or back to 'todo' when uncompleted
      if (updates.completed && todo.column !== 'done') {
        this._moveToColumn(id, 'done');
      } else if (!updates.completed && todo.column === 'done') {
        this._moveToColumn(id, 'todo');
      }
    }

    todo.updatedAt = now;
    this.todos.set(id, todo);

    return { ...todo };
  }

  /**
   * Deletes a todo item.
   *
   * @param {string} id - The todo ID.
   * @returns {boolean} True if deleted, false if not found.
   */
  // PUBLIC_INTERFACE
  delete(id) {
    const todo = this.todos.get(id);
    if (!todo) {
      return false;
    }

    // Remove from column order
    const order = this.columnOrder.get(todo.column);
    if (order) {
      const idx = order.indexOf(id);
      if (idx !== -1) {
        order.splice(idx, 1);
      }
    }

    this.todos.delete(id);
    return true;
  }

  /**
   * Reorders a todo within its current column or moves it to a different column
   * at a specific position.
   *
   * @param {string} id - The todo ID.
   * @param {object} moveData
   * @param {string} moveData.targetColumn - The destination column.
   * @param {number} moveData.targetIndex - The zero-based position in the target column.
   * @returns {object|null} The updated todo, or null if not found.
   * @throws {Error} If targetColumn is invalid or targetIndex is out of range.
   */
  // PUBLIC_INTERFACE
  reorderOrMove(id, moveData) {
    const todo = this.todos.get(id);
    if (!todo) {
      return null;
    }

    const { targetColumn, targetIndex } = moveData;

    if (!this.isValidColumn(targetColumn)) {
      throw new Error(`Invalid column: ${targetColumn}. Valid columns: ${VALID_COLUMNS.join(', ')}`);
    }

    const sourceOrder = this.columnOrder.get(todo.column);
    const targetOrder = this.columnOrder.get(targetColumn);

    // Remove from source column
    const sourceIdx = sourceOrder.indexOf(id);
    if (sourceIdx !== -1) {
      sourceOrder.splice(sourceIdx, 1);
    }

    // Validate target index (allow appending at end)
    const maxIndex = targetOrder.length;
    const clampedIndex = Math.min(Math.max(0, targetIndex), maxIndex);

    // Insert at target position
    targetOrder.splice(clampedIndex, 0, id);

    // Update todo metadata
    const now = new Date().toISOString();
    todo.column = targetColumn;
    todo.completed = targetColumn === 'done';
    todo.updatedAt = now;
    this.todos.set(id, todo);

    return { ...todo };
  }

  /**
   * Internal helper: moves a todo to a new column (appends to end).
   *
   * @param {string} id - The todo ID.
   * @param {string} newColumn - The destination column.
   * @private
   */
  _moveToColumn(id, newColumn) {
    const todo = this.todos.get(id);
    if (!todo) return;

    // Remove from current column order
    const currentOrder = this.columnOrder.get(todo.column);
    if (currentOrder) {
      const idx = currentOrder.indexOf(id);
      if (idx !== -1) {
        currentOrder.splice(idx, 1);
      }
    }

    // Add to new column order
    const newOrder = this.columnOrder.get(newColumn);
    if (newOrder) {
      newOrder.push(id);
    }

    todo.column = newColumn;
  }

  /**
   * Resets the store to its initial empty state.
   * Primarily used for testing.
   */
  // PUBLIC_INTERFACE
  reset() {
    this.todos.clear();
    for (const col of VALID_COLUMNS) {
      this.columnOrder.set(col, []);
    }
  }
}

// Export singleton instance
module.exports = new TodoStore();

/**
 * TodoService – Business logic layer for Todo operations.
 *
 * Flow name: TodoCRUDFlow
 * Entrypoint: Each public method is a flow entry for its respective operation.
 *
 * Contract:
 *   Input: validated data objects from the controller layer.
 *   Output: { success, data?, error? } result objects.
 *   Errors: Returns structured error results; does not throw.
 *   Side effects: Mutates in-memory TodoStore.
 *
 * Observability:
 *   - Logs start/end of each operation with key identifiers.
 *   - Logs errors with context.
 */

const todoStore = require('../store/todoStore');

class TodoService {
  /**
   * Retrieves all todos grouped by column.
   *
   * @returns {{ success: boolean, data: object }}
   */
  // PUBLIC_INTERFACE
  getAllTodos() {
    console.log('[TodoService] getAllTodos: start');
    const data = todoStore.getAll();
    console.log('[TodoService] getAllTodos: complete, totalItems=' +
      Object.values(data.columns).reduce((sum, arr) => sum + arr.length, 0));
    return { success: true, data };
  }

  /**
   * Retrieves a single todo by ID.
   *
   * @param {string} id - The todo ID.
   * @returns {{ success: boolean, data?: object, error?: string }}
   */
  // PUBLIC_INTERFACE
  getTodoById(id) {
    console.log(`[TodoService] getTodoById: start, id=${id}`);
    const todo = todoStore.getById(id);
    if (!todo) {
      console.log(`[TodoService] getTodoById: not found, id=${id}`);
      return { success: false, error: `Todo with id '${id}' not found` };
    }
    console.log(`[TodoService] getTodoById: complete, id=${id}`);
    return { success: true, data: todo };
  }

  /**
   * Creates a new todo.
   *
   * @param {object} data - Todo creation data.
   * @param {string} data.title - Title of the todo (required).
   * @param {string} [data.description] - Optional description.
   * @param {string} [data.column] - Target column (default: 'todo').
   * @returns {{ success: boolean, data?: object, error?: string }}
   */
  // PUBLIC_INTERFACE
  createTodo(data) {
    console.log(`[TodoService] createTodo: start, title="${data.title}", column="${data.column || 'todo'}"`);
    try {
      const todo = todoStore.create(data);
      console.log(`[TodoService] createTodo: complete, id=${todo.id}`);
      return { success: true, data: todo };
    } catch (err) {
      console.error(`[TodoService] createTodo: failed, error="${err.message}"`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Updates an existing todo.
   *
   * @param {string} id - The todo ID.
   * @param {object} updates - Fields to update.
   * @param {string} [updates.title] - New title.
   * @param {string} [updates.description] - New description.
   * @param {boolean} [updates.completed] - Completion status.
   * @returns {{ success: boolean, data?: object, error?: string }}
   */
  // PUBLIC_INTERFACE
  updateTodo(id, updates) {
    console.log(`[TodoService] updateTodo: start, id=${id}, fields=${Object.keys(updates).join(',')}`);
    const todo = todoStore.update(id, updates);
    if (!todo) {
      console.log(`[TodoService] updateTodo: not found, id=${id}`);
      return { success: false, error: `Todo with id '${id}' not found` };
    }
    console.log(`[TodoService] updateTodo: complete, id=${id}`);
    return { success: true, data: todo };
  }

  /**
   * Deletes a todo.
   *
   * @param {string} id - The todo ID.
   * @returns {{ success: boolean, error?: string }}
   */
  // PUBLIC_INTERFACE
  deleteTodo(id) {
    console.log(`[TodoService] deleteTodo: start, id=${id}`);
    const deleted = todoStore.delete(id);
    if (!deleted) {
      console.log(`[TodoService] deleteTodo: not found, id=${id}`);
      return { success: false, error: `Todo with id '${id}' not found` };
    }
    console.log(`[TodoService] deleteTodo: complete, id=${id}`);
    return { success: true };
  }

  /**
   * Reorders a todo within its column or moves it to a different column at a specific position.
   *
   * @param {string} id - The todo ID.
   * @param {object} moveData
   * @param {string} moveData.targetColumn - Destination column.
   * @param {number} moveData.targetIndex - Position in the destination column.
   * @returns {{ success: boolean, data?: object, error?: string }}
   */
  // PUBLIC_INTERFACE
  reorderOrMoveTodo(id, moveData) {
    console.log(`[TodoService] reorderOrMoveTodo: start, id=${id}, targetColumn="${moveData.targetColumn}", targetIndex=${moveData.targetIndex}`);
    try {
      const todo = todoStore.reorderOrMove(id, moveData);
      if (!todo) {
        console.log(`[TodoService] reorderOrMoveTodo: not found, id=${id}`);
        return { success: false, error: `Todo with id '${id}' not found` };
      }
      console.log(`[TodoService] reorderOrMoveTodo: complete, id=${id}, newColumn="${todo.column}"`);
      return { success: true, data: todo };
    } catch (err) {
      console.error(`[TodoService] reorderOrMoveTodo: failed, id=${id}, error="${err.message}"`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Returns the list of valid column names.
   *
   * @returns {{ success: boolean, data: string[] }}
   */
  // PUBLIC_INTERFACE
  getValidColumns() {
    return { success: true, data: todoStore.getValidColumns() };
  }
}

module.exports = new TodoService();

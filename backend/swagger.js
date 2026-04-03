const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Task Organizer API',
      version: '1.0.0',
      description: 'REST API for the Smart Task Organizer application. Provides CRUD operations for todo items with Kanban-style column management (Todo, In Progress, Done), including drag-and-drop reordering and moving between columns.',
    },
    tags: [
      {
        name: 'Health',
        description: 'Service health check endpoints',
      },
      {
        name: 'Todos',
        description: 'CRUD operations for todo items with column-based organization and reordering',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

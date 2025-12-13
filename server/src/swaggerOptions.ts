// src/swaggerOptions.ts
import { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0', // OpenAPI version
    info: {
      title: 'Pong API',
      version: '1.0.0',
      description: 'API documentation for the FT_Transcendence project',
    },
    servers: [
      {
        url: 'http://localhost:3001', // Your server URL
        description: 'Local server',
      },
    ],
  },
  // Path to the files containing the documentation comments
  apis: ['./src/routes/*.ts'], 
};

export default options;
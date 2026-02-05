// src/swaggerOptions.ts
import { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'Pong API',
      version: '1.0.0',
      description: 'API documentation for the FT_Transcendence project',
    },
    servers: [
      {
        url: 'http://localhost:3001', 
        description: 'Local server',
      },
    ],
  },
  
  apis: ['./src/routes/*.ts'], 
};

export default options;
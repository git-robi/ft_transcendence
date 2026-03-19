// src/swaggerOptions.ts
import { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Transcendence Public API',
      version: '1.0.0',
      description: 'Public API documentation for the FT_Transcendence project. Authenticate using an API key in the Authorization header: "Bearer YOUR_API_KEY".',
    },
    servers: [
      {
        url: process.env.BASE_URL || 'https://localhost',
        description: 'API server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'API Key authentication using Bearer token format: "Bearer YOUR_API_KEY"'
        },
      }
    },
    tags: [
      {
        name: 'Public',
        description: 'Public API endpoints (requires API key)'
      }
    ]
  },

  apis: ['./src/routes/public.ts'],
};

export default options;
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API with Auth & RBAC',
      version: '1.0.0',
      description:
        'Scalable REST API featuring JWT authentication, role-based access control, and Products CRUD, backed by MongoDB.',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local dev server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export default swaggerJsdoc(options);

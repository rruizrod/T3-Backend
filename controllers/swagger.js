const swaggerRouter = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'T3 KnightHacks Backend API',
      version: '1.0.0',
      description: 'Social Media Backend API. To make calls to API use url t3-dev.rruiz.dev/{route}'
    }
  },
  apis: ['./controllers/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

swaggerRouter.use('/', swaggerUi.serve);
swaggerRouter.get('/', swaggerUi.setup(swaggerDocs));

module.exports = swaggerRouter

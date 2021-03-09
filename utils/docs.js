const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'T3 KnightHacks Backend API',
      version: '1.0.0',
      description: 'Social Media Backend API'
    },
    servers: [{url: 't3-dev.rruiz.dev/'}]
  },
  apis: ['./controllers/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports =  swaggerDocs;
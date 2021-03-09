const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    //components: {},
    info: {
      title: 'T3 KnightHacks Backend API',
      version: '1.0.0',
      description: 'Social Media Backend API'
    }
  },
  apis: ['./controllers/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports =  swaggerDocs;
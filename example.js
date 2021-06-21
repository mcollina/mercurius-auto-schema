'use strict'

const fastify = require('fastify')()
const { printSchema } = require('graphql')

fastify.register(require('.'), {
  definitions: {
    openapi: {
      info: {
        title: 'Test swagger',
        description: 'testing the fastify swagger api',
        version: '0.1.0'
      }
    },
    exposeRoute: true
  },
  graphql: {
    graphiql: true
  }
})

fastify.put('/some-route/:id', {
  schema: {
    description: 'post some data',
    tags: ['user', 'code'],
    summary: 'qwerty',
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'user id'
        }
      }
    },
    body: {
      type: 'object',
      properties: {
        hello: { type: 'string' },
        obj: {
          type: 'object',
          properties: {
            some: { type: 'string' }
          }
        }
      }
    },
    response: {
      201: {
        description: 'Succesful response',
        type: 'object',
        properties: {
          hello: { type: 'string' }
        }
      }
    }
  }
}, (req, reply) => { reply.send({ hello: `Hello ${req.body.hello}` }) })

fastify.get('/user/:id', {
  schema: {
    description: 'get a user',
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'user id'
        }
      }
    },
    response: {
      201: {
        description: 'Succesful response',
        type: 'object',
        properties: {
          name: { type: 'string' },
          companyId: { type: 'string' }
        }
      }
    }
  },
  links: {
    201: {
      company: {
        operationId: 'getCompany',
        parameters: {
          id: '$request.path.id'
        }
      }
    }
  }
}, () => 'hello world')

fastify.get('/company/:id', {
  schema: {
    operationId: 'getCompany',
    description: 'get a company',
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'company id'
        }
      }
    },
    response: {
      201: {
        description: 'Succesful response',
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      }
    }
  }
}, () => 'hello world')

/*
fastify.post('/some-route/:id', {
  schema: {
    description: 'post some data',
    summary: 'qwerty',
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'user id'
        }
      }
    },
    body: {
      type: 'object',
      properties: {
        hello: { type: 'string' },
        obj: {
          type: 'object',
          properties: {
            some: { type: 'string' }
          }
        }
      }
    },
    response: {
      201: {
        description: 'Succesful response',
        type: 'object',
        properties: {
          hello: { type: 'string' }
        }
      }
    }
  }
}, (req, reply) => { reply.send({ hello: `Hello ${req.body.hello}` }) })
*/

fastify.listen(3000, err => {
  if (err) throw err
  console.log('listening')
  console.log(printSchema(fastify.graphql.schema))
})

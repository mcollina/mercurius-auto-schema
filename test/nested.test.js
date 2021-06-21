'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const auto = require('..')

test('nested objects', async ({ equal, same, teardown }) => {
  const app = fastify({ logger: { level: 'error' } })
  teardown(app.close.bind(app))

  app.register(auto, {
    definitions: {
      openapi: {
        info: {
          title: 'Test swagger',
          description: 'testing the fastify swagger api',
          version: '0.1.0'
        }
      }
    }
  })

  app.get('/user/:id', {
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
        200: {
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
      200: {
        company: {
          operationId: 'getCompany',
          parameters: {
            id: '$response.body#/companyId'
          }
        }
      }
    }
  }, async (req) => {
    equal(req.params.id, 'foo42', 'user id matches')

    return {
      companyId: 42,
      name: 'foo'
    }
  })

  app.get('/company/:id', {
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
        200: {
          description: 'Succesful response',
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        }
      }
    }
  }, async (req) => {
    equal(req.params.id, '42', 'company id matches')

    return { name: 'bar' }
  })

  {
    const query = 'query { user (id: "foo42") { name, companyId, company { name } } }'

    const res = await app.inject({
      method: 'POST',
      url: '/graphql',
      body: {
        query
      }
    })

    same(res.json(), {
      data: {
        user: {
          name: 'foo',
          companyId: 42,
          company: {
            name: 'bar'
          }
        }
      }
    })
  }
})

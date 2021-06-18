'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const auto = require('..')

test('basic functionality', async ({ same, teardown }) => {
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

  app.put('/some-route/:id', {
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

  {
    const query = 'mutation { putSomeRouteId (id: "haah", someRouteInput: { hello: "world" } ) { hello } }'

    const res = await app.inject({
      method: 'POST',
      url: '/graphql',
      body: {
        query
      }
    })

    same(res.json(), {
      data: {
        putSomeRouteId: {
          hello: 'Hello world'
        }
      }
    })
  }

  {
    const query = 'mutation { putSomeRouteId (id: "haah") { hello } }'

    const res = await app.inject({
      method: 'POST',
      url: '/graphql',
      body: {
        query
      }
    })

    same(res.json(), {
      data: {
        putSomeRouteId: {
          hello: 'Hello undefined'
        }
      }
    })
  }
})

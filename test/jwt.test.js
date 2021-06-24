'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const auto = require('..')
const JWT = require('fastify-jwt')

test('jwt authentication', async ({ equal, same, teardown }) => {
  const app = fastify({ logger: { level: 'error' } })
  teardown(app.close.bind(app))

  app.register(JWT, {
    secret: 'testingsecret'
  })

  app.register(auto, {
    definitions: {
      openapi: {
        info: {
          title: 'Test swagger',
          description: 'testing the fastify swagger api',
          version: '0.1.0'
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              format: 'JWT'
            }
          }
        }
      }
    },
    viewer: false,
    customizeHttpRequest (opts, context) {
      opts.headers.authorization = context.reply.request.headers.authorization
      return opts
    }
  })

  app.get('/user/:id', {
    schema: {
      operationId: 'user',
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
      },
      security: [
        { bearerAuth: [] }
      ]
    }
  }, async (req) => {
    await req.jwtVerify()
    equal(req.user.name, 'foobar', 'jwt parsed correctly')
    equal(req.params.id, 'foo42', 'user id matches')

    return {
      companyId: 42,
      name: 'foo'
    }
  })

  await app.ready()

  {
    const query = 'query { user (id: "foo42") { name, companyId } }'

    const res = await app.inject({
      method: 'POST',
      url: '/graphql',
      headers: {
        Authorization: `Bearer ${app.jwt.sign({ name: 'foobar' })}`
      },
      body: {
        query
      }
    })

    same(res.json(), {
      data: {
        user: {
          name: 'foo',
          companyId: 42
        }
      }
    })
  }
})

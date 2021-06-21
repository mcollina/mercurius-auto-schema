'use strict'

const fp = require('fastify-plugin')
const { createGraphQLSchema } = require('openapi-graphql')
const mercurius = require('mercurius')
const swagger = require('fastify-swagger')
const qs = require('qs')

module.exports = fp(async function (app, opts) {
  await app.register(mercurius, {
    ...opts.graphql,
    // fake schema, we just need something
    schema: 'type Query { dummy: Int }'
  })
  app.register(swagger, opts.definitions)

  app.addHook('onReady', async function () {
    const def = app.swagger()

    const { schema } = await createGraphQLSchema(def, {
      async httpRequest (opts) {
        const res = await app.inject({
          path: opts.url + '?' + qs.stringify(opts.qs),
          headers: opts.headers,
          method: opts.method,
          body: opts.body || '{}'
        })

        return {
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          body: res.body,
          headers: res.headers
        }
      }
    })
    app.graphql.replaceSchema(schema)
  })
})

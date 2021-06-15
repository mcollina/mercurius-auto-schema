'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const auto = require('..')

test('basic functionality', async ({ same, teardown }) => {
  const app = fastify()
  teardown(app.close.bind(app))

  app.register(auto)
})

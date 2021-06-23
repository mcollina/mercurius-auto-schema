# mercurius-auto-schema

`mercurius-auto-schema` allows you to create a GraphQL schema and endpoint from
Fastify own route definitions. By using this module, you would get a dynamic OpenAPI
specification of your API that will be used as the basis for the GraphQL implementation.

The main difference with other similar approaches is that `mercurius-auto-schema` does not
perform any HTTP requests but leverages the high-throughput `fastify.inject()` utility for
in-process request processing.

Built upon:

* [fastify-swagger](https://github.com/fastify/fastify-swagger)
* [mercurius](https://github.com/mercurius-js/mercurius)
* [openapi-graphql](https://github.com/mcollina/openapi-graphql)
* [`fastify.inject()`](https://www.fastify.io/docs/latest/Testing/#benefits-of-using-fastifyinject)

This module is high level and it exposes all the behavior of its constituent parts.
See the individual modules for various docs and explanations.

## Install

```sh
npm i mercurius-auto-schema
```

## Example

```js
'use strict'

const fastify = require('fastify')()
const { printSchema } = require('graphql')

fastify.register(require('mercurius-auto-schema'), {
  definitions: {
    openapi: {
      info: {
        title: 'Test OpenAPI',
        description: 'testing the fastify openapi',
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

fastify.listen(3000, err => {
  if (err) throw err
  console.log(printSchema(fastify.graphql.schema))
})
```

This will print:

```
type Query {
  """
  get a company

  Equivalent to GET /company/{id}
  """
  company(
    """company id"""
    id: String!
  ): Company

  """
  get a user

  Equivalent to GET /user/{id}
  """
  user(
    """user id"""
    id: String!
  ): User
}

"""Succesful response"""
type Company {
  name: String
}

"""Succesful response"""
type User {
  company: Company
  companyId: String
  name: String
}

type Mutation {
  """
  post some data

  Equivalent to PUT /some-route/{id}
  """
  putSomeRouteId(
    """user id"""
    id: String!
    someRouteInput: SomeRouteInput
  ): SomeRoute2
}

"""Succesful response"""
type SomeRoute2 {
  hello: String
}

input SomeRouteInput {
  hello: String
  obj: ObjInput
}

input ObjInput {
  some: String
}
```

## License

MIT

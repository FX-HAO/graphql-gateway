import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { createProxySchema, HttpGraphQLClient } from 'graphql-weaver';
import { graphqlExpress } from 'apollo-server-express';
import * as graphqlHTTP from 'express-graphql';
import { GraphQLSchema, DocumentNode } from 'graphql';

class AuthForwardingGraphQLClient extends HttpGraphQLClient {
  protected async getHeaders(document: DocumentNode, variables?: { [name: string]: any }, context?: any, introspect?: boolean): Promise<{ [index: string]: string }> {
    let headers = await super.getHeaders(document, context, introspect);
    if (context && context.headers && context.headers['content-length']) {
      delete context.headers['content-length'];
      return context.headers
    } else {
      return {
        ...headers
      }
    }
  }
}

async function run() {
  const schema: GraphQLSchema = await createProxySchema({
    endpoints: [{
        client: new AuthForwardingGraphQLClient({url: 'http://web/queries'})
    }, {
        namespace: 'accounting',
        typePrefix: 'Accounting',
        client: new AuthForwardingGraphQLClient({url: 'http://financial-accounting/queries'})
    }]
  })

  const app = express();

  app.use(cors());

  app.use('/graphql', bodyParser.json(), graphqlHTTP(request => {
    console.log(request.headers);
    return {
      schema: schema,
      context: request,
      graphiql: true
    }
  }));

  app.use('/graphql', bodyParser.json(), (req, res, next) => {
    if (req.body['variables'] == "" || req.body['variables'] == null) {
        req.body['variables'] = {}
    }
    next();
}, graphqlExpress({ schema: schema }, ), graphqlHTTP(request => {
  console.log(request.headers);
  return {
    schema: schema,
    context: request,
    graphiql: true
  }
}));
  // app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

  // app.use(
  //   '/graphiql',
  //   graphiqlExpress({
  //     endpointURL: '/graphql',
  //   })
  // );

  app.listen(80);
  console.log('Server running. Open http://localhost:80/graphiql to run queries.');
}

run()
.then(a => {
  console.log(a)
})
.catch(e => {
  console.log(e)
});

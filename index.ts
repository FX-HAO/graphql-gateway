import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { createProxySchema, HttpGraphQLClient } from 'graphql-weaver';
import { graphiqlExpress } from 'apollo-server-express';
import * as graphqlHTTP from 'express-graphql';
import { GraphQLSchema, DocumentNode } from 'graphql';

class AuthForwardingGraphQLClient extends HttpGraphQLClient {
  protected async getHeaders(document: DocumentNode, variables?: { [name: string]: any }, context?: any, introspect?: boolean): Promise<{ [index: string]: string }> {
    const headers = await super.getHeaders(document, context, introspect);
    console.log('headers', headers)
    if (context) {
      console.log('context headers', context.headers)
      return { ...context.headers,
        ...headers
       }
    } else {
      return { ...headers }
    }
  }
}

async function run() {

  const schema: GraphQLSchema = await createProxySchema({
    endpoints: [{
        // url: 'http://127.0.0.1:3002/queries' // url to a GraphQL endpoint
        // client: new AuthForwardingGraphQLClient({url: 'http://127.0.0.1:3002/queries'})
        client: new AuthForwardingGraphQLClient({url: 'https://www.universe.com/graphql/beta'})
    }, {
        namespace: 'accounting',
        typePrefix: 'Accounting',
        // url: 'http://127.0.0.1:3001/queries' // url to a GraphQL endpoint
        // client: new AuthForwardingGraphQLClient({url: 'http://127.0.0.1:3001/queries'})
        client: new AuthForwardingGraphQLClient({url: 'https://5rrx10z19.lp.gql.zone/graphql'})
    }]
  })

  const app = express();

  app.use(cors());

  app.use('/graphql', bodyParser.json(), graphqlHTTP(request => {
    return {
      schema: schema,
      context: request,
      graphiql: true
    }
  }));

  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql',
    })
  );

  app.listen(3210);
  console.log('Server running. Open http://localhost:3210/graphiql to run queries.');
}

run()
.then(a => {
})
.catch(e => {
  console.log(e)
});

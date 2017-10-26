import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import * as cors from 'kcors';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { createProxySchema, HttpGraphQLClient } from 'graphql-weaver';
import { DocumentNode } from 'graphql';

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
async function createSchema() {
  return await createProxySchema({
    endpoints: [{
      client: new AuthForwardingGraphQLClient({url: 'http://web/queries'})
    }, {
      namespace: 'accounting',
      typePrefix: 'Accounting',
      client: new AuthForwardingGraphQLClient({url: 'http://financial-accounting/queries'})
    }]
  });
}

async function run() {

  let currentSchema = await createSchema();

  const app = new koa();
  const router = new koaRouter();

  // koaBody is needed just for POST.
  router.post('/graphql', koaBody(),
    (ctx, next) => {
      console.log("m1 start");
      console.log(ctx.request);
      next();
      console.log(ctx.response);
      console.log(ctx.body);
      console.log("m1 end");
    }
    ,graphqlKoa(req => {
      return ({
        schema: currentSchema,
        context: req
      });
    }));

  router.get('/graphiql', graphiqlKoa({endpointURL: '/graphql'}));

  app.use(cors());
  app.use(router.routes());
  app.use(router.allowedMethods());

  setInterval(async function () {
    currentSchema = await createSchema();
  }, 10000);

  const port: number = 80;
  app.listen(port);
  console.log(`Server running. Open http://localhost:${port}/graphiql to run queries.`);
}

run()
.then(a => {
})
.catch(e => {
  console.log(e)
});

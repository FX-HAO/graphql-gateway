import koa from 'koa';
import koaRouter from 'koa-router';
import koaBody from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { schema } from './schema';

const app = new koa();
const router = new koaRouter();

app.use(async (ctx, next) => {
  await next()
  if (ctx.request.body !== undefined) {
    console.log(ctx.request.body);
    const v = ctx.request.body.variables;
    if (v !== undefined && v["name"] !== undefined) {
      const name = parseInt(v["name"]);
      if (name / 100 > 2) {
        ctx.throw(name, {error: "invalid input"});
      }
    }
  }
});

// koaBody is needed just for POST.
router.post('/graphql', koaBody(), graphqlKoa({ schema: schema }));
router.get('/graphql', graphqlKoa({ schema: schema }));
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

const PORT = 4000;

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT, () =>
  console.log(`GraphQL Server is now running on http://localhost:${PORT}`)
);

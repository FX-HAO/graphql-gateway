import koa from 'koa';
import koaRouter from 'koa-router';
import koaBody from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { schema } from './schema';

const app = new koa();
const router = new koaRouter();

app.use((ctx, next) => {
  if (ctx.headers["authorization"] === undefined) {
    ctx.throw(401, "invalid grant");
  }
  next()
});

// koaBody is needed just for POST.
router.post('/graphql', koaBody(), graphqlKoa({ schema: schema }));
router.get('/graphql', graphqlKoa({ schema: schema }));
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

const PORT = 4000;

app.listen(PORT, () =>
  console.log(`GraphQL Server is now running on http://localhost:${PORT}`)
);

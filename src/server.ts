import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';

import routes from './routes';

const PORT = process.env.PORT || 3000;

const app = new Koa();

// Middlewares
app.use(json());
app.use(logger());

// Routes
app.use(routes.routes());
app.use(routes.allowedMethods());

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${PORT}`);
});

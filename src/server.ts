import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';
import fs from 'fs';
import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import json from 'koa-json';
import logger from 'koa-logger';
import { Client } from 'pg';

import routes from './routes';
import { ApiContext } from './types';

const production = process.env.NODE_ENV === 'production';
if (!production) {
  dotenv.config();
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is not set.');
}

const setup = fs.readFileSync('setup.sql', 'utf8');

const app = new Koa<{}, ApiContext>();

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  app.on('error', (err, ctx) => {
    Sentry.withScope(scope => {
      scope.addEventProcessor(event => Sentry.Handlers.parseRequest(event, ctx.request));
      Sentry.captureException(err);
    });
  });
}

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: production });
client.connect().then(async () => {
  await client.query(setup);
});

app.context.db = client;

// Middlewares
app.use(logger());
app.use(json());
app.use(bodyparser());

// Routes
app.use(routes.routes());
app.use(routes.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${PORT}`);
});

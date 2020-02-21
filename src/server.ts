import dotenv from 'dotenv';
import fs from 'fs';
import Koa from 'koa';
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

const setup = fs.readFileSync('setup.sql', 'utf8');

const app = new Koa<{}, ApiContext>();
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: production });
client.connect().then(async () => {
  await client.query(setup);
});

app.context.db = client;

// Middlewares
app.use(json());
app.use(logger());

// Routes
app.use(routes.routes());
app.use(routes.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${PORT}`);
});

import analyze from 'ac-stalk-market-analyzer';
import Router from 'koa-router';

import { ApiContext } from '../types';
import {
  determineDayAndPeriod,
  determineWeekAndYear,
  getPricesFromRecord,
  getTurnipRecord,
  savePrice,
} from '../utils';

const router = new Router<{}, ApiContext>();
const snowflakeRegex = /\d{17}/;

router.use('/:userId', async (ctx, next) => {
  const { userId } = ctx.params;

  if (!userId || !userId.match(snowflakeRegex)) {
    ctx.throw(400, 'User ID is invalid.');
  }

  await next();
});

router.get('/:userId/turnips', async ctx => {
  const { db } = ctx;
  const { userId } = ctx.params;

  const { week, year } = determineWeekAndYear(ctx);
  const record = await getTurnipRecord(db, userId, week, year);

  if (!record) {
    ctx.throw(404, 'Record not found.');
  }

  ctx.body = {
    record,
    prices: getPricesFromRecord(record),
  };
});

router.post('/:userId/turnips', async ctx => {
  if (ctx.headers.authorization !== `Bearer ${process.env.BOT_TOKEN}`) {
    ctx.throw(401, 'Invalid token');
  }

  const { db } = ctx;
  const { userId } = ctx.params;
  const { week, year } = determineWeekAndYear(ctx);
  const { day, period } = determineDayAndPeriod(ctx);
  const { price } = ctx.request.body;

  if (!price) {
    ctx.throw(400, 'No price included');
  }

  if (price <= 0) {
    ctx.throw(400, 'Price was a negative value');
  }

  let currentRecord = await getTurnipRecord(db, userId, week, year);
  const exists = !!currentRecord;

  if (!exists) {
    currentRecord = {
      week,
      year,
      userid: userId,
    };
  }

  currentRecord[`${day}${period.charAt(0).toUpperCase()}${period.slice(1)}`] = price;

  if (exists) {
    await db.query(
      `UPDATE price SET ${day}_${period}=$1 WHERE userid = $2 AND week = $3 AND year = $4`,
      [price, userId, week, year],
    );
  } else {
    await savePrice(db, currentRecord);
  }

  ctx.body = { week, year, day, period, userId, body: ctx.request.body, currentRecord };
});

router.get('/:userId/turnips/pattern', async ctx => {
  const { db } = ctx;
  const { userId } = ctx.params;

  const { week, year } = determineWeekAndYear(ctx);
  const record = await getTurnipRecord(db, userId, week, year);

  if (!record) {
    ctx.throw(404, 'Record not found.');
  }

  ctx.body = { pattern: analyze(getPricesFromRecord(record)) };
});

export default router;

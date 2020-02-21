import analyze from 'ac-stalk-market-analyzer';
import { getWeek, getYear } from 'date-fns';
import Router from 'koa-router';
import { Client } from 'pg';

import { ApiContext, TurnipPriceRecord } from '../types';

const router = new Router<{}, ApiContext>();
const snowflakeRegex = /\d{17}/;

async function getTurnipRecord(
  db: Client,
  userId: string,
  week: number,
  year: number,
): Promise<TurnipPriceRecord> {
  const result = await db.query<TurnipPriceRecord>(
    `SELECT
    userid, week, year,
    mon_am AS "monAm",
    mon_pm AS "monPm",
    tue_am AS "tueAm",
    tue_pm AS "tuePm",
    wed_am AS "wedAm",
    wed_pm AS "wedPm",
    thu_am AS "thuAm",
    thu_pm AS "thuPm",
    fri_am AS "friAm",
    fri_pm AS "friPm",
    sat_am AS "satAm",
    sat_pm AS "satPm"
    FROM price
    WHERE userid = $1 AND week = $2 AND year = $3`,
    [userId, week, year],
  );

  return result.rows[0];
}

function getPricesFromRecord({
  monAm,
  monPm,
  tueAm,
  tuePm,
  wedAm,
  wedPm,
  thuAm,
  thuPm,
  friAm,
  friPm,
  satAm,
  satPm,
}: TurnipPriceRecord): number[] {
  return [monAm, monPm, tueAm, tuePm, wedAm, wedPm, thuAm, thuPm, friAm, friPm, satAm, satPm];
}

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

  const date = new Date();
  const week = getWeek(date);
  const year = getYear(date);

  const record = await getTurnipRecord(db, userId, week, year);

  if (!record) {
    ctx.throw(404, 'Record not found.');
  }

  ctx.body = {
    record,
    prices: getPricesFromRecord(record),
  };
});

router.get('/:userId/turnips/pattern', async ctx => {
  const { db } = ctx;
  const { userId } = ctx.params;

  const date = new Date();
  const week = getWeek(date);
  const year = getYear(date);

  const record = await getTurnipRecord(db, userId, week, year);

  if (!record) {
    ctx.throw(404, 'Record not found.');
  }

  ctx.body = { pattern: analyze(getPricesFromRecord(record)) };
});

export default router;

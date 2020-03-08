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

const descriptions: Record<ReturnType<typeof analyze>, string> = {
  unknown:
    'Unknown pattern. Either no pattern could be found with the current set of data or the pattern itself is invalid.',
  decreasing:
    'In the decreasing price pattern, the prices will consistently decrease by a few bells each time, never increasing. With the decreasing pattern, the start price for the week will be between 99 and 50 bells. In this pattern, if the price doesn’t increase by Thursday afternoon, you should sell immediately.',
  random:
    'The random price pattern features unpredictable prices in the range of about 50 to 200. The prices increase and decrease at random. The price seems to go over 110 at least twice a week in the random pattern.',
  spikeBig:
    'The big spike pattern features a decreasing pattern, but then there will be three increasing prices, with the third being the maximum for the week, followed by two decreasing prices that are still higher than average, followed by a continuation of the overall decreasing pattern. The maximum price in this pattern is always preceded by two increasing prices and always followed by two decreasing prices, so the maximum can’t occur on Monday or Saturday.',
  spikeSmall:
    'The small spike pattern features a decreasing pattern, but then there will be four increasing prices, with the fourth being the maximum for the week, followed by a decreasing price that is higher than average, followed by a continuation of the overall decreasing pattern. The maximum price in this pattern is always preceded by three increasing prices and followed by one decreasing price, so the earliest that the maximum can occur is Tuesday afternoon and the latest is Saturday morning.',
};

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

  const prices = getPricesFromRecord(record);
  const pattern = analyze(prices);

  ctx.body = {
    ...record,
    prices,
    pattern: { type: pattern, description: descriptions[pattern] },
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

  const prices = getPricesFromRecord(currentRecord);
  const pattern = analyze(prices);

  ctx.body = {
    ...currentRecord,
    prices,
    pattern: { type: pattern, description: descriptions[pattern] },
  };
});

export default router;

import analyze from 'ac-stalk-market-analyzer';
import { getWeek, getYear } from 'date-fns';
import Router from 'koa-router';

const router = new Router({ prefix: 'user' });
const snowflakeRegex = /\d{17}/;

interface UserParams {
  userId: string;
  timezone: string;
}

interface TurnipPriceRecord {
  userId: number;
  week: number;
  year: number;
  monAm?: number;
  monPm?: number;
  tueAm?: number;
  tuePm?: number;
  wedAm?: number;
  wedPm?: number;
  thuAm?: number;
  thuPm?: number;
  friAm?: number;
  friPm?: number;
  satAm?: number;
  satPm?: number;
}

router.use('/:userId', async (ctx, next) => {
  const { userId } = ctx.params as UserParams;

  if (!userId || !userId.match(snowflakeRegex)) {
    ctx.throw(400, 'User ID is invalid.');
  }

  await next();
});

router.get('/:userId/turnips', ctx => {
  const date = new Date();

  ctx.body = {
    userId: Number(ctx.params.userId),
    week: getWeek(date),
    year: getYear(date),
    prices: [73, 72, 69, 80, 92, 112, 98, 95, 35, 32, 20, 17],
  };
});

router.get('/:userId/turnips/pattern', ctx => {
  ctx.body = { pattern: analyze([73, 72, 69, 80, 92, 112, 98, 95, 35, 32, 20, 17]) };
});

export default router;

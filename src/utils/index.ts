import { getWeek, getYear } from 'date-fns';
import { RouterContext } from 'koa-router';
import { Client } from 'pg';

import { ApiContext, Period, Periods, TurnipPriceRecord, WeekDay, WeekDays } from '../types';

export async function getTurnipRecord(
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

export function getPricesFromRecord({
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

export async function savePrice(
  db: Client,
  {
    userid,
    week,
    year,
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
  }: TurnipPriceRecord,
): Promise<void> {
  await db.query(
    `INSERT INTO price(userid, week, year,
      mon_am, mon_pm,
      tue_am, tue_pm,
      wed_am, wed_pm,
      thu_am, thu_pm,
      fri_am, fri_pm,
      sat_am, sat_pm)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [
      userid,
      week,
      year,
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
    ],
  );
}

export function determineWeekAndYear(
  ctx: RouterContext<{}, ApiContext>,
): { week: number; year: number } {
  let week: number;
  let year: number;

  const weekRequest = ctx.request.body.week ?? ctx.query.week;
  const yearRequest = ctx.request.body.year ?? ctx.query.year;

  if (weekRequest !== undefined) {
    const weekNr = Number(weekRequest);

    if (!Number.isNaN(weekNr) && weekNr >= 1 && weekNr <= 52) {
      week = weekNr;
    }
  }

  if (yearRequest !== undefined) {
    const yearNr = Number(yearRequest);

    if (!Number.isNaN(yearNr)) {
      year = yearNr;
    }
  }

  if (week === undefined || year === undefined) {
    const date = new Date();
    if (week === undefined) {
      week = getWeek(date);
    }

    if (year === undefined) {
      year = getYear(date);
    }
  }

  return { week, year };
}

export function determineDayAndPeriod(
  ctx: RouterContext<{}, ApiContext>,
): { day: WeekDay; period: Period } {
  const { day, period } = ctx.request.body;

  if (!WeekDays.includes(day)) {
    ctx.throw(400, 'Invalid day');
  }

  if (!Periods.includes(period)) {
    ctx.throw(400, 'Invalid period');
  }

  return { day, period };
}

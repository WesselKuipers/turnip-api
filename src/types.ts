import { Client } from 'pg';

export interface ApiContext {
  db: Client;
}

export const WeekDays = <const>['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export type WeekDay = typeof WeekDays[number];

export const Periods = <const>['am', 'pm'];
export type Period = typeof Periods[number];

export interface TurnipPriceRecord {
  userid: number;
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

export interface User {
  id: string;
  timezone: string;
}

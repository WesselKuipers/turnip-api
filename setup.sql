CREATE TABLE IF NOT EXISTS price(
  userid VARCHAR(17) NOT NULL,
  week SMALLINT NOT NULL,
  year SMALLINT NOT NULL,
  mon_am SMALLINT,
  mon_pm SMALLINT,
  tue_am SMALLINT,
  tue_pm SMALLINT,
  wed_am SMALLINT,
  wed_pm SMALLINT,
  thu_am SMALLINT,
  thu_pm SMALLINT,
  fri_am SMALLINT,
  fri_pm SMALLINT,
  sat_am SMALLINT,
  sat_pm SMALLINT,
  PRIMARY KEY (userid, week, year)
);

CREATE TABLE IF NOT EXISTS exchanges.countries (
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    CONSTRAINT countries_pkey PRIMARY KEY (code)
);
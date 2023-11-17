CREATE TABLE IF NOT EXISTS exchanges.exchange_offices (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    CONSTRAINT office_pkey PRIMARY KEY (id),
    CONSTRAINT country_code_fk FOREIGN KEY(country_code) REFERENCES exchanges.countries(code) ON DELETE NO ACTION
);
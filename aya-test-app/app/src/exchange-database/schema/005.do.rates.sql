CREATE TABLE IF NOT EXISTS exchanges.rates (
    office_id INTEGER NOT NULL,
    currency_pair currency_pair NOT NULL,
    in_price REAL NOT NULL,
    out_price REAL NOT NULL,
    reserve DOUBLE PRECISION NOT NULL,
    datetime TIMESTAMP NOT NULL,
    CONSTRAINT rates_office_id_fk FOREIGN KEY(office_id) REFERENCES exchanges.exchange_offices(id) ON DELETE CASCADE,
    CONSTRAINT rates_rate_unique UNIQUE (office_id, currency_pair, datetime)
);

CREATE INDEX IF NOT EXISTS rates_idx ON exchanges.rates(office_id, datetime);
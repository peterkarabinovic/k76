CREATE TABLE IF NOT EXISTS exchanges.exchanges (
    office_id INTEGER NOT NULL,
    currency_pair currency_pair NOT NULL,
    -- from_currency TEXT NOT NULL,
    -- to_currency TEXT NOT NULL,
    ask REAL NOT NULL,
    datetime TIMESTAMP NOT NULL,
    checksum TEXT NOT NULL,
    CONSTRAINT office_id_fk FOREIGN KEY(office_id) REFERENCES exchanges.exchange_offices(id) ON DELETE CASCADE,
    CONSTRAINT exchanges_checksum_unique UNIQUE (checksum, datetime)
);

CREATE INDEX IF NOT EXISTS exchanges_office_id_date_idx ON exchanges.exchanges(office_id, datetime);
CREATE INDEX IF NOT EXISTS exchanges_office_id_pair_idx ON exchanges.exchanges(office_id, currency_pair, datetime);
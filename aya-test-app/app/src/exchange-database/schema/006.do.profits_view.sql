CREATE MATERIALIZED VIEW exchanges.profits_view AS 
  WITH rate_ranges AS (
    SELECT office_id, 
           currency_pair,	
           in_price,
           out_price,
           datetime as start_time,
           LEAD(datetime,1, NOW()::TIMESTAMP) 
            OVER (PARTITION BY office_id, currency_pair ORDER BY datetime ASC) AS end_time
    FROM exchanges.rates
    ORDER BY office_id, currency_pair, datetime
  ),
  full_exchanges AS (
    SELECT ex.office_id, 
           ex.currency_pair, 
           ex.ask,
           ex.ask / (rr.out_price / rr.in_price ) as bid,
           CASE WHEN (ex.currency_pair).to = 'USD' 
            THEN 1 
            ELSE ask_rate.out_price / ask_rate.in_price  
           END AS ask_to_usd_coeff,
           CASE WHEN (ex.currency_pair).from = 'USD' 
            THEN 1 
            ELSE bit_rate.out_price / bit_rate.in_price  
           END AS bid_to_usd_coeff,
           ex.datetime

    FROM exchanges.exchanges as ex
    LEFT JOIN rate_ranges as rr 
    ON ex.datetime BETWEEN rr.start_time AND rr.end_time
    AND ex.office_id = rr.office_id
    AND ex.currency_pair = rr.currency_pair

    LEFT JOIN rate_ranges as ask_rate 
    ON ex.datetime BETWEEN ask_rate.start_time AND ask_rate.end_time
    AND ex.office_id = ask_rate.office_id
    AND ask_rate.currency_pair = ROW((ex.currency_pair).to, 'USD')::currency_pair

    LEFT JOIN rate_ranges as bit_rate 
    ON ex.datetime BETWEEN bit_rate.start_time AND bit_rate.end_time
    AND ex.office_id = bit_rate.office_id
    AND bit_rate.currency_pair = ROW((ex.currency_pair).from, 'USD')::currency_pair
  )
  SELECT ex.office_id,
         ex.currency_pair,
         ex.datetime,
         ex.bid * ex.bid_to_usd_coeff - ex.ask * ask_to_usd_coeff AS profit
  FROM full_exchanges as ex
WITH DATA;

CREATE INDEX profits_view_office_datetime_idx ON exchanges.profits_view(office_id, datetime);
CREATE MATERIALIZED VIEW exchanges.country_profits_view AS 
    SELECT 
    office.country_code as country_code,  
    date_trunc('day', profits.datetime) as day, 
    SUM(profits.profit) as profit
    FROM exchanges.profits_view AS profits
    INNER JOIN exchanges.exchange_offices office ON office.id = profits.office_id   
    GROUP BY office.country_code,  date_trunc('day', profits.datetime)
WITH DATA;

CREATE INDEX country_profits_code_day_idx ON exchanges.country_profits_view(country_code, day);
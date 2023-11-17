# AYA-TEST-APP

The application is AYA test task. Task describtion is in [Task.docx](files/Task.docx)


## Start App

Prerequerences:
- Docker Engine 24+

AYA-TEST-APP consists of two running Docker containers (see `docker-compose.yml`):

- `aya-test-app-exchange-reports` is service which loads exchange data from file to database and exposes GraphQL API
- `postgres` is PostgreSQL database

Before running the application check environment variables in `docker-compose.yml`:

- EXCHANGE_DB_HOST - postgres host 
- EXCHANGE_DB_PORT - postgres port
- EXCHANGE_DB_NAME - database name
- EXCHANGE_DB_USER - user login 
- EXCHANGE_DB_PASSWORD - user password
- DATA_FILE_PATH - path to file with exchange data
- PORT- port of application

You don't need to change any environment variables to start the application locally unless\
the ports (`EXCHANGE_DB_PORT` and `PORT`) are busy on your host.\
To start the application run command:
 
`docker compose up`

and wait console message

    exchange-reports  |             GraphQL Server runs on http://0.0.0.0:8080
    exchange-reports  |             GraphiQL is available at http://0.0.0.0:8080/graphiql

after that follow GraphiQL address (Web UI for running GraphQL requests).\
There, you can investigate GraphQL schema and run requests. For example this one:

    {
        topProfitCountries(from_date: "2023-01-01T11:00:00"){
            code
            name
            exchangers(topN: 10) {
                office_id,
                name
                profit
            }
        }
    }


## Answers To Test Questions:

### How to change the code to support different file format versions?

There is `intreface IExchangeDataSource` in module [exchange-data-sources](./app/src/exchange-data-sources/types.ts). To support new file format we beed to implement this intreface.

### How will the import system change if in the future we need to get this data from a web API?
The same answer. The `intreface IExchangeDataSource` provides data records via `AsyncIterable` interface. It makes it easy to write any async data provider.

### If in the future it will be necessary to do the calculations using the national bank rate, how could this be added to the system?

Main exchange data is stored in four tables: `countries`, `exchange_offices`, `exchanges`, `rates`.\
Data for reports is selected from these tables, aggregated and stored in materialized views: `profits_view` and `country_profits_view`.\
See details in [database schema directory](./app/src/exchange-database/schema/). The `profits_view` is the foundation for GraphQL API. \
If it will be necessary to use national bank rate in the future, then we need these rates in a separate table (like `national_bank_rates`) and using these rates populate `profits_view`.

### How would it be possible to speed up the execution of requests if the task allowed you to update market data once a day or even less frequently? Please explain all possible solutions you could think of.

After each new data upload, we need to execute SQL queries:

```
    REFRESH MATERIALIZED VIEW exchanges.profits_view;
    REFRESH MATERIALIZED VIEW exchanges.country_profits_view;
```

If there is a lot of data in database, these two queries can take a long time. We can partitionate data by time periods.\
For instance if our `exchange` table contains billions of records, we can replace one materialized view profits_view with multiple views like `last_quarter_profits_view`, `last_month_profits_view`, `last_week_profits_view`, or even `last_day_profits_view`.
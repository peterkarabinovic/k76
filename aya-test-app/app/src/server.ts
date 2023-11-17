import { config } from "./config";
import * as Database from "./exchange-database";
import * as DataSources from "./exchange-data-sources";
import * as Api from "./exchange-api/";

(async () => {

    const db = Database.createDbClient(config);

    await db.migrate();


    await Database.loadData({ 
        db, 
        dataSource: DataSources.createFileLoader(config.DATA_FILE_PATH) 
    });

    await Api.startGraphQLServer({
        db,
        port: config.PORT,
        onStop: () => db.close()
    });
})();
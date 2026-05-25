import app from "./app";
import config from "./config";
import { initDb } from "./db";
const main = async () => {
    try {
        await initDb();
        app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    }
    catch (error) {
        console.log(error);
    }
};
main();
//# sourceMappingURL=server.js.map
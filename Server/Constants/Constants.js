require("dotenv").config();
const { PORT, DB_URL, ENV, DEV } = process.env;

//Environments
let { URL } = process.env;
URL=(ENV==="PROD"?URL:DEV);

const Constants = {
    PORT,
    URL,
    DB_URL,
    ENV,
    COLORS: {
        info: "\x1b[36m",
        warn: "\x1b[33m", 
        error: "\x1b[31m"
    }
};

module.exports = Constants;
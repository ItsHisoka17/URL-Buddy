require("dotenv").config();
const { PORT, DB_URL } = process.env;

const Constants = {
    PORT,
    URL: "https://urlbuddy.groovify.space",
    DB_URL,
    COLORS: {
        info: "\x1b[36m",
        warn: "\x1b[33m", 
        error: "\x1b[31m"
    }
};

module.exports = Constants;
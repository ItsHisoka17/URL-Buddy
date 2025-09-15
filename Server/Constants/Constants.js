require("dotenv").config();
const { PORT, DB_URL } = process.env;

const Constants = {
    PORT,
    URL: "https://urlbuddy.groovify.space",
    DB_URL
};

module.exports = Constants;
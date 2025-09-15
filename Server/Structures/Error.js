class RequestError extends Error {
    constructor(message){
        super(message);
        this.name = "RequestError";
    }
};

class SQLError extends Error {
    constructor(message){
        super(message);
        this.name = "SQLError";
    }
};

module.exports = {RequestError, SQLError};
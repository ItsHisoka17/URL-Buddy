/**
 * @typedef {import ("../../Types/Types").Update} Update
 * @typedef {import ("../../Types/Types").Row<import ("../../Types/Types").UrlRow>} Rows
 */

const pg = require("pg");
const DB_URL = require("../Constants/Constants").DB_URL;
const { SQLError } = require("../Structures/Error");
const log = require("../Utils/log");

class Postgre {
    constructor(){
        this.process = new pg.Pool({
            connectionString: DB_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        log({
            message: "Database Started",
            dir: "database"
        });
        this.createTable().then(()=> {
            log({
                message: "TABLE urls IS EXISTENT",
                dir: "database"
            });
        });
    };

    async createTable(){
        await this.process.query("CREATE TABLE IF NOT EXISTS urls (id VARCHAR(255) PRIMARY KEY, path VARCHAR(255) UNIQUE NOT NULL, redirect TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 minutes')");
    };
    /**
    * @param {Update} options
    * @returns {Rows}
    */
    async update({data, method}){
        if (!data){
            throw new SQLError("PARAMETER data:object IS MISSING");
        };
        if (!data.table||data.table.split(" ").length>1){
            throw new SQLError("PARAMETER table:string: IS INVALID");
        };
        let rows;
        switch (method){
            case "GET": {
                if (!data.path&&!data.id){
                    throw new SQLError("MISSING PARAMETER path:string|id:string");
                };
                let response = await this.process.query(
                    `SELECT * FROM ${data.table} WHERE ${data.id?"id":"path"}=$1`,
                    [data.id?data.id:data.path]
                );
                if (response.rowCount<1) {
                    rows = false;
                } else {
                rows = response.rows;
                };
                break;
            };

            case "INSERT": {
                if (!data.id||!data.path||!data.redirect){
                    throw new SQLError("MISSING PARAMETER id:string|path:string|redirect:string");
                };
                let response = await this.process.query(
                    `INSERT INTO ${data.table} (id, path, redirect) VALUES ($1, $2, $3) RETURNING *`,
                    [data.id, data.path, data.redirect]
                );
                rows = response.rows;
                break;
            };

            case "DELETE": {
                if (!data.id){
                    throw new new SQLError("MISSING PARAMETER id:string | DELETING TABLE IS NOT PERMITTED");
                };
                let response = await this.process.query(
                    `DELETE FROM ${data.table} WHERE id=$1 RETURNING *`,
                    [data.id]
                );
                rows = response.rows;
                break;
            };

            case "TABLE": {
                let response = await this.process.query(`SELECT * FROM ${data.table}`);
                if (response.rowCount<1) {
                    log({
                        message: "NO ROWS FOUND MATCHING QUERY",
                        level: "warn",
                        dir: "database"
                    });
                    rows = false;
                } else {
                rows = response.rows;
                };
                break;
            };

            default: {
                throw new SQLError(`UNKNOWN METHOD: ${method}`)
            };
        };
        return rows;
    };
};

module.exports = Postgre;
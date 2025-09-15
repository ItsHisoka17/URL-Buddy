/**
 * @typedef {import ("../../Types/Types").Update} Update
 * @typedef {import ("../../Types/Types").Row<import ("../../Types/Types").UrlRow>} Rows
 */

const pg = require("pg");
const DB_URL = require("../Constants/Constants").DB_URL;
const { SQLError } = require("../Structures/Error");

class Postgre {
    constructor(){
        this.process = new pg.Pool({
            connectionString: DB_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        console.log("Database Started")
    };
    /**
    * @param {Update} options
    * @returns {Rows}
    */
    async update(options){
        let { data } = options;
        if (!data){
            throw new SQLError("PARAMETER data:object IS MISSING");
        };
        if (!data.table){
            throw new SQLError("PARAMETER table:string: IS MISSING");
        };
        let rows;
        switch (options.method){
            case "GET": {
                if (!data.id){
                    throw new SQLError("MISSING PARAMETER id:string");
                };
                let response = await this.process.query(
                    `SELECT * FROM ${data.table} WHERE id=$1`,
                    [data.id]
                );
                if (response.rowCount<1) {
                    console.error(new SQLError("NO ROWS FOUND MATCHING QUERY"));
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

            default: {
                throw new SQLError(`UNKNOWN METHOD: ${options.method}`)
            };
        };
        return rows;
    };
};

module.exports = Postgre;
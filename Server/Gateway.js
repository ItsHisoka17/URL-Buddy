const cors = require("cors");
const cookies = require("cookie-parser");
const Constants = require("./Constants/Constants");
const express = require("express");
const { join } = require("path");
const { log, generateString } = require("./Utils/Utils")
const Postgre = require("./Database/Postgre");
const URL = Constants.URL;

class Gateway {

    constructor(server){
        this.server = server;
        this.postgre = new Postgre();
        server.use(cookies());
        server.use(cors({
            origin: URL,
            credentials: true
        }));
        server.get("/api/createGateway", async (req, res)=> {
            try {
                let data = req.body;
                if (!data.redirect){
                    res.status(401).json({error: "RequestError | MISSING REDIRECT PARAMETER"});
                };
                let response = await this.createGateway(data.redirect);
                res.status(200).json({response});
                log({
                    message: `Gateway Created ${response[0].id}`
                })
            } catch (e) {
                console.error(e);
                log({
                    message: e.message, 
                    level: "error", 
                    logToConsole: false
                })
                res.status(500).json({error: "SQLError | ERROR LOGGED"});
            }
        });
        server.use(express.static(join(process.cwd(), "Client", "dist")));
        log({
            message: "Gateway Started"
        });
    };

    async createGateway(redirectURL){
        let invalidatePath = async (p)=> {
            let res = await this.postgre.update({
                method: "GET",
                data: {
                    table: "urls",
                    id: p
                }
            });
            let truthy = (res&&res[0].id)?true:res;
            return truthy;
        };
        let createData = async ()=> {
            let data = {
                id: generateString(7),
                path: generateString(10)
            };
            let exists = await invalidatePath(data["id"]);
            if (exists) {
                return createCredentials();
            } else {
                return data;
            };
        };

        let data = await createData();
        let updated = await this.postgre.update({
            method: "INSERT",
            data: {
                table: "urls",
                id: data["id"],
                path: data["path"],
                redirect: redirectURL
            }
        });
        return updated;
    };
};

module.exports = Gateway;
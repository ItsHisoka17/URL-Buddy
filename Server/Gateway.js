const cors = require("cors");
const cookies = require("cookie-parser");
const bodyparser = require("body-parser");
const Constants = require("./Constants/Constants");
const express = require("express");
const { join } = require("path");
const log = require("./Utils/log");
const generateString = require("./Utils/generateString");
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
        this.start();
        server.post("/api/createGateway", bodyparser, async (req, res)=> {
            try {
                let data = req.body;
                if (!data.redirect){
                    res.status(400).json({error: "RequestError | Missing [redirect] Parameter"});
                };
                let response = await this.createGateway(data.redirect);
                res.status(200).json({response});
                log({
                    message: `Gateway Created ${response[0].id}`,
                    dir: "database"
                });
                await this.listen();
            } catch (e) {
                console.error(e);
                log({
                    message: e.message, 
                    level: "error",
                    dir: "database", 
                    logToConsole: false
                })
                res.status(500).json({error: "SQLError | ERROR LOGGED"});
            }
        });

        server.post("/api/log", bodyparser(), (req, res)=> {
            if(!req.body?.message){
                res.status(400).json({error: "RequestError | Missing [message] Parameter"});
            };
            if (typeof req.body.message==="string"){
                log({
                    message: req.body.message,
                    dir: "client"
                });
                res.status(200).json({message: "Log Successful"});
            };
        });

        server.use(express.static(join(process.cwd(), "Client", "dist")));
        log({
            message: "Gateway Started"
        });
    };

    async listen(){
        let data = await this.postgre.update({
            data: {
                table: "urls"
            },
            method: "TABLE"
        });
        let now = new Date();
        if (data){
            for (let row of data){
                if (row.expires_at&&new Date(row.expires_at)<=now){
                    await this.postgre.update({
                        data: {
                            id: row.id
                        },
                        method:"DELETE"
                    });
                    log({
                        message: `ROW ${row.id} DELETED - EXPIRED`,
                        dir: "database"
                    });
                    continue;
                };
                if (row.path){
                    this.server.get(`/${row.path}`, (req, res)=> {
                        if (row.redirect){
                            res.redirect(row.redirect);
                        } else {
                            res.redirect("/");
                        };
                    });
                };
            };
        };
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

    start() {
        this.listen().catch((err)=> {log({message: `Listen Failed ${err}`, level: "error"})});
        setInterval(()=> {
            this.listen().catch((err)=> {log({message: `Listen Failed ${err}`, level: "error"})});
        }, 5*60*1000);
    };
};

module.exports = Gateway;
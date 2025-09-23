const cors = require("cors");
const cookies = require("cookie-parser");
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
        server.use(express.json());
        this.start();
        server.post("/api/createGateway", async (req, res)=> {
            try {
                let data = req.body;
                if (!data.redirect){
                    res.status(400).json({error: "RequestError | Missing [redirect] Parameter"});
                    return;
                };
                let path = req.body?.path || null
                let response = await this.createGateway(data.redirect, path);
                res.cookie("id", response[0].id, {
                    maxAge: 5*60*1000
                });
                res.status(200).json({...response[0]});
                log({
                    message: `Gateway Created ${response[0].id} ${response[0].path}`,
                    dir: "database"
                });
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

        server.post("/api/log", (req, res)=> {
            if(!req.body?.message){
                res.status(400).json({error: "RequestError | Missing [message] Parameter"});
                return;
            };
            if (typeof req.body.message==="string"){
                log({
                    message: req.body.message,
                    dir: "client"
                });
                res.status(200).json({message: "Log Successful"});
            };
        });

        server.get("/api/checkPath/:path", async (req, res)=> {
            let response = await this.postgre.update({
                data: {
                    table: "urls",
                    path: req.params.path
                },
                method: "GET"
            });
            if (response&&response.length>0){
                res.json({exists: true});
            } else {
                res.json({exists: false});
            };
        });

        server.get("/api/checkExists", async (req, res)=> {
            let exists = false;
            let data;
            let result = {exists};
            try {
            if (req.cookies.id){
                let response = await this.postgre.update({
                    method: "GET",
                    data: {
                        id: req.cookies.id
                    }
                });
                if (response[0]&&response[0].id){
                    exists = true;
                    data = {
                        ...response[0]
                    };
                };
                Object.defineProperty(result, "data", data);
                res.status(200).json(data);
            }
            } catch (e) {
                res.status(500).json({error: "API Error", status: 500});
                console.error(e);
                log({
                    message: `API Request Error ${e}`,
                    level: "error"
                });
            };
        })
        server.use(express.static(join(process.cwd(), "Client", "dist")));
        log({
            message: "Gateway Started"
        });
    };

    async createGateway(redirectURL, path){
        let validatePath = async (p)=> {
            let res = await this.postgre.update({
                method: "GET",
                data: {
                    table: "urls",
                    path: p
                }
            });
            let truthy = (res&&res[0].id)?true:res;
            return truthy;
        };
        let createData = async ()=> {
            let data = {
                id: generateString(7),
                path: path?path:generateString(10)
            };
            let exists = await validatePath(data["path"]);
            if (exists) {
                return await createData();
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
        this.server.get("/:path", async (req, res)=> {
            let response = await this.postgre.update({
                data: {
                    table: "urls",
                    path: req.params.path
                },
                method: "GET"
            });
            if (response&&response[0].redirect){
                res.redirect(response[0].redirect)
            } else {
                res.redirect("/");
            };
        });
        async function del(){
            let data = await this.postgre.update({
                data: {
                    table: "urls"
                },
                method: "TABLE"
            });
            for (let row of data){
                if (new Date(row.expires_at).getTime()<=new Date().getTime()){
                    await this.postgre.update({
                        data: {
                            table: "urls",
                            id: row.id
                        },
                        method: "DELETE"
                    });
                    log({
                        message: `ROW ${row.path} ${row.id} DELETED - EXPIRED`,
                        dir: "database"
                    });
                };
            };
        };
        del = del.bind(this);
        del().catch(()=>{});
        setInterval(async ()=> {
            await del();
        }, 5*60*1000);
    };
};

module.exports = Gateway;
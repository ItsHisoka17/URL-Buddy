/**
 * @typedef {import("../../Types/Types").LogData} LogData
 */

const fs = require("fs");
const { COLORS } = require("../Constants/Constants");
const formatDate = require("./formatDate");
const path = require("path");
/**
 * 
 * @param {LogData} data 
 */
function log({message, level="info", logToConsole=true, dir="server"}){
    if (!["info","error", "warn"].includes(level)){
        throw new Error("Invalid [level] Parameter");
    };
    if (Array.isArray(dir)){
        dir.forEach((d)=> {log({message, level, logToConsole, d})});
        return;
    };
    let date = formatDate();
    let file = path.join(process.cwd(), "logs", `${dir}.log`);
    if (!fs.existsSync(path.join(process.cwd(), "logs"))){
        return;
    };
    if (!fs.existsSync(file)){
        fs.writeFileSync(file, `[INFO] - ${date} | File created at ${file}\n`);
        console.info(`${COLORS["info"]}[INFO] - ${date} | File created at ${file}`);
    };
    fs.appendFile(file,`[${level.toUpperCase()}] - ${date} | ${message}\n`, (err)=> {
        if (err){
            console.error(`${COLORS["error"]}[ERROR] - ${date} | Unable to log ${err}`);
        };
    });
    if (logToConsole){
        console[level](`${COLORS[level]}[${level.toUpperCase()}] - ${date} | ${message}`);
    };
};

module.exports = log;
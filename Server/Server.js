const server = require("express")();
const Gateway = require("./Gateway");
const { PORT, ENV} = require("./Constants/Constants");
const log = require("./Utils/log");

new Gateway(server);

server.listen(PORT, ()=> {
    log({
        message: `${ENV} - Server Running: ${PORT}`
    });
});
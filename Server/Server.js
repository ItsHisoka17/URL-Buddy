const server = require("express")();
const Gateway = require("./Gateway");
const { PORT } = require("./Constants/Constants");
const { log } = require("./Utils/Utils");

new Gateway(server);

server.listen(PORT, ()=> {
    log({
        message: `Server Running - PORT: ${PORT}`
    });
});
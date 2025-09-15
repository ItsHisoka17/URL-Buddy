const server = require("express")();
const Gateway = require("./Gateway");
const { PORT } = require("./Constants/Constants");

new Gateway(server);

server.listen(PORT, ()=> {
    console.log(`SERVER RUNNING | PORT: ${PORT}`);
});
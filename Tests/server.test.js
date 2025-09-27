const request = require("supertest");
const server = require("../Server/Server");
const { ROUTES } = require("../Server/Constants/Constants");

describe("API Routes", ()=> {
    let base = ROUTES.API;
    let routes = ROUTES.APIROUTES.slice(0, 2);
    let agent;
    beforeAll(()=> {
        agent = request(server);
    })

    //Test error handling
    for (let route of routes){
        route === routes[0]
        ?
        (
            it("Return {exists:false} if id not existent", async()=> {;
                let res = await agent.get(base+routes[0]);
                expect(res.body).toHaveProperty("exists", false);
            })
        )
        : 
        (
            it("Return 400 if message not sent", async()=> {
            let res = await agent.post(base+routes[1]).send();
            expect(res.status).toBe(400)
        })
        );
    };

    //Test successful requests
    it("Successful message log", async()=> {
        let res = await agent.post(base+routes[1]).send({message:"Testing API"});
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message", "Log Successful")
    });

    afterAll(()=> {
        clearInterval(server.Gateway.delInterval);
    });
});
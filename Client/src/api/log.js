export async function log(message){
    if (!message||!(typeof message==="string")){
        throw new Error("Missing [message] Parameter");
    };
    let response = await fetch("/api/log", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({message})
    });
    let body = await response.json().catch(()=> null);
    if (!response.ok||response.status!==200){
        throw new Error(body?.error||"API Error");
    };
    return body;
};
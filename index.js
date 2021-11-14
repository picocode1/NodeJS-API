const express = require('express')
const server = express()
const serverport = 9009

var print = ('[\x1b[31mAPI\x1b[0m]');

//Simple respond for error
function json_respond(error, error_reason) {
    return JSON.stringify({
        success: error,
        reason: error_reason
    })
}

//Get own IP4 adress
var our_ip, ifaces = require('os').networkInterfaces();
for (var dev in ifaces) {
    ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false ? our_ip = details.address : undefined);
}

//Redirect to API location
server.get('/', (req, request) => {
    request.redirect(req.protocol + '://' + req.get('host') + "/api/");
})

server.get('/api/', (req, request) => {
    //User Ip
    var ip_adress = req.connection.remoteAddress.substring(7);

    var current_url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl).searchParams;

    var API = {
        key: current_url.get('key'),
        data: current_url.get('data'),
    }

    var API_key = [
        '5b34c1d5467f5f3b53bbba81d4b23da0',
        '03c7c0ace395d80182db07ae2c30f034',
        '7815696ecbf1c96e6894b779456d330e',
        '652186e864af4ff95ff87b9be12f91e8', //Blacklisted API key example
    ];

    var BLACKLIST_API = [
        '652186e864af4ff95ff87b9be12f91e8'
    ]
    var BLACKLIST_CLIENT = [
        '189.65.134.170'
    ]

    if (BLACKLIST_CLIENT.includes(ip_adress)) {
        return request.send(json_respond(false, 'Blacklisted IP adress'))
    }

    if (BLACKLIST_API.includes(API.key)) {
        return request.send(json_respond(false, 'Blacklisted API key'))
    }


    if (API.key == null) return request.send(json_respond(false, 'Missing API key'))
    else if (!API_key.includes(API.key)) return request.send(json_respond(false, 'Wrong API key'))
    else if (API.data == null || API.data == '') return request.send(json_respond(false, 'Data is empty'))

    /* http://localhost:9009/api?key=7815696ecbf1c96e6894b779456d330e&data=hey!
    {
        "success": true,
        "data": "hey!"
    }
    */
    console.log(print, {
        data: API.data,
        ip: ip_adress
    })

    //Send your data to the user
    request.send(JSON.stringify({
        success: true,
        data: API.data
    }))
})

server.listen(serverport, () => {
    console.log(`Listening at http://${our_ip}:${serverport}`)
})

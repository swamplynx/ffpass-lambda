const event = require('yargs').event
const fordApi = require('ffpass')
const NGo = require('node-geocoder')
const code = require('http-status-code')
const googleMapsApiKey = process.env.MAPS_API_KEY
const car = new fordApi.vehicle(process.env.FORD_USERNAME, process.env.FORD_PASSWORD, process.env.VIN)
 
// setup the google maps api for looking up address info from gps coordinates
var geoOptions = {
    provider: 'geocodio',
    httpAdapter: 'https',
    apiKey: googleMapsApiKey,
}
var geocoder = NGo(geoOptions)

// sleep the script so we don't hit a rate limit on the status api requests
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// main async function so we can use await
exports.handler = async function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    await car.auth()

    if (event.headers.command == 'status') {
        console.log(`Downloading vehicle status data...\n`)
        try {
            var vehicleData = await car.status()
            console.log(`Engine State: ${vehicleData.ignitionStatus.value} \t\t(Refreshed: ${vehicleData.ignitionStatus.timestamp})`)
                var engine = `${vehicleData.ignitionStatus.value}`
            console.log(`Odometer Reading: ${Math.round(vehicleData.odometer.value/1.609344)} miles \t(Refreshed: ${vehicleData.odometer.timestamp})`)
                var odometerread = `${Math.round(vehicleData.odometer.value/1.609344)}`
            console.log(`Battery Status: ${vehicleData.battery.batteryHealth.value} \t(Refreshed: ${vehicleData.battery.batteryHealth.timestamp})`)
                var batterystat = `${vehicleData.battery.batteryHealth.value}`
            console.log(`Oil Life: ${vehicleData.oil.oilLifeActual}% \t\t\t(Refreshed: ${vehicleData.oil.timestamp})`)
                var oillife = `${vehicleData.oil.oilLifeActual}`
            console.log(`Tire Pressure: ${vehicleData.tirePressure.value} \t(Refreshed: ${vehicleData.tirePressure.timestamp})`)
                var tirepress = `${vehicleData.tirePressure.value}`
            console.log(`Distance to Empty: ${Math.round(vehicleData.fuel.distanceToEmpty/1.609344)} miles \t(Refreshed: ${vehicleData.fuel.timestamp})`)
                var dte = `${Math.round(vehicleData.fuel.distanceToEmpty/1.609344)}`
                var gasleft = `You have ${Math.round(vehicleData.fuel.distanceToEmpty/1.609344)} miles till empty.`
            console.log(`Vehicle Location: \n${JSON.stringify(vehicleData.gps)}`)
                var gpsloc = `${JSON.stringify(vehicleData.gps)}`
                var location = await geocoder.reverse({lat:vehicleData.gps.latitude, lon:vehicleData.gps.longitude})

let responseBody = {
       engine, odometerread, dte, oillife, batterystat, tirepress, gpsloc, location, gasleft
    };
          
          var response = {
                "statusCode": 200,
                 body: JSON.stringify(responseBody),
                "isBase64Encoded": false
    };
        } catch (error) {
            console.log(`There was an error getting vehicle status! ${error}`)
             var response = {
                 "statusCode": 500,
                "isBase64Encoded": false
                 };
        }
    } else {
        try {
            var result = await car.issueCommand(event.headers.command)
            console.log(`Issuing the ${event.headers.command} command. Result: ${code.getMessage(result.status)}`)
            
            while (await car.commandStatus(event.headers.command, result.commandId) == 552) {
                console.log(`Waiting for command response...`)
                await sleep(1000)
            }
            if (await car.commandStatus(event.headers.command, result.commandId) != 200) {
                console.log(`There was an error executing the command on the vehicle. Code: ${await car.commandStatus(event.headers.command, result.commandId)}`)
                let responseBody = {
                    message : 'Error executing the command!'
                                    };
                var response = {
                     "statusCode": 500,
                     body: JSON.stringify(responseBody),
                    "isBase64Encoded": false
                    };

            } else {
                console.log(`Command: ${event.headers.command} executed successfully!`)
                 let responseBody = {
                    message : 'Command executed successfully!'
                                    };
                var response = {
                    "statusCode": 200,
                    body: JSON.stringify(responseBody),
                    "isBase64Encoded": false
                    };

            }
        } catch (error) {
            console.log(`There was an error sending the command: ${event.headers.command} to the vehicle!`)
            let responseBody = {
                    message : 'Error sending the command!'
                                    };
            var response = {
                "statusCode": 500,
                body: JSON.stringify(responseBody),
                "isBase64Encoded": false
                };
        }
    }
        callback(null, response);
}

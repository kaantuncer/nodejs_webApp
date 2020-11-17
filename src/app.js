const request = require('request');
const chalk = require('chalk')


const geocode = (address, callback) => {

    var geoUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
    geoUrl += encodeURIComponent(address)
    geoUrl += ".json?access_token=pk.eyJ1Ijoia2FhbnR1biIsImEiOiJja2dvd3hveWYwMGFnMzNzMmc3cWpoeXkyIn0.3JmOMTuMpCMzl5eTY5gnbQ"

    request({ url: geoUrl, json: true }, (error, response) => {

        if (error || response.body.error || response.body.features == undefined) {
            callback('Unable to connect', undefined)
            return;
        }
        if (response.body.features.length == 0) {
            console.log('Unable to find location')
            callback('Unable to find location', undefined)
            return;
        }
        let coordinates = response.body.features[0].center;

        console.log(chalk.green(response.body.features[0].place_name))
        callback(undefined, coordinates)
    })

}

const forecast = (coordinates, callback) => {

    const url = 'http://api.weatherstack.com/current?access_key=91e0a436c49de3db65d831cf8e433fc5&units=m&query=' + coordinates[1] + ',' + coordinates[0];

    request({ url: url, json: true }, (error, response) => {

        if (error || response.body.current == null) {
            callback('ERROR ?', undefined)
        }
        else if (response.body.error) {
            callback('ERROR 2', undefined)
        }
        console.log(response.body)        
        callback(undefined, {
            "location": response.body.location.country + "/" + response.body.location.region,
            "description": response.body.current.weather_descriptions[0],
            "temperature": response.body.current.temperature,
            "feelsLike": response.body.current.feelslike,
            "forecast": response.body.current.weather_descriptions[0] + ". It is currently " + response.body.current.temperature + " degrees out. It feels like " +
                response.body.current.feelslike+" degrees."
        })

    })
}










const path = require('path')
const hbs = require('hbs')
const express = require('express')


const app = express()
const port = process.env.PORT || 3000

const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname,'../templates/partials')

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)


// Setup static directory to serve
app.use(express.static(path.join(__dirname, '../public')))

app.get('', (req, res) => {
    res.render('index', {
        title: 'Weather APP',
        name:'KAAN TUNÇER',
    })
})

app.get('/about', (req, res) => {
    
    res.render('about', {
        title: 'ABOUT ME',
        name:'Kaan Tunçer'
    })

})

app.get('/help', (req, res) => {
    res.render('help', {
        title: 'HELP PAGE',
        message: 'HELP MESSAGE',
        name:"KAAN TUNCER"
    })
})


app.get('/weather', (req, res) => {

    if (!req.query.location) {
        return res.send({
            location: "LOCATION",
            forecast: "FORECAST"
        })   
    }
    geocode(req.query.location, (error, data) => {

        if (error != undefined) {
            res.send({"error":error})
            return
        }
        forecast(data, (error, response) => {

            if (error != undefined) {
                res.send(error)
                return
            }
            res.send(response)
        })
    })



})

app.get('/products', (req, res) => {

    if (!req.query.search) {
        res.send({
            error: "You must provide a search term"
        })
        return;
    }

    console.log(req.query)

    res.send({
        products:[]
    })

})

app.get('/help/*', (req, res) => {
    
    res.render('404', {
        title: '404',
        name: 'Kaan Tunçer',
        errorMessage: 'Help article not found'
    })
})

app.get('*', (req, res) => {
    
    res.render('404', {
        title: '404',
        name:'Kaan Tunçer',
        errorMessage:'Page not found'
    })
})

app.listen(port, () => {
    
    console.log('SERVER STARTED ON PORT '+port)

})



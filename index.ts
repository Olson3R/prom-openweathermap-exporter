import prom from 'prom-client'
import express from 'express'
import axios from 'axios'
import _ from 'lodash'

const openweathermap_TempF = new prom.Gauge({
  name: 'openweathermap_TempF',
  help: 'Temperature (F)',
  labelNames: [
    'name'
  ]
})

const openweathermap_TempMinF = new prom.Gauge({
  name: 'openweathermap_TempMinF',
  help: 'Min Temperature (F)',
  labelNames: [
    'name'
  ]
})

const openweathermap_TempMaxF = new prom.Gauge({
  name: 'openweathermap_TempMaxF',
  help: 'Max Temperature (F)',
  labelNames: [
    'name'
  ]
})

const openweathermap_Humidity = new prom.Gauge({
  name: 'openweathermap_Humidity',
  help: 'Humidity (%)',
  labelNames: [
    'name'
  ]
})

const openweathermap_Pressure = new prom.Gauge({
  name: 'openweathermap_Pressure',
  help: 'Pressure',
  labelNames: [
    'name'
  ]
})

const openweathermap_WindSpeed = new prom.Gauge({
  name: 'openweathermap_WindSpeed',
  help: 'Wind Speed (MPH)',
  labelNames: [
    'name'
  ]
})

const openweathermap_WindGust = new prom.Gauge({
  name: 'openweathermap_WinGust',
  help: 'Wind Gust (MPH)',
  labelNames: [
    'name'
  ]
})

const openweathermap_WindDirection = new prom.Gauge({
  name: 'openweathermap_WindDirection',
  help: 'Wind Direction (DEG)',
  labelNames: [
    'name'
  ]
})

const openweathermap_Snow = new prom.Gauge({
  name: 'openweathermap_Snow',
  help: 'Snow (IN)',
  labelNames: [
    'name',
    'duration'
  ]
})

const openweathermap_Rain = new prom.Gauge({
  name: 'openweathermap_Rain',
  help: 'Rain (IN)',
  labelNames: [
    'name',
    'duration'
  ]
})

const openweathermap_CloudCover = new prom.Gauge({
  name: 'openweathermap_CloudCover',
  help: 'Cloud Cover (%)',
  labelNames: [
    'name'
  ]
})

async function getAll() {
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather`,
    {
      params: {
        appid: process.env.API_KEY,
        lat: process.env.LATITUDE,
        lon: process.env.LONGITUDE,
        units: 'imperial'
      }
    }
  )

  return response.data
}

async function getMetrics() {
  const json = await getAll()
  openweathermap_TempF.set({ name: json.name }, Number(json.main.temp))
  openweathermap_TempMinF.set({ name: json.name }, Number(json.main.temp_min))
  openweathermap_TempMaxF.set({ name: json.name }, Number(json.main.temp_max))
  openweathermap_Pressure.set({ name: json.name }, Number(json.main.pressure))
  openweathermap_Humidity.set({ name: json.name }, Number(json.main.humidity))
  openweathermap_WindSpeed.set({ name: json.name }, Number(_.get(json, 'wind.speed')))
  openweathermap_WindGust.set({ name: json.name }, Number(_.get(json, 'wind.gust')))
  openweathermap_WindDirection.set({ name: json.name }, Number(_.get(json, 'wind.deg')))
  openweathermap_Snow.set({ name: json.name, duration: '1h' }, Number(_.get(json, 'snow.1h')))
  openweathermap_Rain.set({ name: json.name, duration: '1h' }, Number(_.get(json, 'rain.1h')))
  openweathermap_CloudCover.set({ name: json.name }, Number(_.get(json, 'clouds.all')))

  return prom.register.metrics()
}

function main() {
  const app = express()

  app.get(process.env.HEALTH_PATH ?? '/healthz', (_req, res) => res.send({status: 'up'}))

  app.get(process.env.METRICS_PATH ?? '/metrics', async (req, res) => {
    let metrics: string
    try {
      metrics = await getMetrics()
    }
    catch (e: any) {
      console.error('Error getting metrics!!!', e)
      res.status(500).send({ status: 'ERROR' })
      return
    }
    console.log('Sent')
    res.send(metrics)
  })

  app.listen(
    parseInt(process.env.PORT ?? '8002'),
    process.env.HOST ?? '0.0.0.0',
    () => console.log('Server is running!!!')
  )
}

try {
  main()
} catch (e: any) {
  console.error('Error during startup!!!')
  console.error(e.message, e.stack)
  process.exit(1)
}

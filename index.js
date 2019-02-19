/* eslint-disable no-unused-vars */
const populationDataSource = 'http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv'
const carbondioxideSource = 'http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=csv'
const population = 'population'
const carbondioxide = 'carbondioxide'
const cors = require('cors')
const express = require('express')
const schedule = require('node-schedule')
const dataService = require('./dataService')

const app = express()
app.use(cors())

async function updateData() {
  await dataService.process(populationDataSource, population)
  await dataService.process(carbondioxideSource, carbondioxide)
}

schedule.scheduleJob('0 4 * * *', () => {
  updateData()
});

app.get('/api/population', (req, res, next) => {
  res.json(dataService.data[population])
})

app.get('/api/population/:country', (req, res, next) => {
  const countryName = req.params.country
  const countryData = dataService.data[population].filter(country => country['Country Name'].toUpperCase().includes(countryName.toUpperCase()))
  res.json(countryData)
})

app.get('/api/carbondioxide', (req, res, next) => {
  res.json(dataService.data[carbondioxide])
})

app.get('/api/carbondioxide/:country', (req, res, next) => {
  const countryName = req.params.country
  const countryData = dataService.data[carbondioxide].filter(country => country['Country Name'].toUpperCase().includes(countryName.toUpperCase()))
  res.json(countryData)
})

app.get('/api/carbondioxidePerCapita', (req, res, next) => {
  res.json(dataService.data[carbondioxide])
})

app.get('/api/carbondioxidePerCapita/:country', (req, res, next) => {
  const countryName = req.params.country
  const countryData = dataService.data[carbondioxide].filter(country => country['Country Name'].toUpperCase().includes(countryName.toUpperCase()))
  res.json(countryData)
})

updateData()
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

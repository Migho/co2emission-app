/* eslint-disable no-unused-vars */
const populationDataSource = 'http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv'
const carbondioxideSource = 'http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=csv'
const population = 'population'
const carbondioxide = 'carbondioxide'
const express = require('express')
const dataService = require('./dataService')

const app = express()

dataService.process(populationDataSource, population)
dataService.process(carbondioxideSource, carbondioxide)

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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

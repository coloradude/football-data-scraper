'use strict'
const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')
const json2csv = require('json2csv')
const Promise = require('bluebird')

const rateLimit = 3000

const getCareerSummaryUrls = ($) => {
  const careerSummaryUrls = []
  $('#passing tbody').children().each((i, el) => {
     careerSummaryUrls.push($(el).find('td').find('a').attr('href'))
  })
  return careerSummaryUrls.filter(item => item)
}

const createPromiseArray = (urls) => {
  return urls    
    // .slice(0, 1)
    .map((url, i) => {
      const options = {
        uri: 'https://www.pro-football-reference.com' + url,
        transform: body => cheerio.load(body)
      }
      return Promise.delay(i * rateLimit).then(() => {
        console.log('sending request', url)
        return rp(options)
      })
    }) 
}

const getAllPromises = (promises) => Promise.all(promises)

const getPlayerUrls = (careerSummary, year) => {
  return careerSummary.map($ => {
    if (year === 2014){
      return $('#inner_nav').find('.hasmore').first().find('li').last().prev().prev().find('a').attr('href')
    } else if (year === 2015){
      return $('#inner_nav').find('.hasmore').first().find('li').last().prev().find('a').attr('href')
    } else {
      return $('#inner_nav').find('.hasmore').first().find('li').last().find('a').attr('href')
    }
  })
}

const parsePlayerData = (playerData) => {
  const allGameData = []
  playerData.forEach($ => {
    $('#stats tbody').children().each((i, row) => {
      const playerName = $('#meta h1').text()
      const gameData = {}
      $(row).children().each((i, stat) => {
        if ($(stat).children().length > 0){
          // Some of the data is nested inside of an anchor tag. This detects 
          // if that is the case
          gameData[$(stat).data('stat')] = $(stat).find('a').text()
        } else {
          gameData[$(stat).data('stat')] = $(stat).text()
        }
        gameData.playerName = playerName
      })
      allGameData.push(gameData)
    })
  })
  return allGameData
}

const generateCSV = (data, year) => {
  fs.writeFileSync(year + '-passing.csv', 
    json2csv({
      data: data, 
      fields: Object.getOwnPropertyNames(data[0])
    }))
}

const getYearlyData = (startingYear) => {
  if (startingYear > 2016) return

  const options = {
    uri: 'https://www.pro-football-reference.com/years/' + startingYear + '/passing.htm',
    transform: body => cheerio.load(body)
  }

  rp(options)
    .then(getCareerSummaryUrls)
    .then(createPromiseArray)
    .then(getAllPromises)
    .then(careerSummary => getPlayerUrls(careerSummary, startingYear))
    .then(createPromiseArray)
    .then(getAllPromises)
    .then(parsePlayerData)
    .then(data => generateCSV(data, startingYear))
    .then(() => getYearlyData(startingYear + 1))    
    .catch(err =>  {
      throw err
    })

}

getYearlyData(2014)
  






  
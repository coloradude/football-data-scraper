'use strict'
const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')
const json2csv = require('json2csv')
const Promise = require('bluebird')

const rateLimit = 3000

const getCareerSummaryUrls = ($) => {
  const careerSummaryUrls = []

  // Grabbing href's and passing them into array

  $('#passing tbody').children().each((i, el) => {
     careerSummaryUrls.push($(el).find('td').find('a').attr('href'))
  })
  return careerSummaryUrls
}

const createPromiseArray = (urls) => {
  return urls
    // We have to filter because some of the rows dont contain any info
    .filter(item => item)
    .slice(0, 1)
    .map((url, i) => {
      const options = {
        uri: 'https://www.pro-football-reference.com' + url,
        transform: body => cheerio.load(body)
      }

      return Promise.delay(i * rateLimit).then(() => {
        console.log('sending request')
        rp(options)
      })
    }) 
}

const getAllPromises = (promises) => Promise.all(promises)

const getPlayerUrls = (careerSummary) => {
  return careerSummary.map($ => {

    // Nasty DOM traversal since they dont give classes or ids or 
    // any unique attributes to stuff

    return $('#inner_nav').find('.hasmore').first().find('li').last().find('a').attr('href')
  })
}

const parsePlayerData = (playerData) => {
  const allGameData = []

  // Here we are parsing the season stats table and flattening it out. In the
  // end we want a csv with every game played by every player, one to each row.

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

const generateCSV = (data) => {
  fs.writeFileSync('2016-passing.csv', 
    json2csv({
      data: data, 
      fields: Object.getOwnPropertyNames(data[0])
    }))
}

// Grabbing initial list of all player urls

const years = ['2015', '2016']

years.forEach(year => {
  
})

const options = {
  uri: 'https://www.pro-football-reference.com/years/2016/passing.htm',
  transform: body => cheerio.load(body)
}

rp(options)
  .then(getCareerSummaryUrls)
  .then(createPromiseArray)
  .then(getAllPromises)
  .then(getPlayerUrls)
  .then(createPromiseArray)
  .then(getAllPromises)
  .then(parsePlayerData)
  .then(generateCSV)    
  .catch(err =>  console.log(err))

  
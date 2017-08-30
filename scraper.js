'use strict'
const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')
const json2csv = require('json2csv')
const Promise = require('bluebird')

const rateLimit = 1200

const getCareerSummaryUrls = ($, tableId) => {
  const careerSummaryUrls = []
  $(tableId + ' tbody').children().each((i, el) => {
     careerSummaryUrls.push($(el).find('td').find('a').attr('href'))
  })
  return careerSummaryUrls.filter(item => item)
}

// const createPromiseArray = (urls) => {
//   return urls    
//     // .slice(0, 2)
//     .map((url, i) => {
//       const options = {
//         uri: 'https://www.pro-football-reference.com' + url,
//         transform: body => cheerio.load(body)
//       }
//       return Promise.delay(i * rateLimit).then(() => {
//         console.log('sending request', url)
//         return rp(options)
//       })
//     }) 
// }

const getPlayerDataByYear = (careerSummaryUrls) => {
  return careerSummaryUrls.map(url => {
    const options = {
      uri: 'https://www.pro-football-reference.com' + url,
      transform: body => cheerio.load(body)
    }
    return rp(options)
      .then(player => {
        const playerStatUrls = []
        urls.forEach($ => {  
          const regex = new RegExp(year)
          if (year === 2014){
            const link = $('#inner_nav').find('.hasmore').first().find('li').last().prev().prev().find('a').attr('href')
            if (regex.test(link)) playerStatUrls.push(link)
          } else if (year === 2015){
            const link = $('#inner_nav').find('.hasmore').first().find('li').last().prev().find('a').attr('href')
            if (regex.test(link)) playerStatUrls.push(link)
          } else {
            const link = $('#inner_nav').find('.hasmore').first().find('li').last().find('a').attr('href')
            if (regex.test(link)) playerStatUrls.push(link)
          }
        })
        return playerStatUrls
      })
  })
}

// const getPlayerDataUrls = (urls, year) => {
//   return urls.map($ => {
//     const regex = new RegExp(year)
//     if (year === 2014){
//       const link = $('#inner_nav').find('.hasmore').first().find('li').last().prev().prev().find('a').attr('href')
//       if (regex.test(link)) return link
//     } else if (year === 2015){
//       const link = $('#inner_nav').find('.hasmore').first().find('li').last().prev().find('a').attr('href')
//       if (regex.test(link)) return link
//     } else {
//       const link = $('#inner_nav').find('.hasmore').first().find('li').last().find('a').attr('href')
//       if (regex.test(link)) return link
//     }
//   }).filter(item => item)
// }




const getAllPromises = (promises) => Promise.all(promises)

// This function needs to be optimized

const getPlayerUrls = (careerSummary, year) => {
  return careerSummary.map($ => {
    const regex = new RegExp(year)
    if (year === 2014){
      const link = $('#inner_nav').find('.hasmore').first().find('li').last().prev().prev().find('a').attr('href')
      if (regex.test(link)) return link
    } else if (year === 2015){
      const link = $('#inner_nav').find('.hasmore').first().find('li').last().prev().find('a').attr('href')
      if (regex.test(link)) return link
    } else {
      const link = $('#inner_nav').find('.hasmore').first().find('li').last().find('a').attr('href')
      if (regex.test(link)) return link
    }
  }).filter(item => item)
}

const parsePlayerData = (playerData, tableId) => {
  const allGameData = []
  playerData.forEach($ => {
    $('#stats tbody').children().each((i, row) => {
      const playerName = $('#meta h1').text()
      const gameData = {}
      gameData.playerName = playerName
      $(row).children().each((i, stat) => {
        // Some of the data is nested inside of an anchor tag. This detects 
        // if that is the case
        if ($(stat).children().length > 0){
          gameData[$(stat).data('stat')] = $(stat).find('a').text()
        } else {
          gameData[$(stat).data('stat')] = $(stat).text()
        }
      })
      allGameData.push(gameData)
    })
  })
  return allGameData
}

const generateCSV = (data, year, position) => {
  fs.writeFileSync(year + '-' + position + '.csv', 
    json2csv({
      data: data, 
      fields: Object.getOwnPropertyNames(data[0])
    }))
}

const getYearlyData = (startingYear, position, tableId) => {
  if (startingYear > 2014) return
  const options = {
    uri: 'https://www.pro-football-reference.com/years/' + startingYear + '/' + position +'.htm',
    transform: body => cheerio.load(body)
  }

  return rp(options)
    .then(urls => getCareerSummaryUrls(urls, tableId))
    .then(createPromiseArray)
    .then(getAllPromises)
    .then(careerSummary => getPlayerUrls(careerSummary, startingYear))
    .then(createPromiseArray)
    .then(getAllPromises)
    .then(parsePlayerData)
    .then(data => generateCSV(data, startingYear, position))
    .then(() => getYearlyData(startingYear + 1, position, tableId))    
    .catch(err =>  {
      throw err
    })

}

const passingTableId = '#passing'
const rushingTableId = '#rushing_and_receiving'
const receivingTableId = '#receiving'
const defenseTableId = '#defense'

// getYearlyData(2014, 'passing', passingTableId)
//   .then(() => getYearlyData(2014, 'rushing', rushingTableId))
//   .then(() => getYearlyData(2014, 'receiving', receivingTableId))
//   .then(() => getYearlyData(2014, 'defense', defenseTableId))

getYearlyData(2014, 'defense', defenseTableId)

  






  
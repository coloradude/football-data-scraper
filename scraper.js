'use strict'
const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')
const json2csv = require('json2csv')
const Promise = require('bluebird')

const year = '2016'

const options = {
  uri: 'https://www.pro-football-reference.com/years/2016/passing.htm',
  transform: body => cheerio.load(body)
}

// Grabbing initial list of all player urls

rp(options)
  .then($ => {
    
    const careerSummaryUrls = []

    // Grabbing href's and passing them into array

    $('#passing tbody').children().each((i, el) => {
       careerSummaryUrls.push($(el).find('td').find('a').attr('href'))
    })

    // Pro-football-reference.com blocks your ip address if you make
    // too many requests too quickly. Their robots.txt asks you to
    // wait at least 3 seconds per page so thats what we are doing here

    let timeout = -3000
    const rateLimit = 3000

    // This is generating an array of time delayed promises and passing it
    // to the next promise

    return careerSummaryUrls
      // We have to filter because some of the rows dont contain any info
      .filter(item => item)
      // .slice(0, 2)
      .map(url => {
        const options = {
          uri: 'https://www.pro-football-reference.com' + url,
          transform: body => cheerio.load(body)
        }
        timeout = timeout + rateLimit
        return Promise.delay(timeout).then(() => rp(options))
      })    

  })

  // Here we pull in all the markup from each of the player pages. This passes
  // a massive array of markup to the next promise so we can parse each page
  // to find the url specificall for the 2016 seasion

  .then(playerPromises => Promise.all(playerPromises))
  .then(playersPages => {

    // Grabbing the 2016 overall performance URL. Will eventually 
    // modify this to grab the last three years instead

    return playersPages.map($ => {

      // Nasty DOM traversal since they dont give classes or ids or 
      // any unique attributes to stuff

      return $('#inner_nav').find('.hasmore').first().find('li').last().find('a').attr('href')
    })
  })
  .then(playerUrls => {

    // Generating another set of rate limited promises to grab the 
    // markup from each players 2016 stats

    let timeout = -3000
    const rateLimit = 3000

    return playerUrls
      // .slice(0, 2)
      .map(url => {
        const options = {
          uri: 'https://www.pro-football-reference.com' + url,
          transform: body => cheerio.load(body)
        }
        timeout = timeout + rateLimit
        return Promise.delay(timeout).then(() => rp(options))
      }) 

  })

  .then(seasonPromises => Promise.all(seasonPromises))
  .then(seasonMarkup => {

    const allGameData = []

    // Here we are parsing the season stats table and flattening it out. In the
    // end we want a csv with every game played by every player, one to each row.

    seasonMarkup.forEach($ => {
      $('#stats tbody').children().each((i, row) => {
        const playerName = $('#meta h1').text()
        const gameData = {}
        $(row).children().each((i, stat) => {
          if ($(stat).children().length > 0){
            gameData[$(stat).data('stat')] = $(stat).find('a').text()
          } else {
            gameData[$(stat).data('stat')] = $(stat).text()
          }
          gameData.playerName = playerName
        })
        allGameData.push(gameData)
      })
    })

    // Then we let json2csv take care of creating our csv file

    fs.writeFileSync('2016-passing.csv', 
      json2csv({
        data: allGameData, 
        fields: Object.getOwnPropertyNames(allGameData[0])
      }))

  })    
  .catch(function (err) {
    throw new Error(err)
  })

  
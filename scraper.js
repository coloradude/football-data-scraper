'use strict'
const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')
const json2csv = require('json2csv')
const Promise = require('bluebird')

const year = '2016'

const options = {
  uri: 'https://www.pro-football-reference.com/years/2016/passing.htm',
  transform: function (body) {
    return cheerio.load(body);
  }
}

const urls = []
 
rp(options)
  .then($ => {

    $('#passing tbody').children().each((i, el) => {
       urls.push($(el).find('td').find('a').attr('href'))
    })

    let timeout = -3000
    const rateLimit = 3000

    return urls
      .filter(item => item)
      .slice(0, 10)
      .map(url => {
        const options = {
          uri: 'https://www.pro-football-reference.com' + url,
          transform: body => cheerio.load(body)
        }
        timeout = timeout + rateLimit
        return Promise.delay(timeout).then(() => rp(options))
      })    

  })
  .then(urlPromises => Promise.all(urlPromises))
  .then(players => {
    let data = []

    players.forEach(player => {
      const $ = cheerio.load(player.html())
      const playerName = $('#meta h1').text()

      const $headings = $('#passing thead tr').next('tr')
      const children = $headings.children()

      $('#passing tbody').children().each((i, row) => {
        const gameData = {}
        $(row).children().each((i, stat) => {
          if ($(stat).children().length > 0){
            gameData[$(stat).data('stat')] = $(stat).find('a').text()
          } else {
            gameData[$(stat).data('stat')] = $(stat).text()
          }
        })
        gameData.playerName = playerName
        data.push(gameData)
      })
    })

    fs.writeFileSync('2016-passing.csv', json2csv({data: data, fields: Object.getOwnPropertyNames(data[0])}))
  })
  .catch(function (err) {
    throw new Error(err)
  })

  
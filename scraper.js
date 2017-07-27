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

const data = []
let columns = []
let urls = []
 
rp(options)
  .then($ => {

    $('#passing tbody').children().each((i, el) => {
       urls.push($(el).find('td').find('a').attr('href'))
    })

    let timeout = 0
    const rateLimit = 4000

    return urls.filter(item => item).slice(0, 2)
      .map(url => {
        const options = {
          uri: 'https://www.pro-football-reference.com' + url,
          transform: body => cheerio.load(body)
        }
        timeout = timeout + rateLimit
        return Promise.delay(timeout).then(() => rp(options))
      })    

  }).then(urlPromises => {
    return Promise.all(urlPromises)
  })
  .catch(function (err) {
    throw new Error(err)
  })

  // .then(() => {
  //     urls.map(url => {
        
  //       const options = {
  //         uri: 'https://www.pro-football-reference.com' + url,
  //         transform: (body) => cheerio.load(body)
  //       }

  //       return new Promise(() => {
  //         rp(options)
  //         .then($ => {
  //           const player = $('#meta .media-item h1').text()
  //           console.log(player)
  //           const stats = $('#stats')
            
  //           const $headings = $('#stats thead tr').next('tr')

  //           const children = $headings.children()

  //           columns = []

  //           for (let item in children) {
  //             let th = children[item]
  //             if (th.name === 'th'){
  //               columns.push(th.attribs['data-stat'])
  //             }
  //           }

  //           columns.push('player')

  //           $('#stats tbody').children().each((i, row) => {
  //             const gameData = {}
  //             $(row).children().each((i, stat) => {
  //               if ($(stat).children().length > 0){
  //                 gameData[$(stat).data('stat')] = $(stat).find('a').text()
  //               } else {
  //                 gameData[$(stat).data('stat')] = $(stat).text()
  //               }
  //             })
  //             gameData.player = player
  //             data.push(gameData)
  //             console.log(data)
  //           })

  //           // fs.writeFileSync('2016-passing.csv', json2csv({data: data, fields: columns}))

  //         })
  //         .catch(function (err) {
  //           throw new Error(err)
  //         })
  //       })
  //     })

  //     console.log(urls)

  //     Promise.all(urls)
  //       .then(results => {
  //         console.log(results)
  //       })

// const options = {
//   uri: 'https://www.pro-football-reference.com/players/B/BreeDr00/gamelog/2016/',
//   transform: function (body) {
//       return cheerio.load(body);
//   }
// }
 
// rp(options)
//   .then(function ($) {
//     const stats = $('#stats')
//     const columns = []

//     const $headings = $('#stats thead tr').next('tr')

//     const children = $headings.children()

//     for (let item in children) {
//       let th = children[item]
//       if (th.name === 'th'){
//         columns.push(th.attribs['data-stat'])
//       }
//     }

//     const data = []

//     $('#stats tbody').children().each((i, row) => {
//       const gameData = {}
//       $(row).children().each((i, stat) => {
//         if ($(stat).children().length > 0){
//           gameData[$(stat).data('stat')] = $(stat).find('a').text()
//         } else {
//           gameData[$(stat).data('stat')] = $(stat).text()
//         }
//       })
//       data.push(gameData)
//     })

//     fs.writeFileSync('drew-breese.csv', json2csv({data: data, fields: columns}))

//   })
//   .catch(function (err) {
//     throw new Error(err)
//   })
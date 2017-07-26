'use strict'
const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')
const json2csv = require('json2csv')

const year = '2016'

const options = {
  uri: 'https://www.pro-football-reference.com/years/2016/passing.htm',
  transform: function (body) {
    return cheerio.load(body);
  }
}
 
rp(options)
  .then(function ($) {
    const urls = []

    $('#passing tbody').children().each((i, el) => {
       urls.push($(el).find('td').find('a').attr('href'))
    })
    const filtered = urls.filter(item => {
      return item
    })
    console.log(filtered)
  })
  .catch(function (err) {
    throw new Error(err)
  })

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
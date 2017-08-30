'use strict'
const cheerio = require('cheerio')
const fs = require('fs')
const json2csv = require('json2csv')
const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

const generateCSV = (data, date) => {
  fs.writeFileSync(date + '-rush-directions.csv', 
    json2csv({
      data: data, 
      fields: Object.getOwnPropertyNames(data[0])
    }))
}

nightmare
  // Get the markup from the url
  .goto('https://www.pro-football-reference.com/boxscores/201609080den.htm')
  // Does an interval poll until the desired element shows up
  .wait('#targets_directions tbody')
  // Grabs the desired html and passes it on to the next function
  .evaluate(() => document.querySelector('body').outerHTML)
  // Stops the virtual browser and passes the data onto the next function
  .end(html => html)
  // Extract data from tables
  .then(html => {
    const $ = cheerio.load(html)
    const homeSnapData = []
    const awaySnapData = []

    const date = $('#content h1').text().split('-')[1].trim()

    const $headings = $('#rush_directions').find('thead').children().last()
    const $rushDirectionData = $('#rush_directions tbody')

    const getRushTargetData = ($table, $headings) => {
      const allRushData = []
      const headings = []

      $headings.children().each((i, item) => {
        headings.push($(item).text().trim().replace('\n', ''))
      })

      headings[2] = 'L End-' + headings[2]
      headings[3] = 'L End-' + headings[3]
      headings[4] = 'L End-' + headings[4]
      headings[6] = 'L Tackle-' + headings[5]
      headings[7] = 'L Tackle-' + headings[6]
      headings[8] = 'L Tackle-' + headings[7]
      headings[10] = 'L Guard-' + headings[8]
      headings[11] = 'L Guard-' + headings[9]
      headings[12] = 'L Guard-' + headings[10]
      headings[14] = 'Middle-' + headings[11]
      headings[15] = 'Middle-' + headings[12]
      headings[16] = 'Middle-' + headings[13]
      headings[18] = 'R Guard-' + headings[14]
      headings[19] = 'R Guard-' + headings[15]
      headings[20] = 'R Guard-' + headings[16]
      headings[22] = 'R Tackle-' + headings[17]
      headings[23] = 'R Tackle-' + headings[18]
      headings[24] = 'R Tackle-' + headings[19]
      headings[22] = 'R End-' + headings[20]
      headings[23] = 'R End-' + headings[21]
      headings[24] = 'R End-' + headings[22]


      $table.children().not('.thead').each((i, row) => {
        const playerData = {}
        $(row).children().each((i, item) => {
          if ($(item))
          //Checks to see if data is wrapped in a anchor tag
          if ($(item).children().length > 0){
            playerData[headings[i]] = $(item).find('a').text()
          } else {
            playerData[headings[i]] = $(item).text()
          }
        })
        allRushData.push(playerData)

      })
      // console.log(allRushData)
      generateCSV(allRushData, date)
    }

    getRushTargetData($rushDirectionData, $headings)

  })
  .catch(err => console.log(err))
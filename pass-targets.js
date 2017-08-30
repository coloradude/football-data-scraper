'use strict'
const cheerio = require('cheerio')
const fs = require('fs')
const json2csv = require('json2csv')
const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })


const generateCSV = (data, date, team, place) => {
  fs.writeFileSync(date + '-' + team + '-pass-targets' + place + '.csv', 
    json2csv({
      data: data, 
      fields: Object.getOwnPropertyNames(data[0])
    }))
}


nightmare
  // Get the markup from the url
  .goto('https://www.pro-football-reference.com/boxscores/201609080den.htm')
  // Does an interval poll until the desired element shows up
  .wait('#all_targets_counts tbody')
  // Grabs the desired html and passes it on to the next function
  .evaluate(() => document.querySelector('body').outerHTML)
  // Stops the virtual browser and passes the data onto the next function
  .end(html => html)
  // Extract data from tables
  .then(html => {
    const $ = cheerio.load(html)
    const TargetData = []


    const date = $('#content h1').text().split('-')[1].trim()


    const TargetTable = $('#target_directions tbody')
    const TargetHeadings = $('#target_directions').find('thead').children().last()


    const getTargetData = ($table, $headings, place) => {
      const allTargetData = []
      const headings = []


      $headings.children().each((i, item) => {
        headings.push($(item).text().trim().replace('\n', ''))
      })


      headings[2] = 'Short L-' + headings[2]
      headings[3] = 'Short L-' + headings[3]
      headings[4] = 'Short L-' + headings[4]
      headings[5] = 'Short L-' + headings[5]
      headings[6] = 'Short Mid-' + headings[6]
      headings[7] = 'Short Mid-' + headings[7]
      headings[8] = 'Short Mid-' + headings[8]
      headings[9] = 'Short Mid-' + headings[9]
      headings[10] = 'Short R-' + headings[10]
      headings[11] = 'Short R-' + headings[11]
      headings[12] = 'Short R-' + headings[12]
      headings[13] = 'Short R-' + headings[13]
      headings[14] = 'Deep L-' + headings[14]
      headings[15] = 'Deep L-' + headings[15]
      headings[16] = 'Deep L-' + headings[16]
      headings[17] = 'Deep L-' + headings[17]
      headings[18] = 'Deep Mid-' + headings[18]
      headings[19] = 'Deep Mid-' + headings[19]
      headings[20] = 'Deep Mid-' + headings[20]
      headings[21] = 'Deep Mid-' + headings[21]
      headings[22] = 'Deep R-' + headings[22]
      headings[23] = 'Deep R-' + headings[23]
      headings[24] = 'Deep R-' + headings[24]
      headings[25] = 'Deep R-' + headings[25]



      table.children().each((i, row) => {
        const playerData = {}
        $(row).children().each((i, item) => {
          //Checks to see if data is wrapped in a anchor tag
          if ($(item).children().length > 0){
            playerData[headings[i]] = $(item).find('a').text()
          } else {
            playerData[headings[i]] = $(item).text()
          }
        })

        TargetData.push(playerData)


      })
      generateCSV(TargetData, date)
    }


    getTargetData(TargetTable, TargetHeadings, TargetData)


  })
  .catch(err => console.log(err))
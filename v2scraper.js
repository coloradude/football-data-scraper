'use strict'
const cheerio = require('cheerio')
const fs = require('fs')
const json2csv = require('json2csv')
const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

const generateCSV = (data, date, team, place) => {
  fs.writeFileSync(date + '-' + team + '-snap-counts' + place + '.csv', 
    json2csv({
      data: data, 
      fields: Object.getOwnPropertyNames(data[0])
    }))
}

nightmare
  // Get the markup from the url
  .goto('https://www.pro-football-reference.com/boxscores/201609080den.htm')
  // Does an interval poll until the desired element shows up
  .wait('#vis_snap_counts tbody')
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

    const $homeSnapTable = $('#home_snap_counts tbody')
    const $homeSnapHeadings = $('#home_snap_counts').find('thead').children().last()
    const homeTeam = $('#all_home_snap_counts h2').text().split(' ')[0]
    const $awaySnapTable = $('#vis_snap_counts tbody')
    const $awaySnapHeadings = $('#vis_snap_counts').find('thead').children().last()
    const awayTeam = $('#all_vis_snap_counts h2').text().split(' ')[0]

    const getSnapData = ($table, $headings, team, place) => {
      const allSnapData = []
      const headings = []

      $headings.children().each((i, item) => {
        headings.push($(item).text().trim().replace('\n', ''))
      })

      headings[2] = 'Off-' + headings[2]
      headings[3] = 'Off-' + headings[3]
      headings[4] = 'Def-' + headings[4]
      headings[5] = 'Def-' + headings[5]
      headings[6] = 'St-' + headings[6]
      headings[7] = 'St-' + headings[7]

      $table.children().each((i, row) => {
        const playerData = {}
        $(row).children().each((i, item) => {
          //Checks to see if data is wrapped in a anchor tag
          if ($(item).children().length > 0){
            playerData[headings[i]] = $(item).find('a').text()
          } else {
            playerData[headings[i]] = $(item).text()
          }
        })
        allSnapData.push(playerData)

      })
      console.log(allSnapData)
      generateCSV(allSnapData, date, team, place)
    }

    getSnapData($homeSnapTable, $homeSnapHeadings, homeTeam, '-home')
    getSnapData($awaySnapTable, $awaySnapHeadings, awayTeam, '-away')

  })
  .catch(err => console.log(err))



const puppeteer = require('puppeteer')
const { parseTable } = require('./parseTable')

const getPageData = async (ticker) => {
  const url = `http://financials.morningstar.com/ratios/r.html?ops=clear&t=${ticker}&region=usa&culture=en-US`

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.goto(url)
  await page.waitForSelector('table:nth-of-type(2)', { timeout: 5000 })

  const allTables = (await page.$$('table')) || []
  const tableData = await Promise.all(
    allTables.map(async (table) => {
      const tableHtml = await page.evaluate((node) => node.outerHTML, table)
      return parseTable(tableHtml)
    })
  )

  const result = tableData.reduce((acc, curr) => ({ ...acc, ...curr }), {})
  return result
}

module.exports = { getPageData }

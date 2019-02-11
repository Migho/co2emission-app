const Papa = require('papaparse')
const StreamZip = require('node-stream-zip');
const download = require('download-file')

const jsonData = {}

exports.process = (dataSource, name) => {
  // ### ZIP DOWNLOAD ###
  const fileName = name.concat('.zip')
  download(dataSource, { filename: fileName }, (dErr) => {
    if (dErr) {
      console.log(`ERROR: cannot download data ${name}: ${dErr}`)
      return false // Comment this out in order to use pre-loaded data
    }
    console.log(`${fileName} downloaded!`)
    // ### ZIP EXTRACTION ###
    const zip = new StreamZip({
      file: fileName,
      storeEntries: true,
    });
    zip.on('error', (zErr) => {
      console.log(`ERROR: error when extracting the data: ${console.log(zErr)}`)
      return false
    })
    zip.on('ready', () => {
      const dataFileNames = Object.values(zip.entries()).filter(file => !file.name.includes("Metadata"))
      if ((dataFileNames.length === 0)) {
        console.log('ERROR: no proper files found.')
        return false
      } if (dataFileNames.length > 1) {
        console.log(`WARN: found ${dataFileNames.length} matching data files. Using the one ${dataFileNames[0].name}`)
      }
      // ### CSV PARSE ###
      console.log(`Converting file ${dataFileNames[0].name}`)
      let rawData = zip.entryDataSync(dataFileNames[0].name).toString('utf8')
      rawData = rawData.split('\r\n').slice(4).join('\r\n') // Remove first unnecessary lines so csv parser can use the first line as header
      jsonData[name] = Papa.parse(rawData, { header: true, dynamicTyping: true, skipEmptyLines: true }).data
      const header = Object.keys(jsonData[name][0])
      header.pop() // there is always last empty column in this dataset.
      const startingYear = header.reduce((acc, cur) => (Number.isNaN(Number(cur)) ? acc : Math.min(acc, cur)))
      const endingYear = header.reduce((acc, cur) => (Number.isNaN(Number(cur)) ? acc : Math.max(acc, cur)))
      for (const key of Object.values(jsonData[name])) {
        delete key[''] // Delete the empty element
        const values = []
        for (let year = startingYear; year <= endingYear; year++) {
          values.push(key[year])
        }
        key.array = {
          startingYear: startingYear,
          endingYear: endingYear,
          values: values,
        }
      }
      console.log(`${dataFileNames[0].name} convertion done!`)
      return true
    });
    return true
  })
}

exports.data = jsonData

const Papa = require('papaparse')
const StreamZip = require('node-stream-zip');
var download = require('download-file')

var jsonData = {}

exports.process = function (dataSource, name) {
    // ZIP DOWNLOAD
    const fileName = name.concat(".zip")
    download(dataSource, { filename: fileName }, function(err){
        if (err) throw err
        console.log(`${fileName} downloaded!`)
        // ZIP EXTRACTION
        const zip = new StreamZip({
            file: fileName,
            storeEntries: true
        });
        zip.on('error', err => {
            `ERROR: error when extracting the data: ${console.log(err)}`
        })
        zip.on('ready', () => {
            const dataFileNames = Object.values(zip.entries()).filter(file => !file.name.includes("Metadata"))
            if ((dataFileNames.length === 0)) {
                console.log(`ERROR: no proper files found.`)
                return this
            } else if (dataFileNames.length > 1) {
                console.log(`WARN: found ${dataFileNames.length} matching data files. Using the one ${dataFileNames[0].name}`)
            }
            // CSV PARSE
            console.log(`Converting file ${dataFileNames[0].name}`)
            let rawData = zip.entryDataSync(dataFileNames[0].name).toString('utf8')
            rawData = rawData.split('\r\n').slice(4).join(`\r\n`) // Remove first unnecessary lines so csv parser can use the first line as header
            jsonData[name] = Papa.parse(rawData, { header: true, dynamicTyping: true , skipEmptyLines: true }).data
            console.log(`${dataFileNames[0].name} convertion done!`)
        });
    })
    return this
}

exports.data = jsonData

// imports
const logger = require('./logger')
const fs = require('fs');
const path = require('path');

const initialReportState = {
  filesChanged: {
    /** key value where key is file that we updated
      {
        linksUpdated: [ // array of objects with name and id
        ],
        undefinedLinks: new Set() // Set of string, have to conver to array before finishing though to print
      }
    */
  },
  undefinedLinks: new Set()
}


let relink = {
    linkRegex: /\[\[(\d{14})\]\]/g,
    IdRegex: /ID\s*:\s*(\d{14})/g,
    fileCount: 0,
    linkMapName: './linkMap.json',
    linkMapJSON: {},
    report: initialReportState, // note if you plan to reuse please create a clone
    /**
     * recursively go through all our directories and update the numeric ID link to file names to work in obsidian
     * 
     * @param {String} rootPath 
     */
    link(rootPath) {
        console.time('Updating links')
        logger.log('Running the links step ------')

        // make sure the file exists
        if (!(fs.existsSync(this.linkMapName))) {
          throw new Error('No link map, created please run previous step "build"')
        }

        // read the linkMap
        this.linkMapJSON = JSON.parse(fs.readFileSync(this.linkMapName, 'utf8')).idToFile

        this.readDirectory(rootPath)

        // write the json to a file
        this.report.undefinedLinks = Array.from(this.report.undefinedLinks)
        let jsonContent = JSON.stringify(this.report, null, 2);
        logger.info("Writing link report to the sytem ------")
        fs.writeFileSync('linkReport.json', jsonContent);

        logger.log('Number of relinked md files: ' + this.fileCount)
        console.timeEnd('Updating links')
    },
    /**
     * Recursively search for and remap the id to file name
     * @param {String} directory the directory we are searching files for
     */
    readDirectory(directory) {
      
        const files = fs.readdirSync(directory);
  
        files.forEach((file) => {
          const filePath = path.join(directory, file)
          const stat = fs.statSync(filePath)
  


          // recursively call the directories
          if (stat.isDirectory()) {
            this.readDirectory(filePath)
          } 
          
          // we only care about the .md files
          else if (file.endsWith(".md")) {
            const data = fs.readFileSync(filePath, 'utf8')
            logger.log("-------------------------")
            logger.log('Relinking the file: ' + file)
            const newData = this.relinkIDs(data, file)

            if (newData) {
              this.fileCount++
              fs.writeFileSync(filePath, newData);
            } else {
              logger.log('Nothing to update on files: ' + file)
            }
          }
        });
      },
      /**
       * Using a regex replace the id with the corresponding file name
       * @param {String} data file content
       */
      relinkIDs(data, file) {
        let fileReport = {
          linksUpdated : []
        }

        let updated = false

        // remove the no longer useful, ID: 02321321839298
        const oldData = data
        data = data.replaceAll(this.IdRegex, '')
        if (oldData !== data) {
          updated = true
        }
        

        // matchall returns an iterator and only the matched capture groups
        const matches = [...data.matchAll(this.linkRegex)]
        if(matches && matches.length >= 1) {

          // loop through and only add the unique values
          const uniqueMatches = new Set();
          for (const match of matches) {
            uniqueMatches.add(match[1])
          }

          // loop through and update the text
          uniqueMatches.forEach((matchedID)=> {
            const linkedFileName = this.linkMapJSON[matchedID]
             
             // no corresponding file to match
             if (!linkedFileName) {
              logger.disaster(matchedID)
              this.report.undefinedLinks.add(matchedID)
             } else {
              logger.info(matchedID)
              fileReport.linksUpdated.push({
                id: matchedID,
                file: linkedFileName
              })
              
              // replacing the id to the file name HERE
              data = data.replaceAll(matchedID, linkedFileName.slice(0,-3))
             }
          })

          // add to the report
          this.report[file] = fileReport
          
          // only if there is a match do we return the data
          this.fileCount++;
          updated = true
        }

        return updated ? data : false
        
      }
}

// export the file out
module.exports = relink
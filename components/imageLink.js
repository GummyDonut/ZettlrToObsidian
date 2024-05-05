
// imports
const logger = require('./logger')
const fs = require('fs');
const path = require('path');


let relink = {
    IdRegex: /!\[.*\]\((\.\/.*)\)/g,
    fileCount: 0,
 
    /**
     * recursively go through all our directories and update the numeric ID link to file names to work in obsidian
     * 
     * @param {String} rootPath 
     */
    link(rootPath) {
        console.time('Updating links')
        logger.log('Running the links step ------')


        this.readDirectory(rootPath)


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


        // matchall returns an iterator and only the matched capture groups
        const matches = [...data.matchAll(this.IdRegex)]
        if(matches && matches.length >= 1) {

          // loop through and only add the unique values
          const uniqueMatches = new Set();
          for (const match of matches) {
            uniqueMatches.add(match[1])
          }

          // loop through and update the text
          uniqueMatches.forEach((matchedID)=> {
             
              logger.info('Updating id: ' + matchedID.slice(2)) 
              
              // replacing the id to the file name HERE
              data = data.replaceAll(matchedID, matchedID.slice(2))
              
          })

          return data
        }

        // no updates
        return false
      }
}

// export the file out
module.exports = relink
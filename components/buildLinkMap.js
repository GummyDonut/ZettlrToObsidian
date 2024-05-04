// imports
const logger = require('./logger')
const fs = require('fs');
const path = require('path');

const initialMapState = {
  idToFile: {

  },
  noIDs: [],
  conflicts: []
}

const buildLinkMap = {
    IdRegex: /ID\s*:\s*(\d{14})/,
    fileCount: 0,
    builtMap: initialMapState, // note if you reuse please create a clone
  /**
   * Read all the .md files and grab the ID's and associate to a file name
   * @param {String} rootPath The rootPath we want to read all our directorys from
   */
    build (rootPath) {
        console.time('Build Link Map')
        logger.log('Running the build link step ------')

        this.readDirectory(rootPath)

        // write the json to a file
        let jsonContent = JSON.stringify(this.builtMap, null, 2);
        logger.info("writing map file to system ------")
        fs.writeFileSync('linkMap.json', jsonContent);

        logger.log('Number of processed md files: ' + this.fileCount)
        console.timeEnd('Build Link Map')

    },
    /**
     * Recursively search for .md files and perform the regex
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
        else if (file.endsWith(".md")){
          this.fileCount++
          const data = fs.readFileSync(filePath, 'utf8')
          logger.log("-------------------------")
          logger.log('Processing the file: ' + file)
          const fileID = this.getIDFromFile(data);
          if (!fileID) {
            this.builtMap.noIDs.push(file)
          } else if(this.builtMap.idToFile[fileID]) {
            // file already exists
            this.builtMap.conflicts.push({
              name: file,
              id: fileID,
              conflictsWith: this.builtMap.idToFile[fileID]
            })
          } else {
            this.builtMap.idToFile[fileID] = file
          }
          logger.info('ID: ' + fileID)
        }
      });
    },
    /**
     * Use a regex and pull and id from the file
     * @param {String} data file content in utf-8 string format
     * @returns 
     */
    getIDFromFile(data) {
      const match = data.match(this.IdRegex)
      if(!match) {
        return false // no match
      } else if(match.length >= 2) {
        return match[1] // get the capture group which should be the id
      } 

      // failed to match
      return false
  
    }
}


module.exports = buildLinkMap
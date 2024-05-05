const logger = require('./logger')
const fs = require('fs');
const path = require('path');

let imageMove = {
    report: {

    },
    fileCount: 0,
    /**
   * Read all the image files and place them under an imgs folder
   * @param {String} rootPath The rootPath we want to read all our directorys from
   */
    move (rootPath) {
        console.time('Build Link Map')
        logger.log('Running the build link step ------')

        this.readDirectory(rootPath)


        logger.log('Number of processed image files: ' + this.fileCount)
        console.timeEnd('Build Link Map')

    },
    /**
     * Recursively search for and move the images to new location, note we ignore the image directory
     * @param {String} directory the directory we are searching files for
     */
    readDirectory(directory) {
      
        const files = fs.readdirSync(directory);
  
        files.forEach((file) => {
          const filePath = path.join(directory, file)
          const stat = fs.statSync(filePath)
  


          // recursively call the directories
          if (stat.isDirectory() && file != 'imgs' && file != ".git") {
            logger.info("entering file: " + file)
            this.readDirectory(filePath)
          } 
          
          // we only care about the .md files
          else if (file.endsWith(".png")) {
            this.fileCount++
            logger.log('Moving:' + filePath + "----------------")
            const imgsPath = directory + "\\imgs\\"
            const newPath = imgsPath + file
            logger.info('To: ' + newPath)

            // if directoru does not exist
            if (!fs.existsSync(imgsPath)) {
                // If it doesn't exist, create the directory
                fs.mkdirSync(imgsPath);
              
                logger.log(`Directory '${imgsPath}' created.`);
            } else {
                logger.log(`Directory '${imgsPath}' already exists.`);
            }

            // moving the file to new location
            fs.renameSync(filePath, newPath)
          }
        });
      },
}

module.exports = imageMove
// our depdendencies
const logger = require('./components/logger')
const chalk = require("chalk"); 
const buildLinkMap = require('./components/buildLinkMap')
const reLink = require('./components/relink')
const imageMove = require('./components/imageMove')
const imageLink = require('./components/imageLink')

// setup our command line options
const optionDefinitions = [
  { name: 'path', alias: 'p', type: String, defaultOption: true }, // does not need the param indicator normally
  { name: 'debug', alias: 'd', type: Boolean },
  { name: 'step', alias: 's', type: String }
]

// set
const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)

// debug
if (options.debug) {
	console.log("These are the options you ran:")
	console.log(options)
}

// check if these values are missing they are mandatory
let errorInArgs = false;
if (!options.path) {
  logger.error('Missing ' +  chalk.white('path')  +' arguement!')
  errorInArgs = true;
}

if (!options.step) {
  logger.error('Missing ' +  chalk.white('step')  +' arguement!')
  errorInArgs = true;
}



// based on the step we must run the following execution
switch (options.step) {
  case 'build':
    try {
      buildLinkMap.build(options.path)
    } catch(err) {
      logger.error('Error in build process: ----------')
      logger.printErrorStackTrace(err)
    }
    break;
  case 'relink':
    try {
      reLink.link(options.path)
    } catch(err) {
      logger.error('Error in relink process: ----------')
      logger.printErrorStackTrace(err)
    }
    break;
  case 'imagemove':
    try {
      imageMove.move(options.path)
    } catch(err) {
      logger.error('Error in image move process: ----------')
      logger.printErrorStackTrace(err)
    }
    break;
  case 'imagelink':
    try {
      imageLink.link(options.path)
    } catch(err) {
      logger.error('Error in image move process: ----------')
      logger.printErrorStackTrace(err)
    }
    break;
  default:
    errorInArgs = true;
    logger.error(options.step + " is an invalid step")
}

// exit with non-zero error code
if (errorInArgs) {
  logger.disaster('ERROR IN EXECUTION')
  process.exit(1)
}

// successfully ran the convert
logger.log(options.step + " step complete ------")
process.exit()


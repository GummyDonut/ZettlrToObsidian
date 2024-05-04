// our imports
const chalk = require("chalk"); 


let logger = {
    disaster(message) {
        console.log(chalk.bgRed(message))
    },
    /**
     * Log the error message
     * @param {String} message the message we want to output
     */
    error (message) {
        console.log(chalk.red(message))
    },
    /**
     * Log the message, usually of info status level
     * @param {String} message the message we want to output
     */
    log(message) {
        console.log(message)
    },
    info(message) {
        console.log(chalk.bgBlue(message))
    },
    printErrorStackTrace(err) {
        console.log("stack", err.stack);
    }

}


// nodejs export call
module.exports = logger
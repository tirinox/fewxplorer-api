const fs = require('fs').promises

// export function testFile() {
//     fs.writeFile('data/var/test.json', JSON.stringify({
//         test: 245
//     })).then(() => {
//         console.log('sussess')
//     })
// }

const DATA_PATH = process.env.DATA_PATH || '../data/var'

class DB {
    x
}

module.exports = {
    DB
}
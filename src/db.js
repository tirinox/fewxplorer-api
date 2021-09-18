const fs = require('fs').promises

export function testFile() {
    fs.writeFile('data/var/test.json', JSON.stringify({
        test: 245
    })).then(() => {
        console.log('sussess')
    })
}

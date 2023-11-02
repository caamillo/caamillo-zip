const { unzip, zip } = require('../main.js')
const fs = require('fs')

const runZipExample = (path, start=5, json=false) => {
    let example = fs.readFileSync(path, 'utf-8')
    if (json) example = JSON.stringify(JSON.parse(example)) // Minify JSON
    return [example, zip(example, start)]
}
/*
// Example Zip

const [ example, zipped ] = runZipExample('./examples/unzipped/test.txt', 5, false)

console.log('Zipped length:', zipped.raw.length)
console.log('Example length:', example.length)
console.log(zipped.raw)
*/

/*
// Example Unzip

const example = fs.readFileSync('./examples/zipped/test.czip', 'utf-8')
const unzipped = unzip(example, '', raw=true)

console.log(unzipped)
*/
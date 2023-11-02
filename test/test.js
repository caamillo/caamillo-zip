const { unzip, zip } = require('../main.js')
const fs = require('fs')

// Example Zip

const exampleName = 'test2.json'
const example = JSON.stringify(JSON.parse(fs.readFileSync(`./examples/unzipped/${ exampleName }`, 'utf-8')))
const zipped = zip(JSON.stringify(JSON.parse(example)), 7)
// const unzipped = unzip(zipped.raw, '', true)
console.log('Zipped length:', zipped.raw.length)
console.log('Example length:', example.length)
console.log(zipped.raw)
// console.log(unzipped)
// fs.writeFileSync(`./examples/zipped/${ exampleName }.cz`, zipped.raw)


/*
// Example Unzip

const example = fs.readFileSync('./examples/zipped/test.cz', 'utf-8')
const unzipped = unzip(example, '', raw=true)

console.log({
    zipped: example.length,
    unzipped: unzipped.length
})
*/
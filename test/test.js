const { unzip, zip } = require('../main.js')
const fs = require('fs')

// Example Zip

const exampleName = 'test3'
const example = fs.readFileSync(`./examples/unzipped/${ exampleName }.min.json`, 'utf-8')
const zipped = zip(example)
// const unzipped = unzip(zipped.raw, '', true)
console.log(zipped.s)
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
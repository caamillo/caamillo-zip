const { unzip, zip } = require('../main.js')
const fs = require('fs')

// Example Zip

// const exampleName = 'test4'
// const example = fs.readFileSync(`./examples/unzipped/${ exampleName }.min.json`, 'utf-8')
const zipped = zip('ciao 123 come va iop sono un ragazzo molto brvo ciao , cdavvero ciao davvero! dico amico!')
const unzipped = unzip(zipped.raw, '', true)
console.log(zipped.raw)
console.log(unzipped)
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
const test = [ 1 ]
const [ s, m ] = [ test.slice(0, -1), test.splice(-1) ]
console.log(s, m)
const { replaceAt } = require('./utils')
const { ParseError } = require('./types')

/**
 * @param {string} raw string to parse
 * @returns {Object} zipped string
 * @returns {Object} map 2d decoder
 */
const parse = (raw) => {
    if (typeof raw != 'string') throw new ParseError('Parsing illegal value')
    let [ s, m ] = raw.split('\\\n').map(el => el.split('\n')) // [ zipped, map ]
    // if (s.length < 2) throw new ParseError('Map not found')
    return {
        s: s,
        m: m.map(el => el.split(','))
    }
}

/**
 * @param {string} string-to-zip
 * @returns {string} zipped string
 * @returns {string} map values
 * @returns {string} raw string (zip, map)
 */
const zip = (s, start=3, end=0) => {
    try {
        if (typeof s != 'string') throw new ParseError('Parsing illegal value')
        const records = {}
        const m = []
        console.log('Creating first map...')
        for (let modifier = s.length - (end + 2); modifier >= start; modifier--) {
            const map = {}
            chunkLoop:
            for (let chunk = 0; chunk < s.length - modifier; chunk++) {
                let chunkArr = []
                for (let chunkIdx = 0; chunkIdx < modifier + 1; chunkIdx++) {
                    chunkArr.push(s[chunk + chunkIdx])
                }
                chunkArr = chunkArr.join('')
                for (let _ of Object.keys(map)) {
                    if (_ === chunkArr) {
                        map[_] += 1
                        continue chunkLoop
                    }
                }
                map[chunkArr] = 1
            }
            for (let key of Object.keys(map)) {
                if (map[key] > 1) records[key] = map[key]
            }            
        }
        console.log('Sorting map...')
        const sorted = Object.fromEntries(
            Object.entries(records).sort(([,a],[,b]) => b-a)
        )
        console.log('Ordering map by most used values...')
        for (let keyIdx in Object.keys(sorted)) {
            const key = Object.keys(sorted)[keyIdx]
            if (s.search(key) >= 0) {
                if (!m.length || m[m.length - 1].length >= 10) m.push([ key ])
                else m[m.length - 1].push(key)
                s = s.replaceAll(key, m[m.length - 1].length - 1)
            }
        }
        console.log('Done!')
        return {
            s: s,
            m: m.map(el => el.join(',')).join('\n'),
            raw: [ s, m.map(el => el.join(',')).join('\n') ].join('\\\n')
        }
    } catch(err) {
        console.error(err)
    }
}

/**
 * @param {string} string-to-unzip
 * @param {string} map-to-use (default blank)
 * @returns {string} unzipped string
 */
const unzip = (s, m='', raw=false) => {
    try {
        if (raw) {
            const parsed = parse(s)
            s = parsed.s
            m = parsed.m
        }
        const parsed = [ ...s ]
        console.log(parsed)
        for (let row in s) {
            let modifier = 0
            let escaping = false
            for (let idx in s[row].split('')) {
                idx = parseInt(idx)
                const char = s[row][idx]
                if (!isNaN(char) && !escaping) {
                    if (idx > 0) {
                        if (s[row][idx - 1] === '\\') {
                            escaping = true
                            continue
                        }
                    }
                    const val = m[row][parseInt(char)]
                    parsed[row] = replaceAt(parsed[row], modifier + idx, val)
                    modifier += val.length - 1
                } else if (isNaN(char) && escaping) escaping = false
            }
        }
        return parsed.join('\n')
        // console.log(s)
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    zip,
    unzip,
    parse
}
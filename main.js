const {
    replaceAt,sanitizeDecoded,
    unsanitize, isNumber, removeSpan,
    spliceString, chunkerize
} = require('./utils')
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
        m: m.map(el => el.split(/(?<!\\),/))
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
        s = sanitizeDecoded(s)
        let m = []
        /*
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
        console.log('Zipping string...')
        for (let keyIdx in Object.keys(sorted)) {
            const key = Object.keys(sorted)[keyIdx]
            // console.log(key)
            if (s.indexOf(key) >= 0) {
                if (!m.length || m[m.length - 1].length >= 10) m.push([ sanitizeMap(key) ])
                else m[m.length - 1].push(sanitizeMap(key))
                s = s.replaceAll(key, m[m.length - 1].length - 1)
            }
        }
        console.log('Done!')
        return {
            s: s,
            m: m.map(el => el.join(',')).join('\n'),
            raw: [ s, m.map(el => el.join(',')).join('\n') ].join('\\\n')
        }*/
        let idx = 0
        const resetFound = () => {
            return {
                value: false,
                occurrence: '',
                start: -1
            }
        }
        let found = resetFound()
        const saved = []
        while (idx < s.length) {
            const char = s[idx]
            if (!found.value) {
                if (removeSpan(s, idx, idx + 1).indexOf(char) >= 0) {
                    found.value = true
                    found.start = idx
                    found.occurrence += char
                }
                idx += 1
                continue
            }
            if (removeSpan(s, found.start, found.start + found.occurrence.length + 1).indexOf(found.occurrence + char) >= 0 && idx < s.length - 1) {
                if (!found.value) {
                    found.value = true
                    found.start = idx
                }
                found.occurrence += char
            } else if (found.value) {
                if (found.occurrence.length >= start && !saved.filter(el => el.pattern === found.occurrence).length) saved.push({
                    pattern: found.occurrence,
                    weight: found.occurrence.length * (s.split(found.occurrence).length - 1),
                    start: found.start
                })
                idx = found.start
                found = resetFound()
            }
            idx += 1
            // TODO: create a while to be recursive and also watch of occurs but in reverse mode (1: ciao come stai, 2: ciao come sta, ...) -1 every time
        }
        // First Step
        const sortedByWeight = saved.sort((a, b) => b.weight - a.weight)
        // console.log(sortedByWeight)
        let tempString = s
        for (let save of sortedByWeight) {
            if (tempString.indexOf(save.pattern) >= 0) {
                if (!m.length || m[m.length - 1].length >= 10) m.push([ save ])
                else m[m.length - 1].push(save)
                tempString = tempString.replaceAll(save.pattern, m.length - 1)
            }
        }
        // Second Step
        m = m.sort((a, b) => Math.min(...a.map(el => el.start)) - Math.min(...b.map(el => el.start))).map(el => el.sort((a, b) => a.start - b.start))
        let sortedByOrder = m.map(map => map.map((save) => {
            const saved = []
            let tempString = s
            let modifier = 0
            while (tempString.indexOf(save.pattern) >= 0) {
                saved.push({
                    idx: tempString.indexOf(save.pattern) + modifier,
                    pattern: save.pattern
                })
                tempString = tempString.replace(save.pattern, '')
                modifier += save.pattern.length
            }
            return saved
        })).flat()
        // console.log(sortedByOrder)
        const chunkerized = chunkerize(sortedByOrder)
        for (let chunk in chunkerized) {
            chunk = parseInt(chunk)
            for (let saves in chunkerized[chunk]) {
                saves = parseInt(saves)
                s = s.split('\n').map((row, nrow) => {
                    const idx = `${ nrow !== chunk ? `${ chunk }:` : '' }${ saves }`
                    return row.replaceAll(chunkerized[chunk][saves][0].pattern, () => {
                        if (saves !== 9) return idx
                        return `${ idx }\n`
                    })
                }).join('\n')
                if (saves === 9) {
                    let temp = s.split('\n')
                    temp[temp.length - 1] = temp[temp.length - 1].replaceAll(/(?<!\\)[0-9]/g, el => `${ chunk }:${ el }`)
                    s = temp.join('\n')
                }
            }
        }
        m = m.map(el => el.map(({ pattern }) => pattern)).join('\n')
        return {
            s: s,
            m: m,
            raw: [ s, m ].join('\\\n')
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
        // console.log(parsed)
        for (let row in s) {
            let modifier = 0
            let escaping = false
            for (let idx in s[row].split('')) {
                idx = parseInt(idx)
                const char = s[row][idx]
                if (isNumber(char) && !escaping) {
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
        return unsanitize(parsed.join('\n'))
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
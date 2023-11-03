const {
    sanitize, unsanitize, lastsanitize,
    sanitizemap, unsanitizemap,
    removespan, chunkerize
} = require('./utils')
const { ParseError } = require('./types')

/**
 * @param {string} raw string to parse
 * @returns {Object} zipped string
 * @returns {Object} map 2d decoder
 */
const parse = (raw) => {
    if (typeof raw != 'string') throw new ParseError('Parsing illegal value')
    const parsed = raw.split(/(.*(?<!\\)\\\n)/gs)
    const [ s, m ] = [ parsed.slice(0, -1), parsed.splice(-1) ]
    return {
        s: s.filter(el => el.length > 0 ).join('\n'),
        m: m[0].split('\n').map(el => el.split(/(?<!\\),/))
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
        s = sanitize(s)
        let m = []
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
        process.stdout.write("Mapping all occurrences... ")
        while (idx < s.length) {
            const char = s[idx]
            if (!found.value) {
                if (removespan(s, idx, idx + 1).indexOf(char) >= 0) {
                    found.value = true
                    found.start = idx
                    found.occurrence += char
                }
                idx += 1
                continue
            }
            if (removespan(s, found.start, found.start + found.occurrence.length + 1).indexOf(found.occurrence + char) >= 0 && idx < s.length - 1) {
                if (!found.value) {
                    found.value = true
                    found.start = idx
                }
                found.occurrence += char
            } else if (found.value) {
                if (found.occurrence.length >= start && !saved.filter(el => el.pattern === found.occurrence).length) saved.push({
                    pattern: found.occurrence.slice(-1) === '\\' ? found.occurrence.slice(0, -1) : found.occurrence,
                    weight: (found.occurrence.slice(-1) === '\\' ? found.occurrence.length - 1 : found.occurrence.length) * (s.split(found.occurrence).length - 1),
                    start: found.start
                })
                idx = found.start
                found = resetFound()
            }
            idx += 1
            // TODO: create a while to be recursive and also watch of occurs but in reverse mode (1: ciao come stai, 2: ciao come sta, ...) -1 every time
        }
        process.stdout.write("Ok!\nSorting by weight... ")
        // First Step
        const sortedByWeight = saved.sort((a, b) => b.weight - a.weight)
        let tempString = s
        for (let save of sortedByWeight) {
            if (tempString.indexOf(save.pattern) >= 0) {
                if (!m.length || m[m.length - 1].length >= 10) m.push([ save ])
                else m[m.length - 1].push(save)
                tempString = tempString.replaceAll(save.pattern, m.length - 1)
            }
        }
        process.stdout.write("Ok!\nWriting map... ")
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
        const chunkerized = chunkerize(sortedByOrder)
        let expectedDiff = 0
        let added = 0
        let newline = false
        for (let chunk in chunkerized) {
            chunk = parseInt(chunk)
            for (let saves in chunkerized[chunk]) {
                saves = parseInt(saves)
                const savesArr = chunkerized[chunk][saves]
                const weights = savesArr.reduce((a, { pattern }) => a + pattern.length, 0)
                let unweight = savesArr[0].pattern.length + 1 // idx (climber API) + word length + "," or "\n" used in map
                let temp = s.split(/(?<!\\)(?<!\\\\)\n/).map((row, nrow) => {
                    const idx = nrow !== chunk ? `\\${ chunk }:${ saves }\\` : '' + saves
                    unweight += idx.length
                    return row.replaceAll(savesArr[0].pattern, () => {
                        if (newline) {
                            newline = false
                            return `${ idx }\n`
                        }
                        return idx
                    })
                }).join('\n')
                if (weights > unweight) {
                    s = temp
                    expectedDiff += weights - unweight
                    if (added < 9) added += 1
                    else {
                        newline = true
                        added = 0
                    }
                } else {
                    m = m.map(saves => saves.filter(({ pattern }) => pattern != savesArr[0].pattern))
                    m = m.filter(saves => saves.length > 0)
                }
                if (saves === 9) {
                    let temp = s.split(/(?<!\\)(?<!\\\\)\n/)
                    if (temp.length > 1) {
                        temp[temp.length - 1] = temp[temp.length - 1].replaceAll(/(?<!\\)[0-9]/g, el => `\\${ chunk }:${ el }\\`)
                        s = temp.join('\n')
                    }
                }
            }
        }
        process.stdout.write(`Ok!\nDone! Expected diff: ~ ${ expectedDiff }\n`)
        m = m.map(el => el.map(({ pattern }) => sanitizemap(pattern))).join('\n')
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
const unzip = (s='', m='', raw=false) => {
    try {
        if (raw) {
            const parsed = parse(s)
            s = parsed.s
            m = parsed.m
        }
        s = s.replaceAll(/\\(\d+:[0-9])\\/g, el => {
            const [ row, col ] = el.split(':').map(el => parseInt(el.replace('\\', '')))
            // console.log(row, col, unsanitizemap(m[row][col]))
            return unsanitizemap(m[row][col])
        })
        s = s.replaceAll(/(?<!\\)[0-9]/g, el => {
            return unsanitizemap(m[0][parseInt(el)])
        })
        return unsanitize(s.replaceAll('\n', '')).slice(0, -1)
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    zip, unzip,
    parse
}
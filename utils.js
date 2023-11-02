const sanitize = (s) =>
    s.replaceAll(/\\/g, '\\\\').replaceAll('\n', '\\n').replaceAll(/[0-9]/g, el => `\\${ el }`)

const unsanitize = (s) =>
    s.replaceAll(/\\\\/g, '\\').replaceAll('\\n', '\n').replaceAll(/\\[0-9]/g, el => el.replace('\\', ''))

const sanitizemap = (s) =>
    s.replaceAll(',', '\\,')

const unsanitizemap = (s) =>
    s.replaceAll('\\,', ',')

const removespan = (s, start, end) =>
    s.substring(0, start) + s.substring(end)

const chunkerize = (array, size=10) => {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}

module.exports = {
    sanitize, unsanitize,
    sanitizemap, unsanitizemap,
    removespan, chunkerize
}
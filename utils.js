const replaceAt = (s, idx, char) =>
    s.substring(0, idx) + char + s.substring(idx + 1)

const sanitizeMap = (s) =>
    s.replaceAll(',', '\\,')

const unsanitizeMap = (s) =>
    s.replaceAll('\\,', ',')

const sanitizeDecoded = (s) =>
    s.replaceAll(/\\/g, '\\\\')

const unsanitizeDecoded = (s) =>
    s.replaceAll(/\\[1-9]/g, el => el.replace('\\', ''))

const sanitize = (s) =>
    s.replaceAll(',', '\\,')
    .replaceAll(/\b[0-9]+\b/g, el => `\\${ el }`)

const unsanitize = (s) =>
    s.replaceAll('\\,', ',')
    .replaceAll(/\\[1-9]/g, el => el.replace('\\', ''))

const isNumber = (s) =>
    !isNaN(parseFloat(s)) && isFinite(s)

const removeSpan = (s, start, end) =>
    s.substring(0, start) + s.substring(end)

const chunkerize = (array, size=10) => {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}

const spliceString = (s, start, x) =>
    s.slice(0, start) + x + s.slice(start)

module.exports = {
    replaceAt,
    sanitize,
    unsanitize,
    sanitizeMap,
    unsanitizeMap,
    sanitizeDecoded,
    unsanitizeDecoded,
    isNumber,
    removeSpan,
    chunkerize,
    spliceString
}
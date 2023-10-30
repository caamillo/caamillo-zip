const replaceAt = (s, idx, char) =>
    s.substring(0, idx) + char + s.substring(idx + 1)

module.exports = {
    replaceAt
}
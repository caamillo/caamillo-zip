const spliceString = (s, start, x) =>
    s.slice(0, start) + x + s.slice(start)

console.log(spliceString('ciaociao', 3, 'COSA'))
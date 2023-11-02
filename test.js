const test = '[{"id":"ciao mi chiamo Camillo è sono un ragazzo amante dei femboy. In realtà mi piacciono i peni in faccia","name surname and other kind of stuff i dont want to write right now":"come dicevo, amo i peni e g\nli ani. Ma sopratutto amo leccare i peli tra l ano e lo scroto e poi prendere le palle in bocca come fossero bustine da te"}]'

console.log(test.split(/(?<!\\)(?<!\\\\)\n/))
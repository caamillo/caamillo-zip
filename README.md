## TODO Fixes:
- [ ] sanitize string before getting parsed (doing the needed escape logic ("\,", "\NUM")) and in case of keying that, all keys can be unsanitized except for "\,".
- [ ] when unzipping, split for "," and not for "\,".
- [ ] fix when random backslash are on the way (test3 isnt working)
- [ ] if worth, zip also the map so to create a `map-of-map` (2d -> 3d -> 4d?...)
- [ ] it is slow, try to create more async chunks
- [ ] write it in python and add the possibility to run that in threads (each thread runs a chunk)
- [ ] more engines (overall-best, json-oriented, ...other usecases)
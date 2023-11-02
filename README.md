# camillo-zip
WIP, for now if testing the zipping sucks (zipped file heavier than original one) try playing with start parameter zip(start=5)

## TODO Fixes:
- [x] sanitize string before getting parsed (doing the needed escape logic ("\,", "\NUM")) and in case of keying that, all keys can be unsanitized except for "\,".
- [x] when unzipping, split for "," and not for "\,".
- [x] fix when random backslash are on the way (test3 isnt working)
- [ ] Add recursive mode when big strings (would impact on zip speed)
- [ ] if worth, zip also the map so to create a `map-of-map` (2d -> 3d -> 4d?...)
- [ ] more engines (overall-best, json-oriented, ...other usecases)
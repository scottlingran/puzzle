var Puzzle = require("./puzzle");
var Redeemer = require("./redeemer");
var Async = require("async");

var msg = "yoyoyo nigga"

// Puzzle.generate(msg, 10000, function(err, data) {
//   console.log(data)
// });

// var unspent = {
//   txHash: "bbc589f3b753dd72b972db2741b831ce4c01f99463d9538ba2ed40e434699bd5",
//   index: 0,
//   scriptPubKey: "a820abb297ee7d93bad229ea3397d069b638d6d70fb5b9cf062a2e10779b9cfae64d87",
//   value: 10000
// }

var address = "muS1Lc3ypf8LARnJ7ovLTKccYTDKtZY9kH"
var txHash = "e8dff6b1a983f6e4315a9f757301f0ad77f763c0978dd296cbbb8479b91177e0"
Redeemer.generate(txHash, msg, address, function(err, data) {
  console.log(data)
})

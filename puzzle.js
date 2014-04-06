var Script = require("btc-script");
var Opcode = require('btc-opcode');
var TX = require("btc-transaction");
var sha256 = require('crypto-hashing').sha256;
var Helloblock = require("helloblock-js");
var Keypair = require("./keypair");

var Puzzle = {};
module.exports = Puzzle;

var privKey = "f457f5c3ce39c5041935f047525e3d12d74a7a4ba7321393bf8167a465051b99"
var address = "mpjuaPusdVC5cKvVYCFX94bJX1SNUY8EJo"
var Hashtype = {
  SIGHASH_ALL: 1
}

Puzzle.generate = function(message, value, callback) {
  Helloblock.Addresses.retrieveUnspents({
    addresses: [address]
  }, function(err, data) {
    if (err) return callback(err, null);

    var unspent = data.unspents[0]
    var rawTxHex = Puzzle.buildTx(message, value, unspent)
    callback(null, rawTxHex)
  })
}

Puzzle.buildTx = function(message, value, unspent) {
  var newTx = new TX.Transaction()
  // INPUT
  var input = new TX.TransactionIn({
    sequence: 0xffffffff,
    outpoint: {
      hash: unspent.txHash,
      index: unspent.index
    },
    script: undefined // sign later
  })

  newTx.ins.push(input)

  // OUTPUT
  var output = new TX.TransactionOut({
    value: value.toString(), // why string?
    script: Puzzle.outputScript(message)
  })

  newTx.outs.push(output)

  // Signing
  var keypair = new Keypair(privKey)
  var script = new Script(unspent.scriptPubKey)
  var unsignedTxHash = newTx.hashTransactionForSignature(script, 0, Hashtype.SIGHASH_ALL)
  var signature = keypair.sign(unsignedTxHash)
  signature.push(Hashtype.SIGHASH_ALL);
  var inputScript = Script.createInputScript(signature, keypair.pubkey);
  newTx.ins[0].script = inputScript;

  // Serialize
  var newTxBuffer = new Buffer(newTx.serialize());
  var newTxHex = newTxBuffer.toString('hex');
  return newTxHex;
}

Puzzle.outputScript = function(message) {
  var puzzleScript = new Script();
  var secretBytes = new Buffer(message, "utf8")
  var secretHash = sha256.x2(secretBytes, {
    out: 'bytes'
  });

  puzzleScript.writeOp(Opcode.map.OP_HASH256);
  puzzleScript.writeBytes(secretHash);
  puzzleScript.writeOp(Opcode.map.OP_EQUAL);
  return puzzleScript
}

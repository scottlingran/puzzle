var Script = require("btc-script");
var Opcode = require('btc-opcode');
var TX = require("btc-transaction");
var sha256 = require('crypto-hashing').sha256;
var Helloblock = require("helloblock-js");
var network = network || "testnet"
var _ = require("underscore")

var Hashtype = {
	SIGHASH_ALL: 1
}

var Redeemer = {};
module.exports = Redeemer;

Redeemer.generate = function(txHash, message, address, callback) {
	Helloblock.Transactions.retrieve({
		txHashes: [txHash]
	}, function(err, data) {
		if (err) return callback(err, null);

		var unspent = {
			txHash: data.transactions[0].txHash,
			value: data.transactions[0].outputs[0].value,
			index: data.transactions[0].outputs[0].index,
			scriptPubKey: data.transactions[0].outputs[0].scriptPubKey
		}

		var rawTxHex = Redeemer.buildTx(message, address, unspent)
		callback(null, rawTxHex)
	})
}

Redeemer.buildTx = function(message, address, unspent) {
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
		value: unspent.value.toString(), // why string?
		script: Script.createOutputScript(address, network)
	})

	newTx.outs.push(output)

	// Checking
	var unspentHash = (new Script(unspent.scriptPubKey)).chunks[1]
	var secretBytes = new Buffer(message)
	var secretHash = sha256.x2(secretBytes, {
		out: 'bytes'
	});

	if (_.difference(unspentHash, secretHash).length !== 0) {
		throw "input message does not match OP_HASH160 bytes"
	}

	// Signing
	var msgBuffer = new Buffer(message);
	var inputScript = new Script();
	inputScript.writeBytes(msgBuffer.toJSON())
	newTx.ins[0].script = inputScript;

	// Serialize
	var newTxBuffer = new Buffer(newTx.serialize());
	var newTxHex = newTxBuffer.toString('hex');

	return newTxHex;
}

var ECParams = require('ecurve-names')('secp256k1');
var ECDSA = require('ecdsa');
var BigInteger = require('bigi');

function Keypair(privKey) {
	this.ecdsa = new ECDSA(ECParams);
	this.privKeyBytes = new Buffer(privKey, 'hex');
	this.privKeyInt = BigInteger.fromByteArrayUnsigned(this.privKeyBytes.toJSON());

	var pubPoint = ECParams.getG().multiply(this.privKeyInt);
	this.pubkey = pubPoint.getEncoded(false);
};

Keypair.prototype.sign = function(unsignedTxHash) {
	var signature = this.ecdsa.sign(unsignedTxHash, this.privKeyInt)
	return signature;
}

module.exports = Keypair;

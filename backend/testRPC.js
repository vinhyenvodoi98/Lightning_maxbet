require('dotenv').config();
var fs = require('fs');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('./rpc.proto', {
  keepCase: true
});
const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;

process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
var cert = fs.readFileSync(process.env.LND_CERT_PATH);
var lndCert = Buffer.from(cert, 'utf8');
var sslCreds = grpc.credentials.createSsl(lndCert);

var macaroonCreds = grpc.credentials.createFromMetadataGenerator(function(args, callback) {
  var macaroon = fs.readFileSync(process.env.LND_MACAROON_PATH).toString('hex');
  var metadata = new grpc.Metadata();
  metadata.add('macaroon', macaroon);
  callback(null, metadata);
});

var creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
var lightning = new lnrpc.Lightning(process.env.LND_URL, creds);

// var walletUnlocker = new lnrpc.WalletUnlocker(process.env.LND_URL, sslCreds);

var genSeed = () => {
  return new Promise((resolve, reject) => {
    var request = {
      aezeed_passphrase: '',
      seed_entropy: ''
    };
    walletUnlocker.genSeed(request, function(err, response) {
      console.log(response);
      resolve(response);
    });
  });
};

var getInfo = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.getInfo(request, (err, response) => {
      resolve(response);
    });
  });
};

var newAddress = () => {
  return new Promise((resolve, reject) => {
    var request = {
      type: ''
    };
    lightning.newAddress(request, function(err, response) {
      resolve(response);
    });
  });
};

var walletBalance = () => {
  return new Promise((resolve, reject) => {
    request = {};
    lightning.walletBalance(request, function(err, response) {
      resolve(response);
    });
  });
};

var connectPeer = pub_key => {
  addr = pub_key.split('@');
  return new Promise((resolve, reject) => {
    var request = {
      addr: {
        pubkey: addr[0],
        host: addr[1]
      },
      perm: true
    };
    lightning.connectPeer(request, function(err, response) {
      resolve(response);
    });
  });
};

var listPeers = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.listPeers(request, function(err, response) {
      resolve(response);
    });
  });
};

var disconnectPeer = pub_key => {
  return new Promise((resolve, reject) => {
    var request = {
      pub_key
    };
    lightning.disconnectPeer(request, function(err, response) {
      resolve(response);
    });
  });
};

var openChannel = info => {
  return new Promise((resolve, reject) => {
    console.log(info);
    var request = {
      node_pubkey_string: info.pub_key,
      local_funding_amount: parseInt(info.local_fund),
      push_sat: parseInt(info.push_fund),
      target_conf: 1,
      private: false,
      min_confs: 3,
      spend_unconfirmed: false
    };
    lightning.openChannelSync(request, function(err, response) {
      resolve(response);
    });
  });
};

var channelBalance = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.channelBalance(request, function(err, response) {
      resolve(response);
    });
  });
};

var listChannels = () => {
  return new Promise((resolve, reject) => {
    var request = {
      active_only: true
    };
    lightning.listChannels(request, function(err, response) {
      resolve(response);
    });
  });
};

var addInvoice = amt_paid_sat => {
  return new Promise((resolve, reject) => {
    var request = {
      value: amt_paid_sat,
      amt_paid_sat
    };
    lightning.addInvoice(request, function(err, response) {
      resolve(response);
    });
  });
};

var sendPayment = payment_request => {
  return new Promise((resolve, reject) => {
    var request = {
      // dest: <bytes>,
      // dest_string: <string>,
      // amt: <int64>,
      // payment_hash: <bytes>,
      // payment_hash_string: <string>,
      payment_request: payment_request
      // final_cltv_delta: <int32>,
      // fee_limit: <FeeLimit>,
      // outgoing_chan_id: <uint64>,
      // cltv_limit: <uint32>,
      // dest_tlv: <array DestTlvEntry>,
    };
    lightning.sendPaymentSync(request, function(err, response) {
      resolve(response);
    });
  });
};

var closeChannel = info => {
  return new Promise((resolve, reject) => {
    fund = info.split(':');
    var request = {
      channel_point: {
        funding_txid_str: fund[0],
        output_index: parseInt(fund[1])
      }
    };
    var call = lightning.closeChannel(request);
    call.on('data', function(response) {
      resolve(response);
    });
  });
};

var channalBalance = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.channelBalance(request, function(err, response) {
      resolve(response);
    });
  });
};

var subscribeTransactions = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    var call = lightning.subscribeTransactions(request);
    call.on('data', function(response) {
      // A response was received from the server.
      resolve(response);
    });
    call.on('status', function(status) {
      // The current status of the stream.
    });
    call.on('end', function() {
      // The server has closed the stream.
    });
  });
};

module.exports = {
  genSeed,
  getInfo,
  walletBalance,
  newAddress,
  listPeers,
  connectPeer,
  disconnectPeer,
  listChannels,
  openChannel,
  addInvoice,
  sendPayment,
  channelBalance,
  closeChannel,
  channalBalance,
  subscribeTransactions
};

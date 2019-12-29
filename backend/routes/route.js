const router = require('express').Router();
const rpc = require('../testRPC');
const provably = require('../provably_fair/index');

router.get('/genSeed', async (req, res) => {
  var info = await rpc.genSeed();
  res.json({
    info
  });
});

router.get('/getInfo', async (req, res) => {
  var info = await rpc.getInfo();
  res.json({
    info
  });
});

router.get('/walletBalance', async (req, res) => {
  var balance = await rpc.walletBalance();
  balance.confirmed_balance = BigInt(balance.confirmed_balance).toString();
  balance.total_balance = BigInt(balance.total_balance).toString();
  res.json({
    balance
  });
});

router.get('/listPeers', async (req, res) => {
  var listPeers = await rpc.listPeers();
  res.json({
    listPeers
  });
});

router.post('/connectPeer', async (req, res) => {
  var connectPeer = await rpc.connectPeer(req.body.pub_key);
  res.json({
    connectPeer
  });
});

router.post('/disconnectPeer', async (req, res) => {
  var disconnectPeer = await rpc.disconnectPeer(req.body.pub_key);
  res.json(disconnectPeer);
});

router.get('/listChannels', async (req, res) => {
  var listChannels = await rpc.listChannels(req.body.pub_key);
  if (Object.keys(listChannels).length !== 0)
    listChannels.channels.map(channel => {
      channel.capacity = BigInt(channel.capacity).toString();
      if (channel.local_balance) channel.local_balance = BigInt(channel.local_balance).toString();
      if (channel.remote_balance)
        channel.remote_balance = BigInt(channel.remote_balance).toString();
      channel.commit_fee = BigInt(channel.commit_fee).toString();
    });
  res.json(listChannels);
});

router.post('/openChannel', async (req, res) => {
  var disconnectPeer = await rpc.openChannel(req.body);
  res.json(disconnectPeer);
});

router.post('/closeChannel', async (req, res) => {
  var disconnectPeer = await rpc.closeChannel(req.body.pub_key);
  res.json(disconnectPeer);
});

router.post('/addInvoice', async (req, res) => {
  var addInvoice = await rpc.addInvoice(parseInt(req.body.amt_paid));
  res.json(addInvoice);
});

router.post('/sendPayment', async (req, res) => {
  var sendPayment = await rpc.sendPayment(req.body.payment_request);
  res.json(sendPayment);
});

router.get('/getServerSeed', async (req, res) => {
  var serverSeed = await provably.createServerSeed();
  res.json({
    serverSeed
  });
});

router.post('/luckyNumber', async (req, res) => {
  var luckyNumber = await provably.combinationSeed(
    req.body.serverSeed,
    req.body.clientSeed,
    req.body.nonce
  );
  res.json({
    luckyNumber
  });
});

module.exports = router;

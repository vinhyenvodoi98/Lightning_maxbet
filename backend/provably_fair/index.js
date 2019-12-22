var createServerSeed = () => {
  return new Promise((resolve, reject) => {
    const crypto = require('crypto');
    resolve(crypto.randomBytes(256).toString('hex'));
  });
};

module.exports = {
  createServerSeed
};

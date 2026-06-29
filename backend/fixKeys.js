require('dotenv').config();

const crypto = require('crypto');
const { generateRSAKeyPair, encryptPrivateKey } = require('./src/crypto/keyManager');
const { query } = require('./src/config/database');

async function fixKeys() {
  const institutionId = 'b0000000-0000-4000-8000-000000000001';

  const { publicKey, privateKey } = generateRSAKeyPair();
  const encryptedPrivateKey = encryptPrivateKey(privateKey);
  const fingerprint = crypto
    .createHash('sha256')
    .update(publicKey)
    .digest('hex');

  await query(
    `INSERT INTO institution_keys
      (institution_id, public_key, private_key_encrypted, fingerprint, status)
     VALUES ($1, $2, $3, $4, 'ACTIVE')`,
    [institutionId, publicKey, encryptedPrivateKey, fingerprint]
  );

  console.log('Keys generated and saved successfully.');
}

fixKeys()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
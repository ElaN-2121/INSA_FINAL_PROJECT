const { success, error } = require('../utils/apiResponse');
const {
  demonstrateTamperingAttack,
  demonstrateRogueIssuerAttack,
  demonstrateRevocationBypassAttempt,
} = require('../services/securityDemoService');

const tamperingDemo = async (req, res, next) => {
  try {
    const { credentialId } = req.params;
    if (!credentialId) {
      return error(res, 'credentialId is required', 400);
    }
    const result = await demonstrateTamperingAttack(credentialId);
    return success(res, result, 'Tampering attack demonstration complete');
  } catch (err) {
    next(err);
  }
};

const rogueIssuerDemo = async (req, res, next) => {
  try {
    const result = await demonstrateRogueIssuerAttack();
    return success(res, result, 'Rogue issuer attack demonstration complete');
  } catch (err) {
    next(err);
  }
};

const revocationDemo = async (req, res, next) => {
  try {
    const { credentialId } = req.params;
    if (!credentialId) {
      return error(res, 'credentialId is required', 400);
    }
    const result = await demonstrateRevocationBypassAttempt(credentialId);
    return success(res, result, 'Revocation bypass demonstration complete');
  } catch (err) {
    next(err);
  }
};

module.exports = { tamperingDemo, rogueIssuerDemo, revocationDemo };

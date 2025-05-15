import { issueVC,verifyVC,checkTrustRegistry } from '../services/cheqdService.js';
import { storeVC,retrieveVC } from '../services/ipfsService.js';

const issueVCHandler = async (req, res) => {
  try {
    const { issuerDid, subjectDid, credentialData } = req.body;
    const vc = await issueVC(issuerDid, subjectDid, credentialData);
    const cid = await storeVC(vc);
    res.json({ vc, cid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyVCHandler = async (req, res) => {
  try {
    const { cid } = req.body;
    const vc = await retrieveVC(cid);
    const isValid = await verifyVC(vc);
    const isTrusted = await checkTrustRegistry(vc.issuer.id);
    res.json({ isValid, isTrusted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { issueVCHandler, verifyVCHandler };
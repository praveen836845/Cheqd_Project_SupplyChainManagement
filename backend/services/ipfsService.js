import { create } from 'ipfs-http-client';
import { ipfsApiUrl } from '../config.js';

const ipfs = create({ url: ipfsApiUrl });

const storeVC = async (vc) => {
  const { cid } = await ipfs.add(JSON.stringify(vc));
  return cid.toString();
};

const retrieveVC = async (cid) => {
  const stream = ipfs.cat(cid);
  let data = '';
  for await (const chunk of stream) {
    data += chunk.toString();
  }
  return JSON.parse(data);
};

export { storeVC, retrieveVC };
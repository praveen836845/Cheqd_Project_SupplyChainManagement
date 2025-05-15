import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 5000;
export const cheqdStudioApiUrl = process.env.CHEQD_STUDIO_API_URL || 'https://studio-api.cheqd.net';
export const cheqdApiKey = process.env.CHEQD_API_KEY;
export const ipfsApiUrl = process.env.IPFS_API_URL;
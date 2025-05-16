import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 3000;
export const cheqdStudioApiUrl = process.env.CHEQD_STUDIO_API_URL;
export const cheqdApiKey = process.env.CHEQD_API_KEY;
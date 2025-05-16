import express from 'express';
import cors from 'cors';
import { port } from './config.js';
import { createDIDHandler, verifyDIDHandler, createSubjectDIDHandler, getPotentialRecipients } from './controllers/didController.js';
import { issueVCHandler, verifyVCHandler } from './controllers/vcController.js';
import { getDashboardMetricsHandler } from './controllers/dashboardController.js';
// import { getProductTimeline } from './controllers/productController.js';
import { getProductTimeline,getProductsForUser } from './controllers/productController.js';
import { connectDB } from './config/database.js';

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

app.post('/api/did/create', createDIDHandler);
app.post('/api/did/create-subject', createSubjectDIDHandler);
app.get('/api/did/potential-recipients', getPotentialRecipients);
app.post('/api/verify-did', verifyDIDHandler);
app.post('/api/vc/issue', issueVCHandler);
app.post('/api/vc/verify', verifyVCHandler);
app.get('/api/dashboard/metrics', getDashboardMetricsHandler);
app.get('/api/products/:productId/timeline', getProductTimeline);
app.post('/api/productlist',getProductsForUser);

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
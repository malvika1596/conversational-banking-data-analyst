import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleAnalystQuery } from './controllers/queryController';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main NLP Query Endpoint
app.post('/api/query', handleAnalystQuery);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Conversational Analyst Backend running on port ${port}`);
});
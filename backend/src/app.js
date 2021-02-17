import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv/config.js';

import middlewares from './middlewares.js';
import api from './api/index.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello World'
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;

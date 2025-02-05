import express from 'express';

import bullServerAdapter from './config/bullBoardConfig.js';
import connectDB from './config/dbconfig.js';
import { PORT } from './config/serverConfig.js';
import apiRouter from './routes/apiRoutes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/ui', bullServerAdapter.getRouter());

app.use('/api', apiRouter);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
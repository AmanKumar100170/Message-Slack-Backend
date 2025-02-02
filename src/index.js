import express from 'express';

import connectDB from './config/dbconfig.js';
import { PORT } from './config/serverConfig.js';
import apiRouter from './routes/apiRoutes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

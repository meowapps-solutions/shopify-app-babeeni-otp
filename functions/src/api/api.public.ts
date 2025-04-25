import {onRequest} from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
import verifyRoutes from './public/verify';

const app = express();

app.use(cors({origin: true}));

app.get('/api/public/', async (req, res) => {
  res.send('Hello world!');
});

verifyRoutes(app);

export default onRequest(app);

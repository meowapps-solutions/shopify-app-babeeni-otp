import {onRequest} from 'firebase-functions/v2/https';
import express from 'express';
import verifyRoutes from './public/verify';

const app = express();

app.get('/api/public/', async (req, res) => {
  res.send('Hello world!');
});

verifyRoutes(app);

export default onRequest(app);

import express from 'express';
import morgan from 'morgan';
import { checkDbConnection } from './db/index.js';
import identifyRoute from './routes/identifyRoute.js';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(morgan('common'));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('Use /identify for testing. Use /health for health');
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

await checkDbConnection();

app.use(identifyRoute);

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});

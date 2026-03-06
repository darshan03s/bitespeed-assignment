import express from 'express';
import morgan from 'morgan';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(morgan('common'));

app.get('/', (req, res) => {
  res.status(200).send('Use /identify for testing. Use /health for health');
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});

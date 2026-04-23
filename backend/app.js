import dotenv from "dotenv";
dotenv.config({ path: new URL("./.env", import.meta.url) });

import express from 'express';
import userRoutes from './Routes/userRoutes.js';
import uploadRoutes from './Routes/uploadRoutes.js';
import sessionRoutes from './Routes/sessionRoutes.js';
import pointsRoutes from './Routes/pointsRoutes.js';
import gamificationRoutes from './Routes/gamificationRoutes.js';
import assessmentRoutes from './Routes/assessmentRoutes.js';
import rewardRoutes from './Routes/rewardRoutes.js';
const app = express();
app.use(express.json()); 

const PORT = process.env.PORT || 3000;

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/points', pointsRoutes);
app.use('/api/v1', gamificationRoutes);
app.use('/api/v1', assessmentRoutes);
app.use('/api/v1/rewards', rewardRoutes);

app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
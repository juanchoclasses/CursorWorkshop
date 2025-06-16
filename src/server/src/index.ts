import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Single GET route
app.get('/get', (req: Request, res: Response) => {
  res.json({ 
    message: 'This is to be developed',
    status: 'Under Development',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for all other routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found - only /get is available' });
});

app.listen(PORT, () => {
  console.log(`🚧 Development Server running on port ${PORT}`);
  console.log(`📍 Available at http://localhost:${PORT}/get`);
}); 
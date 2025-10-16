import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createClient } from 'redis';
import 'dotenv/config';

connect(); // MongoDB connect

const app = express();

app.use(cors({
    origin: "https://chatbot-two-red-94.vercel.app",  // frontend URL
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use("/ai",aiRoutes)

app.get('/', (req, res) => {
    res.send('Hello World! yessssss');
});

// Redis Cloud Client
export const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    },
    password: process.env.REDIS_PASSWORD
});

redisClient.on('error', (err) => console.log('Redis error:', err));
redisClient.on('connect', () => console.log('Redis connected'));

await redisClient.connect();  // Connect Redis

export default app;

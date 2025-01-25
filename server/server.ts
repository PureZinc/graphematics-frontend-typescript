import express from 'express';

// Use Routers
import graphTransform from './routes/graphTransform';
import graphs from './routes/graphs';


const app = express();

app.use(express.json());
app.use('/transform', graphTransform);
app.use('/graphs', graphs);

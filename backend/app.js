import 'dotenv/config';
import express, { json } from 'express';
import cors from "cors";
import mongoose from 'mongoose';
import { startScanner } from './scanUpdates.js';
import 'log-timestamp';

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define ContentHashUpdates model
import ContentHashUpdates from './models/ContentHashUpdates.js';

const app = express();
app.use(json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World');
});

// List ContentHashUpdates
app.get('/content-hash-updates', async (req, res) => {
    if (req.query.limit > 100) {
        return res.status(400).json({ message: 'Limit cannot be greater than 100' });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const totalCount = await ContentHashUpdates.countDocuments();
        const updates = await ContentHashUpdates.find()
            .sort({ blockNumber: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            contentHashUpdates: updates,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching content hash updates', error: error.message });
    }
});

// Get a specific ContentHashUpdate by ID
app.get('/content-hash-updates/:id', async (req, res) => {
    try {
        const update = await ContentHashUpdates.findOne({ id: req.params.id });
        if (!update) {
            return res.status(404).json({ message: 'Content hash update not found' });
        }
        res.json(update);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching content hash update', error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    startScanner(); // Start the crawling process
});

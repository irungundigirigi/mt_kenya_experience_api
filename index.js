const express = require('express');
import {v2 as cloudinary} from 'cloudinary';
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');
const multer = require('multer');

const upload = multer({ dest: '/tmp/uploads' })

const app = express();
const PORT = process.env.PORT || 5000;
const CONNECTION_STR = process.env.CONNECTION_STRING;

// PostgreSQL client setup
const client = new Client({
    connectionString: "postgres://default:MmYf5zUr8DBe@ep-wispy-poetry-a4u6reca.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
    ssl: {
        rejectUnauthorized: false,
    },
});

cloudinary.config({
  cloud_name: 'dqio2e4gu',
  api_key: '449669313786964',
  api_secret: 'RcLMVMRxreXhEuCJCySe4g2xXoU'
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Error connecting to PostgreSQL database', err));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const corsOptions = {
    origin: '*'
};
app.use(cors(corsOptions));

app.post('/share', upload.single('image'), async (req, res) => {
    const { email, author, title, body } = req.body;
    const image_file = req.file;

    try {
        const cloudinaryResponse = await cloudinary.uploader.upload(image_file.path);
        const query = 'INSERT INTO posts (email, author, title, body, image_url) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [email,author, title, body];
        const result = await client.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding user to database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/posts', async (req, res) => {
    try {
        // Query to get all posts
        const query = 'SELECT * FROM posts';

        // Execute the query
        const result = await client.query(query);

        // Send the posts as a JSON response
        res.status(200).json(result.rows);
    } catch (error) {
        // Handle errors
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


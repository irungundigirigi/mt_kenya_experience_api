const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;
const CONNECTION_STR = process.env.CONNECTION_STRING;

// PostgreSQL client setup
const client = new Client({
    connectionString: CONNECTION_STR,
    ssl: {
        rejectUnauthorized: false,
    },
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

// POST route to add data to the database
app.post('/signup', async (req, res) => {
    const { fullName, username, email, password } = req.body;

    try {
        const query = 'INSERT INTO users (full_name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [fullName, username, email, password];
        const result = await client.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding user to database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


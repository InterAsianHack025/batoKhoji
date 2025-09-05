require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { createServer } = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
require('dotenv').config(); // Load .env variables


const app = express();
app.use(cors());
app.use(express.json());

//Using HTTP & Socket.IO server
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

// Testing DB connection
pool.connect((err, client, release) => {
    if (err) return console.error("Error connecting to DB", err.stack);
    console.log("Connected to PostgreSQL");
    release();
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



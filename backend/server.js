// server.js
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { createServer } = require("http");
const { Server } = require("socket.io");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// HTTP & Socket.IO server
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
    port: process.env.DB_PORT,
});

// Test DB connection
pool.connect((err, client, release) => {
    if (err) return console.error("Error connecting to DB", err.stack);
    console.log("Connected to PostgreSQL");
    release();
});


const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { createServer } = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const { createTables, seedRouteData } = require("./db_seed");
const { busStops, busRoutes } = require("./bus_routes");

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

// PostgreSQL pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Test DB connection
pool.connect((err, client, release) => {
  if (err) return console.error("Error connecting to DB", err.stack);
  console.log("Connected to PostgreSQL");
  release();
});

// Create tables if not exist on server start
createTables(pool)
  .then(() => {
    console.log("Database tables checked/created.");
    // Seed bus stops and routes after table creation
    return seedRouteData(pool);
  })
  .then(() => console.log("Bus stops and routes seeded."))
  .catch((err) => console.error("Error creating tables or seeding data:", err));

// REST API to get all buses
app.get("/api/buses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM buses");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// REST API to add/update a bus
app.post("/api/buses", async (req, res) => {
  const { bus_number, route, latitude, longitude } = req.body;
  try {
    const existing = await pool.query(
      "SELECT * FROM buses WHERE bus_number=$1",
      [bus_number]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE buses SET route=$1, latitude=$2, longitude=$3 WHERE bus_number=$4",
        [route, latitude, longitude, bus_number]
      );
    } else {
      await pool.query(
        "INSERT INTO buses (bus_number, route, latitude, longitude) VALUES ($1,$2,$3,$4)",
        [bus_number, route, latitude, longitude]
      );
    }
    io.emit("busUpdate", { bus_number, route, latitude, longitude });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// REST API to get all bus stops
app.get("/api/bus-stops", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bus_stops");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// REST API to get all bus routes
app.get("/api/bus-routes", async (req, res) => {
  try {
    const query = `
      SELECT 
        br.id,
        br.route_name,
        br.route_name_nepali,
        br.bus_number,
        br.fare,
        br.estimated_time,
        br.frequency,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', bs.id,
            'name', bs.name,
            'name_nepali', bs.name_nepali,
            'latitude', bs.latitude,
            'longitude', bs.longitude,
            'facilities', bs.facilities,
            'stop_order', rs.stop_order
          ) ORDER BY rs.stop_order
        ) AS stops
      FROM bus_routes br
      LEFT JOIN route_stops rs ON br.id = rs.route_id
      LEFT JOIN bus_stops bs ON rs.stop_id = bs.id
      GROUP BY br.id, br.route_name, br.route_name_nepali, br.bus_number, br.fare, br.estimated_time, br.frequency
      ORDER BY br.id
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// REST API to get route with fallback to ORS
app.post("/api/route", async (req, res) => {
  const { coordinates } = req.body;

  // Validate coordinates
  if (
    !coordinates ||
    !Array.isArray(coordinates) ||
    coordinates.length < 2 ||
    coordinates.some(
      (c) =>
        !Array.isArray(c) ||
        c.length !== 2 ||
        isNaN(parseFloat(c[0])) ||
        isNaN(parseFloat(c[1]))
    )
  ) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid coordinates" });
  }

  try {
    // Normally, you could fetch from DB or cache here if needed
    // For now, we directly fetch route from ORS
    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      { coordinates },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (
      response.data.features &&
      response.data.features.length > 0 &&
      response.data.features[0].geometry.coordinates
    ) {
      return res.json(response.data);
    } else {
      console.warn("ORS returned no route, sending empty polyline");
      return res.json({
        success: true,
        features: [
          {
            geometry: { coordinates: coordinates },
          },
        ],
      });
    }
  } catch (err) {
    console.error("ORS API error:", err.response?.data || err.message || err);
    // Fallback: return straight lines between stops if ORS fails
    return res.json({
      success: true,
      features: [
        {
          geometry: { coordinates: coordinates },
        },
      ],
    });
  }
});

// REST API for chatbot using Gemini
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res
      .status(400)
      .json({ success: false, error: "Message is required" });
  }

  try {
    // Add bus stops and routes context
    const context = `
      Bus Stops: ${JSON.stringify(busStops)}
      Bus Routes: ${JSON.stringify(busRoutes)}
    `;

    const prompt = `You are a helpful bus assistant chatbot for BatoVetiyo, a bus tracking and route planning app.
    Respond to user queries about bus routes, schedules, fares, and general transportation information in Nepal.
    Use the following bus stops and routes data for accurate answers:
    ${context}
    Keep responses friendly, concise, and helpful. If the query is not related to buses or transportation, politely redirect to bus-related topics.

    User message: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, response: text });
  } catch (err) {
    console.error("Gemini API error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate response" });
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Client connected", socket.id);
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

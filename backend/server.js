require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { createServer } = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const { busStops, busRoutes } = require('./bus_routes');
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

// API endpoints
app.get('/api/buses', (req, res) => {
  try {
    const buses = busRoutes.map(route => {
      const stops = route.stops.map(stopId => busStops.find(s => s.id === stopId));
      return {
        id: route.id,
        bus_number: route.busNumber,
        route: route.routeName,
        latitude: stops[0].lat,
        longitude: stops[0].lng,
        stops: stops,
        routeNameNepali: route.routeNameNepali,
        fare: route.fare,
        estimatedTime: route.estimatedTime
      };
    });
    res.json({ success: true, data: buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get buses on a specific route with positions from cached route
app.get('/api/route/:id/buses', async (req, res) => {
  try {
    const routeId = parseInt(req.params.id);
    const route = busRoutes.find(r => r.id === routeId);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    
    const routeCacheKey = `route-${routeId}`;
    let fullRoutePath = routeCoordinates.get(routeCacheKey);
    
    // Initialize route if not cached
    if (!fullRoutePath) {
      fullRoutePath = await initializeRoutePath(routeId);
    }
    
    const stops = route.stops.map(stopId => busStops.find(s => s.id === stopId));
    const buses = [];
    
    if (fullRoutePath && fullRoutePath.length > 0) {
      // Get current bus positions from the movement system
      const busCount = 2 + (routeId % 2); // Consistent with movement system
      
      for (let i = 0; i < busCount; i++) {
        const busId = `${routeId}-${i}`;
        let currentPosition = busPositions.get(busId);
        
        if (!currentPosition) {
          // Initialize bus if not exists (same as movement system)
          const spacing = Math.floor(fullRoutePath.length / busCount);
          const startIndex = i * spacing;
          currentPosition = {
            pathIndex: startIndex,
            direction: 1,
            speed: 0.5 + Math.random() * 1.5
          };
          busPositions.set(busId, currentPosition);
        }
        
        // Get coordinates from cached route using current position
        const currentIndex = Math.floor(currentPosition.pathIndex);
        const nextIndex = Math.min(currentIndex + 1, fullRoutePath.length - 1);
        const currentCoords = fullRoutePath[currentIndex];
        const nextCoords = fullRoutePath[nextIndex];
        
        // Interpolate for smooth positioning
        const progress = currentPosition.pathIndex - currentIndex;
        const lat = currentCoords[0] + (nextCoords[0] - currentCoords[0]) * progress;
        const lng = currentCoords[1] + (nextCoords[1] - currentCoords[1]) * progress;
        
        // Find nearest stop
        let nearestStop = stops[0];
        let minDistance = Infinity;
        
        stops.forEach(stop => {
          const distance = Math.sqrt(
            Math.pow(stop.lat - lat, 2) + Math.pow(stop.lng - lng, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestStop = stop;
          }
        });
        
        // Find next stop based on direction
        const currentStopIndex = stops.findIndex(stop => stop.id === nearestStop.id);
        const nextStopIndex = currentPosition.direction === 1 
          ? Math.min(currentStopIndex + 1, stops.length - 1)
          : Math.max(currentStopIndex - 1, 0);
        const nextStop = stops[nextStopIndex];
        
        const speedKmh = Math.floor(currentPosition.speed * 20 + 15);
        
        buses.push({
          id: busId,
          bus_number: `${route.busNumber}-${String.fromCharCode(65 + i)}`, // 101-A, 101-B, 101-C
          route: route.routeName,
          latitude: lat,
          longitude: lng,
          current_stop: nearestStop.name,
          current_stop_nepali: nearestStop.nameNepali,
          direction: `towards ${nextStop.name}`,
          speed: speedKmh,
          last_update: new Date().toISOString(),
          path_progress: Math.floor((currentPosition.pathIndex / fullRoutePath.length) * 100)
        });
      }
    }
    
    res.json({ success: true, data: buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all bus stops
app.get('/api/bus-stops', (req, res) => {
  try {
    const stopsWithLatLng = busStops.map(stop => ({
      id: stop.id,
      name: stop.name,
      name_nepali: stop.nameNepali,
      latitude: stop.lat,
      longitude: stop.lng
    }));
    res.json({ success: true, data: stopsWithLatLng });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search for routes between two bus stops
app.get('/api/routes/search', (req, res) => {
  try {
    const { from: fromStopId, to: toStopId } = req.query;
    
    if (!fromStopId || !toStopId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both from and to stop IDs are required' 
      });
    }

    const fromId = parseInt(fromStopId);
    const toId = parseInt(toStopId);

    // Find routes that contain both stops
    const matchingRoutes = busRoutes.filter(route => {
      const hasFromStop = route.stops.includes(fromId);
      const hasToStop = route.stops.includes(toId);
      
      if (!hasFromStop || !hasToStop) return false;
      
      // Check if the stops are in the correct order (from before to)
      const fromIndex = route.stops.indexOf(fromId);
      const toIndex = route.stops.indexOf(toId);
      
      return fromIndex < toIndex; // From stop should come before to stop
    });

    if (matchingRoutes.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Convert routes to the expected format with stop details
    const routesWithDetails = matchingRoutes.map(route => {
      const stopsDetails = route.stops.map(stopId => {
        const stop = busStops.find(s => s.id === stopId);
        return {
          id: stop.id,
          name: stop.name,
          name_nepali: stop.nameNepali,
          latitude: stop.lat,
          longitude: stop.lng
        };
      });

      return {
        id: route.id,
        busName: route.routeName,
        busNumber: route.busNumber,
        stops: route.stops,
        stopsDetails: stopsDetails,
        estimatedTime: route.estimatedTime || '30-45',
        fare: route.fare || 25
      };
    });

    res.json({ success: true, data: routesWithDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get route path coordinates for map display
app.get('/api/route/:id/path', async (req, res) => {
  try {
    const routeId = parseInt(req.params.id);
    const routeCacheKey = `route-${routeId}`;
    
    let fullRoutePath = routeCoordinates.get(routeCacheKey);
    
    if (!fullRoutePath) {
      // Initialize route if not cached
      fullRoutePath = await initializeRoutePath(routeId);
    }
    
    if (fullRoutePath && fullRoutePath.length > 0) {
      res.json({ 
        success: true, 
        data: {
          routeId: routeId,
          coordinates: fullRoutePath,
          totalPoints: fullRoutePath.length
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Route path not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Real-time bus updates
const busPositions = new Map(); // Store bus positions for continuity
const routeCoordinates = new Map(); // Cache route coordinates permanently
const routeInitializationPromises = new Map(); // Prevent concurrent route initializations

// Function to get route coordinates from OSM with retry logic
async function getRouteCoordinates(startLat, startLng, endLat, endLng, retryCount = 0) {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  try {
    const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: false
      },
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'BusTrackingApp/1.0'
      }
    });
    
    if (response.data.routes && response.data.routes[0]) {
      return response.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert to [lat, lng]
    }
  } catch (error) {
    console.error(`Error fetching route from OSM (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.message);
    
    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return getRouteCoordinates(startLat, startLng, endLat, endLng, retryCount + 1);
    } else {
      console.error(`Failed to fetch route after ${maxRetries + 1} attempts`);
    }
  }
  return null;
}

// Function to get full route path between all stops (called once per route)
async function getFullRoutePath(stops) {
  const fullPath = [];
  
  for (let i = 0; i < stops.length - 1; i++) {
    const startStop = stops[i];
    const endStop = stops[i + 1];
    const cacheKey = `${startStop.id}-${endStop.id}`;
    
    let segmentCoordinates = routeCoordinates.get(cacheKey);
    
    if (!segmentCoordinates) {
      console.log(`Fetching route segment ${i + 1}/${stops.length - 1}: ${startStop.name} -> ${endStop.name}`);
      segmentCoordinates = await getRouteCoordinates(startStop.lat, startStop.lng, endStop.lat, endStop.lng);
      
      if (segmentCoordinates) {
        routeCoordinates.set(cacheKey, segmentCoordinates);
        console.log(`✅ Cached segment: ${startStop.name} -> ${endStop.name} (${segmentCoordinates.length} points)`);
      } else {
        console.log(`❌ Failed to fetch segment: ${startStop.name} -> ${endStop.name}, using straight line fallback`);
      }
      
      // Small delay between requests to be respectful to the OSM server
      if (i < stops.length - 2) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      console.log(`✅ Using cached segment: ${startStop.name} -> ${endStop.name}`);
    }
    
    if (segmentCoordinates) {
      // Add coordinates but avoid duplicating the connection point
      if (i === 0) {
        fullPath.push(...segmentCoordinates);
      } else {
        fullPath.push(...segmentCoordinates.slice(1));
      }
    } else {
      // Fallback to straight line if OSM fails
      console.log(`📏 Using straight line for segment: ${startStop.name} -> ${endStop.name}`);
      const steps = 20; // More points for smoother movement
      for (let j = 0; j <= steps; j++) {
        const ratio = j / steps;
        const lat = startStop.lat + (endStop.lat - startStop.lat) * ratio;
        const lng = startStop.lng + (endStop.lng - startStop.lng) * ratio;
        fullPath.push([lat, lng]);
      }
    }
  }
  
  return fullPath;
}

// Function to initialize route path (called when first user joins)
async function initializeRoutePath(routeId) {
  const routeCacheKey = `route-${routeId}`;
  let fullRoutePath = routeCoordinates.get(routeCacheKey);
  
  if (!fullRoutePath) {
    // Check if initialization is already in progress
    const existingPromise = routeInitializationPromises.get(routeCacheKey);
    if (existingPromise) {
      console.log(`⏳ Route ${routeId} initialization already in progress, waiting...`);
      return await existingPromise;
    }
    
    // Create initialization promise
    const initPromise = (async () => {
      const route = busRoutes.find(r => r.id === routeId);
      if (route) {
        const stops = route.stops.map(stopId => busStops.find(s => s.id === stopId));
        console.log(`🚍 Initializing route path for route ${routeId}: ${route.routeName}`);
        console.log(`📍 Route has ${stops.length} stops: ${stops.map(s => s.name).join(' -> ')}`);
        
        try {
          fullRoutePath = await getFullRoutePath(stops);
          if (fullRoutePath && fullRoutePath.length > 0) {
            routeCoordinates.set(routeCacheKey, fullRoutePath);
            console.log(`✅ Route ${routeId} cached with ${fullRoutePath.length} coordinates`);
          } else {
            console.error(`❌ Failed to initialize route ${routeId}: No coordinates generated`);
          }
        } catch (error) {
          console.error(`❌ Error initializing route ${routeId}:`, error.message);
          // Create fallback straight-line route
          console.log(`📏 Creating fallback straight-line route for ${routeId}`);
          const fallbackPath = [];
          for (let i = 0; i < stops.length - 1; i++) {
            const startStop = stops[i];
            const endStop = stops[i + 1];
            const steps = 20;
            for (let j = 0; j <= steps; j++) {
              const ratio = j / steps;
              const lat = startStop.lat + (endStop.lat - startStop.lat) * ratio;
              const lng = startStop.lng + (endStop.lng - startStop.lng) * ratio;
              fallbackPath.push([lat, lng]);
            }
          }
          routeCoordinates.set(routeCacheKey, fallbackPath);
          fullRoutePath = fallbackPath;
          console.log(`✅ Fallback route created with ${fallbackPath.length} coordinates`);
        }
      } else {
        console.error(`❌ Route ${routeId} not found in busRoutes`);
      }
      
      // Clean up the promise
      routeInitializationPromises.delete(routeCacheKey);
      return fullRoutePath;
    })();
    
    // Store the promise to prevent concurrent initializations
    routeInitializationPromises.set(routeCacheKey, initPromise);
    return await initPromise;
  } else {
    console.log(`✅ Using cached route ${routeId} (${fullRoutePath.length} coordinates)`);
  }
  
  return fullRoutePath;
}

// Store active route subscriptions
const activeRouteSubscriptions = new Set();

// Function to update bus positions for a specific route
function updateBusesForRoute(routeId) {
  const routeCacheKey = `route-${routeId}`;
  const fullRoutePath = routeCoordinates.get(routeCacheKey);
  
  if (!fullRoutePath || fullRoutePath.length === 0) return;
  
  const route = busRoutes.find(r => r.id === routeId);
  if (!route) return;
  
  const stops = route.stops.map(stopId => busStops.find(s => s.id === stopId));
  const buses = [];
  
  // Create consistent number of buses (2-3 per route)
  const busCount = 2 + (routeId % 2); // Consistent bus count based on route ID
  
  for (let i = 0; i < busCount; i++) {
    const busId = `${routeId}-${i}`;
    let currentPosition = busPositions.get(busId);
    
    if (!currentPosition) {
      // Initialize new bus position at evenly spaced intervals on the route
      const spacing = Math.floor(fullRoutePath.length / busCount);
      const startIndex = i * spacing;
      currentPosition = {
        pathIndex: startIndex,
        direction: 1, // 1 for forward, -1 for backward
        speed: 0.5 + Math.random() * 1.5 // Random speed multiplier between 0.5-2
      };
    }
    
    // Move along the path with consistent speed
    const moveSpeed = currentPosition.speed;
    currentPosition.pathIndex += currentPosition.direction * moveSpeed;
    
    // Handle direction changes at route ends
    if (currentPosition.pathIndex >= fullRoutePath.length - 1) {
      currentPosition.pathIndex = fullRoutePath.length - 1;
      currentPosition.direction = -1; // Reverse direction
    } else if (currentPosition.pathIndex <= 0) {
      currentPosition.pathIndex = 0;
      currentPosition.direction = 1; // Forward direction
    }
    
    // Get current coordinates from the cached route path
    const currentIndex = Math.floor(currentPosition.pathIndex);
    const nextIndex = Math.min(currentIndex + 1, fullRoutePath.length - 1);
    const currentCoords = fullRoutePath[currentIndex];
    const nextCoords = fullRoutePath[nextIndex];
    
    // Interpolate between current and next coordinate for smooth movement
    const progress = currentPosition.pathIndex - currentIndex;
    const lat = currentCoords[0] + (nextCoords[0] - currentCoords[0]) * progress;
    const lng = currentCoords[1] + (nextCoords[1] - currentCoords[1]) * progress;
    
    busPositions.set(busId, currentPosition);
    
    // Find nearest stop for current location
    let nearestStop = stops[0];
    let minDistance = Infinity;
    
    stops.forEach(stop => {
      const distance = Math.sqrt(
        Math.pow(stop.lat - lat, 2) + Math.pow(stop.lng - lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestStop = stop;
      }
    });
    
    // Determine next stop based on direction
    const currentStopIndex = stops.findIndex(stop => stop.id === nearestStop.id);
    let nextStopIndex;
    if (currentPosition.direction === 1) {
      nextStopIndex = Math.min(currentStopIndex + 1, stops.length - 1);
    } else {
      nextStopIndex = Math.max(currentStopIndex - 1, 0);
    }
    const nextStop = stops[nextStopIndex];
    
    // Calculate realistic speed in km/h based on movement
    const speedKmh = Math.floor(moveSpeed * 20 + 15); // 15-55 km/h range
    
    buses.push({
      id: busId,
      bus_number: `${route.busNumber}-${String.fromCharCode(65 + i)}`, // 101-A, 101-B, 101-C
      route: route.routeName,
      latitude: lat,
      longitude: lng,
      current_stop: nearestStop.name,
      current_stop_nepali: nearestStop.nameNepali,
      direction: `towards ${nextStop.name}`,
      speed: speedKmh,
      last_update: new Date().toISOString(),
      path_progress: Math.floor((currentPosition.pathIndex / fullRoutePath.length) * 100),
      route_direction: currentPosition.direction === 1 ? 'forward' : 'backward'
    });
  }
  
  // Emit updates only to clients subscribed to this route
  io.to(`route-${routeId}`).emit('bus-update', buses);
}

// Update bus positions periodically for active routes only
setInterval(() => {
  activeRouteSubscriptions.forEach(routeId => {
    updateBusesForRoute(routeId);
  });
}, 2000); // Update every 2 seconds

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-route', async (routeId) => {
    socket.join(`route-${routeId}`);
    console.log(`Client ${socket.id} joined route-${routeId}`);
    
    // Add route to active subscriptions
    activeRouteSubscriptions.add(routeId);
    
    // Initialize route path if not already cached
    await initializeRoutePath(routeId);
    
    // Start immediate update for this route
    updateBusesForRoute(routeId);
  });
  
  socket.on('leave-route', (routeId) => {
    socket.leave(`route-${routeId}`);
    console.log(`Client ${socket.id} left route-${routeId}`);
    
    // Check if any clients are still subscribed to this route
    const room = io.sockets.adapter.rooms.get(`route-${routeId}`);
    if (!room || room.size === 0) {
      activeRouteSubscriptions.delete(routeId);
      console.log(`No more clients for route-${routeId}, stopping updates`);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up empty route subscriptions
    activeRouteSubscriptions.forEach(routeId => {
      const room = io.sockets.adapter.rooms.get(`route-${routeId}`);
      if (!room || room.size === 0) {
        activeRouteSubscriptions.delete(routeId);
      }
    });
  });
});
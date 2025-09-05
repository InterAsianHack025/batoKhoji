const { busStops, busRoutes } = require("./bus_routes");

async function createTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bus_stops (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      name_nepali VARCHAR(100),
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      facilities JSONB
    );

    CREATE TABLE IF NOT EXISTS bus_routes (
      id SERIAL PRIMARY KEY,
      route_name VARCHAR(100) NOT NULL,
      route_name_nepali VARCHAR(100),
      bus_number VARCHAR(20),
      fare INTEGER,
      estimated_time INTEGER,
      frequency VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS route_stops (
      id SERIAL PRIMARY KEY,
      route_id INTEGER REFERENCES bus_routes(id) ON DELETE CASCADE,
      stop_id INTEGER REFERENCES bus_stops(id) ON DELETE CASCADE,
      stop_order INTEGER
    );
  `);

  console.log("Tables created (if not exist).");
}

async function seedRouteData(pool) {
  for (const stop of busStops) {
    await pool.query(
      `INSERT INTO bus_stops (id, name, name_nepali, latitude, longitude, facilities)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        stop.id,
        stop.name,
        stop.nameNepali,
        stop.lat,
        stop.lng,
        JSON.stringify(stop.facilities),
      ]
    );
  }

  for (const route of busRoutes) {
    await pool.query(
      `INSERT INTO bus_routes (id, route_name, route_name_nepali, bus_number, fare, estimated_time, frequency)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        route.id,
        route.routeName,
        route.routeNameNepali,
        route.busNumber,
        route.fare,
        route.estimatedTime,
        route.frequency,
      ]
    );

    for (let i = 0; i < route.stops.length; i++) {
      await pool.query(
        `INSERT INTO route_stops (route_id, stop_id, stop_order)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [route.id, route.stops[i], i + 1]
      );
    }
  }

  console.log("Bus stops and routes seeded successfully.");
}

module.exports = { createTables, seedRouteData };

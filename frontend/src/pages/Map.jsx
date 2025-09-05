import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import axios from "axios";
import io from "socket.io-client";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, shadowUrl });

const Map = () => {
  const { t } = useTranslation();

  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const busMarkersRef = useRef({});
  const socketRef = useRef(null);
  const location = useLocation();
  const { selectedRoute, fromStop, toStop, directRoute, searchQuery, message, error } = location.state || {};
  
  const [buses, setBuses] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [userMarker, setUserMarker] = useState(null);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [allBusStops, setAllBusStops] = useState([]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Find nearby bus stops
  const findNearbyStops = (location) => {
    if (allBusStops.length === 0) return;
    
    const stopsWithDistance = allBusStops.map(stop => ({
      ...stop,
      distance: calculateDistance(
        location.latitude,
        location.longitude,
        stop.latitude,
        stop.longitude
      )
    }));
    
    // Sort by distance and get top 5
    const nearby = stopsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    
    setNearbyStops(nearby);
  };

  // Open directions in default map app
  const openDirections = (destLat, destLng, destName) => {
    if (!userLocation) {
      alert('Current location not available');
      return;
    }
    
    const userLat = userLocation.latitude;
    const userLng = userLocation.longitude;
    
    // Try to open in Google Maps, fallback to Apple Maps on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${destLat},${destLng}`;
    const appleMapsUrl = `http://maps.apple.com/?saddr=${userLat},${userLng}&daddr=${destLat},${destLng}`;
    
    if (isIOS) {
      window.open(appleMapsUrl, '_blank');
    } else {
      window.open(googleMapsUrl, '_blank');
    }
  };

  const createBusIcon = (busNumber, direction, speed) => {
    // Determine rotation based on direction text
    let rotation = 0;
    if (direction.includes('towards')) {
      const directionText = direction.toLowerCase();
      if (directionText.includes('north') || directionText.includes('up')) rotation = 0;
      else if (directionText.includes('east') || directionText.includes('right')) rotation = 90;
      else if (directionText.includes('south') || directionText.includes('down')) rotation = 180;
      else if (directionText.includes('west') || directionText.includes('left')) rotation = 270;
      else rotation = Math.random() * 360; // Random direction if unclear
    }
    
    // Color based on speed
    const speedColor = speed > 30 ? '#10B981' : speed > 20 ? '#3B82F6' : '#F59E0B';
    
    return L.divIcon({
      html: `
        <div style="
          background: ${speedColor};
          border: 2px solid white;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
      
          transition: all 0.5s ease;
          position: relative;
        ">
          <div style="
            position: absolute;
            top: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 6px solid white;
          "></div>
          🚌
        </div>
      `,
      className: 'custom-bus-icon',
      iconSize: [45, 45],
      iconAnchor: [22.5, 22.5]
    });
  };

  // Get user location and watch for changes
  const getUserLocation = () => {
    if (navigator.geolocation) {
      // Get initial position with high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          console.log('User location obtained:', newLocation);
          setUserLocation(newLocation);
          
          // Update user marker on map if map exists
          if (mapRef.current) {
            updateUserLocationMarker(newLocation);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to Kathmandu center if location access is denied
          const fallbackLocation = {
            latitude: 27.7172,
            longitude: 85.3240,
            accuracy: 1000
          };
          setUserLocation(fallbackLocation);
          
          if (mapRef.current) {
            updateUserLocationMarker(fallbackLocation);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
      
      // Watch position changes with high accuracy
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setUserLocation(newLocation);
          
          // Update user marker on map
          if (mapRef.current) {
            updateUserLocationMarker(newLocation);
          }
        },
        (error) => {
          console.error("Error watching location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
      
      // Cleanup function
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  };

  // Update user location marker
  const updateUserLocationMarker = (location) => {
    if (userMarker) {
      // Update existing marker position
      userMarker.setLatLng([location.latitude, location.longitude]);
    } else {
      // Create new user location marker with enhanced styling
      const marker = L.marker([location.latitude, location.longitude], {
        icon: L.divIcon({
          html: `
            <div style="
              background: #3B82F6; 
              border: 4px solid white; 
              border-radius: 50%; 
              width: 24px; 
              height: 24px;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
              position: relative;
              animation: userLocationPulse 2s infinite;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
              "></div>
              <!-- Accuracy circle -->
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 60px;
                border: 2px solid rgba(59, 130, 246, 0.3);
                border-radius: 50%;
                background: rgba(59, 130, 246, 0.1);
                pointer-events: none;
              "></div>
            </div>
          `,
          className: 'user-location-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      })
      .addTo(mapRef.current)
      .bindPopup(`
        <div style="text-align: center;">
          <div style="font-weight: bold; color: #3B82F6; margin-bottom: 4px;">📍 Your Location</div>
          <div style="font-size: 12px; color: #666;">
            Lat: ${location.latitude.toFixed(6)}<br>
            Lng: ${location.longitude.toFixed(6)}
          </div>
          <div style="font-size: 11px; color: #888; margin-top: 4px;">
            Accuracy: ±10-50m
          </div>
        </div>
      `);
      
      setUserMarker(marker);
    }
    
    // Center map on user location if no specific route is selected
    if (!selectedRoute && mapRef.current) {
      mapRef.current.setView([location.latitude, location.longitude], 15, {
        animate: true,
        duration: 1
      });
    }
  };

  // Update nearby stops when user location changes
  useEffect(() => {
    if (userLocation && allBusStops.length > 0) {
      findNearbyStops(userLocation);
    }
  }, [userLocation, allBusStops]);

  useEffect(() => {
    const cleanup = getUserLocation();

    // Default zoom level of kathmandu
    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    mapRef.current = L.map(mapDiv).setView([27.7104, 85.3077], 13); // Kathmandu center

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    // Always fetch and plot bus stops with enhanced functionality
    fetch("http://localhost:5001/api/bus-stops")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAllBusStops(data.data);
          
          data.data.forEach((stop) => {
            // Create enhanced bus stop marker with navigation
            const busStopIcon = L.divIcon({
              html: `
                <div style="
                  background: #F59E0B;
                  border: 2px solid white;
                  border-radius: 50%;
                  width: 30px;
                  height: 30px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 14px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                ">
                  🚏
                </div>
              `,
              className: 'bus-stop-icon',
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            });

            const marker = L.marker([stop.latitude, stop.longitude], { icon: busStopIcon })
              .addTo(mapRef.current);
            
            // Enhanced popup with navigation
            const popupContent = () => {
              let distanceText = '';
              let directionsButton = '';
              
              if (userLocation) {
                const distance = calculateDistance(
                  userLocation.latitude, 
                  userLocation.longitude, 
                  stop.latitude, 
                  stop.longitude
                );
                distanceText = `<div style="margin-bottom: 4px;"><strong>Distance:</strong> ${distance.toFixed(2)} km from you</div>`;
                directionsButton = `<button onclick="window.openDirections(${stop.latitude}, ${stop.longitude}, '${stop.name}')" style="
                  background: #10B981; 
                  color: white; 
                  border: none; 
                  padding: 6px 12px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  margin-top: 8px;
                  font-size: 12px;
                  width: 100%;
                ">🗺️ Navigate Here</button>`;
              }
              
              return `
                <div style="min-width: 200px;">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">🚏 ${stop.name}</div>
                  <div style="margin-bottom: 4px; color: #666;">${stop.name_nepali}</div>
                  ${distanceText}
                  <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
                    Lat: ${stop.latitude.toFixed(4)}, Lng: ${stop.longitude.toFixed(4)}
                  </div>
                  ${directionsButton}
                </div>
              `;
            };
            
            marker.bindPopup(popupContent());
            
            // Update popup when user location changes
            marker.on('popupopen', () => {
              marker.setPopupContent(popupContent());
            });
          });
          
          // Find nearby stops if user location is available
          if (userLocation) {
            findNearbyStops(userLocation);
          }
          
          // If we have fromStop and toStop but no direct route, highlight them
          if (fromStop && toStop && directRoute === false) {
            // Highlight the from stop
            const fromStopIcon = L.divIcon({
              html: `
                <div style="
                  background: #10B981;
                  border: 3px solid white;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 18px;
                  box-shadow: 0 4px 12px rgba(16,185,129,0.5);
                ">
                  🏁
                </div>
              `,
              className: 'from-stop-icon',
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });

            L.marker([fromStop.latitude, fromStop.longitude], { icon: fromStopIcon })
              .addTo(mapRef.current)
              .bindPopup(`
                <div style="min-width: 200px;">
                  <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #10B981;">🏁 Starting Point</div>
                  <div style="font-weight: bold; margin-bottom: 4px;">${fromStop.name}</div>
                  <div style="margin-bottom: 4px; color: #666;">${fromStop.name_nepali}</div>
                  <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
                    Lat: ${fromStop.latitude.toFixed(4)}, Lng: ${fromStop.longitude.toFixed(4)}
                  </div>
                  ${userLocation ? `<button onclick="window.openDirections(${fromStop.latitude}, ${fromStop.longitude}, '${fromStop.name}')" style="
                    background: #10B981; 
                    color: white; 
                    border: none; 
                    padding: 6px 12px; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    font-size: 12px;
                    width: 100%;
                  ">🗺️ Navigate to Start</button>` : ''}
                </div>
              `);

            // Highlight the to stop
            const toStopIcon = L.divIcon({
              html: `
                <div style="
                  background: #EF4444;
                  border: 3px solid white;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 18px;
                  box-shadow: 0 4px 12px rgba(239,68,68,0.5);
                ">
                  🎯
                </div>
              `,
              className: 'to-stop-icon',
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });

            L.marker([toStop.latitude, toStop.longitude], { icon: toStopIcon })
              .addTo(mapRef.current)
              .bindPopup(`
                <div style="min-width: 200px;">
                  <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #EF4444;">🎯 Destination</div>
                  <div style="font-weight: bold; margin-bottom: 4px;">${toStop.name}</div>
                  <div style="margin-bottom: 4px; color: #666;">${toStop.name_nepali}</div>
                  <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
                    Lat: ${toStop.latitude.toFixed(4)}, Lng: ${toStop.longitude.toFixed(4)}
                  </div>
                  ${userLocation ? `<button onclick="window.openDirections(${toStop.latitude}, ${toStop.longitude}, '${toStop.name}')" style="
                    background: #EF4444; 
                    color: white; 
                    border: none; 
                    padding: 6px 12px; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    font-size: 12px;
                    width: 100%;
                  ">🗺️ Navigate to Destination</button>` : ''}
                </div>
              `);

            // Fit map to show both stops
            const bounds = L.latLngBounds([
              [fromStop.latitude, fromStop.longitude],
              [toStop.latitude, toStop.longitude]
            ]);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          }
        }
      })
      .catch((err) => console.error("Error fetching bus stops:", err));

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      if (cleanup) cleanup(); // Cleanup geolocation watch
    };
  }, [selectedRoute]);

  useEffect(() => {
    if (!selectedRoute || !mapRef.current) return;

    // Clear existing layers
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Clear existing bus markers
    Object.values(busMarkersRef.current).forEach(marker => {
      mapRef.current.removeLayer(marker);
    });
    busMarkersRef.current = {};

    const stops = selectedRoute.stopsDetails || [];
    if (stops.length === 0) return;

    // Plot stops as enhanced markers with navigation
    stops.forEach((stop, i) => {
      const isStartOrEnd = i === 0 || i === stops.length - 1;
      const routeStopIcon = L.divIcon({
        html: `
          <div style="
            background: ${isStartOrEnd ? '#EF4444' : '#3B82F6'};
            border: 3px solid white;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          ">
            ${isStartOrEnd ? '🎯' : '🚏'}
          </div>
        `,
        className: 'route-stop-icon',
        iconSize: [35, 35],
        iconAnchor: [17.5, 17.5]
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon: routeStopIcon })
        .addTo(mapRef.current);
      
      // Enhanced popup for route stops
      const routeStopPopup = () => {
        let distanceText = '';
        let directionsButton = '';
        
        if (userLocation) {
          const distance = calculateDistance(
            userLocation.latitude, 
            userLocation.longitude, 
            stop.latitude, 
            stop.longitude
          );
          distanceText = `<div style="margin-bottom: 4px;"><strong>Distance:</strong> ${distance.toFixed(2)} km from you</div>`;
          directionsButton = `<button onclick="window.openDirections(${stop.latitude}, ${stop.longitude}, '${stop.name}')" style="
            background: #10B981; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 4px; 
            cursor: pointer; 
            margin-top: 8px;
            font-size: 12px;
            width: 100%;
          ">🗺️ Navigate to Stop</button>`;
        }
        
        const stopType = isStartOrEnd ? (i === 0 ? 'Start' : 'End') : 'Stop';
        
        return `
          <div style="min-width: 200px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">
              ${isStartOrEnd ? '🎯' : '🚏'} ${stop.name}
            </div>
            <div style="margin-bottom: 4px; color: #666;">${stop.name_nepali}</div>
            <div style="margin-bottom: 4px;"><strong>Type:</strong> ${stopType} Point</div>
            <div style="margin-bottom: 4px;"><strong>Route:</strong> ${selectedRoute.busName}</div>
            ${distanceText}
            <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
              Lat: ${stop.latitude.toFixed(4)}, Lng: ${stop.longitude.toFixed(4)}
            </div>
            ${directionsButton}
          </div>
        `;
      };
      
      marker.bindPopup(routeStopPopup());
      
      // Update popup when user location changes
      marker.on('popupopen', () => {
        marker.setPopupContent(routeStopPopup());
      });
    });

    // Fetch route path from backend (cached OSM route)
    axios.get(`http://localhost:5001/api/route/${selectedRoute.id}/path`)
      .then((response) => {
        if (response.data.success && response.data.data.coordinates) {
          const routeCoords = response.data.data.coordinates;
          routeLayerRef.current = L.polyline(routeCoords, {
            color: "blue",
            weight: 4,
            opacity: 0.8
          }).addTo(mapRef.current);

          // Fit map to route bounds
          const bounds = L.latLngBounds(routeCoords);
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        } else {
          // Fallback to straight lines between stops
          const routeCoords = stops.map(stop => [stop.latitude, stop.longitude]);
          routeLayerRef.current = L.polyline(routeCoords, {
            color: "red",
            weight: 4,
            dashArray: "5, 10",
          }).addTo(mapRef.current);

          mapRef.current.fitBounds(routeLayerRef.current.getBounds());
        }
      })
      .catch((err) => {
        console.error("Error fetching route path:", err);
        // Fallback to straight lines
        const routeCoords = stops.map(stop => [stop.latitude, stop.longitude]);
        routeLayerRef.current = L.polyline(routeCoords, {
          color: "red",
          weight: 4,
          dashArray: "5, 10",
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(routeLayerRef.current.getBounds());
      });

    // Start fetching buses for this route
    fetchBuses();
    const interval = setInterval(fetchBuses, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [selectedRoute]);

  // Fetch buses for the selected route
  const fetchBuses = async () => {
    if (!selectedRoute) return;

    try {
      const response = await axios.get(`http://localhost:5001/api/route/${selectedRoute.id}/buses`);
      if (response.data.success) {
        setBuses(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching buses:", err);
    }
  };

  // Update bus markers when buses state changes
  useEffect(() => {
    if (!mapRef.current || !selectedRoute) return;

    buses.forEach((bus) => {
      const existingMarker = busMarkersRef.current[bus.id];
      
      if (existingMarker) {
        // Animate existing marker to new position
        const newLatLng = L.latLng(bus.latitude, bus.longitude);
        existingMarker.setLatLng(newLatLng);
        
        // Calculate distance from user location
        let distanceText = '';
        if (userLocation) {
          const distance = calculateDistance(
            userLocation.latitude, 
            userLocation.longitude, 
            bus.latitude, 
            bus.longitude
          );
          distanceText = `<div style="margin-bottom: 4px;"><strong>Distance:</strong> ${distance.toFixed(2)} km from you</div>`;
        }
        
        // Update popup content
        existingMarker.setPopupContent(`
          <div style="font-weight: bold;">🚌 Bus ${bus.bus_number}</div>
          <div>Near: ${bus.current_stop}</div>
          <div>Direction: ${bus.direction}</div>
          <div>Speed: ${bus.speed} km/h</div>
          ${distanceText}
          <div>Lat: ${bus.latitude.toFixed(4)}, Lng: ${bus.longitude.toFixed(4)}</div>
          ${userLocation ? `<button onclick="window.openDirections(${bus.latitude}, ${bus.longitude}, '${bus.current_stop}')" style="
            background: #3B82F6; 
            color: white; 
            border: none; 
            padding: 5px 10px; 
            border-radius: 4px; 
            cursor: pointer; 
            margin-top: 8px;
            font-size: 12px;
          ">📍 Get Directions</button>` : ''}
        `);
      } else {
        // Calculate distance from user location
        let distanceText = '';
        let directionsButton = '';
        if (userLocation) {
          const distance = calculateDistance(
            userLocation.latitude, 
            userLocation.longitude, 
            bus.latitude, 
            bus.longitude
          );
          distanceText = `<div style="margin-bottom: 4px;"><strong>Distance:</strong> ${distance.toFixed(2)} km from you</div>`;
          directionsButton = `<button onclick="window.openDirections(${bus.latitude}, ${bus.longitude}, '${bus.current_stop}')" style="
            background: #3B82F6; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 4px; 
            cursor: pointer; 
            margin-top: 8px;
            font-size: 12px;
            width: 100%;
          ">📍 Get Directions to Bus</button>`;
        }
        
        // Create new marker
        const busIcon = createBusIcon(bus.bus_number, bus.direction, bus.speed);
        const marker = L.marker([bus.latitude, bus.longitude], { icon: busIcon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">🚌 Bus ${bus.bus_number}</div>
            <div style="margin-bottom: 4px;"><strong>Route:</strong> ${bus.route}</div>
            <div style="margin-bottom: 4px;"><strong>Near:</strong> ${bus.current_stop}</div>
            <div style="margin-bottom: 4px;"><strong>Direction:</strong> ${bus.direction}</div>
            <div style="margin-bottom: 4px;"><strong>Speed:</strong> ${bus.speed} km/h</div>
            ${distanceText}
            <div style="margin-bottom: 4px;"><strong>Status:</strong> Moving</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
              Lat: ${bus.latitude.toFixed(4)}, Lng: ${bus.longitude.toFixed(4)}
            </div>
            ${directionsButton}
          `);

        busMarkersRef.current[bus.id] = marker;
      }
    });

    // Remove markers for buses that no longer exist
    Object.keys(busMarkersRef.current).forEach(busId => {
      const busExists = buses.some(bus => bus.id.toString() === busId);
      if (!busExists) {
        mapRef.current.removeLayer(busMarkersRef.current[busId]);
        delete busMarkersRef.current[busId];
      }
    });
  }, [buses, selectedRoute, userLocation]);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    if (selectedRoute) {
      socketRef.current = io('http://localhost:5001');
      
      socketRef.current.on('bus-update', (updatedBuses) => {
        setBuses(updatedBuses);
      });

      socketRef.current.emit('join-route', selectedRoute.id);
      setIsTracking(true);

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        setIsTracking(false);
      };
    }
  }, [selectedRoute]);

  // Make openDirections available globally for popup buttons
  useEffect(() => {
    window.openDirections = openDirections;
    return () => {
      delete window.openDirections;
    };
  }, [userLocation]);

  // Fallback polling if WebSocket not available
  useEffect(() => {
    if (!selectedRoute || isTracking) return;

    const interval = setInterval(fetchBuses, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, [selectedRoute, isTracking]);

  // helper to validate coords
  const isValidCoord = (c) => {
    if (!c) return false;
    const [lat, lng] = c;
    return Number.isFinite(lat) && Number.isFinite(lng);
  };

  // Example: when creating/updating a bus marker
  const updateOrCreateBusMarker = (busId, coords, popupHtml) => {
    if (!isValidCoord(coords)) return; // guard: skip invalid coords
    const [lat, lng] = coords;
    const existing = busMarkersRef.current[busId];
    if (existing && existing.getLatLng) {
      existing.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng]);
      if (popupHtml) marker.bindPopup(popupHtml);
      marker.addTo(mapRef.current);
      busMarkersRef.current[busId] = marker;
    }
  };

  // When setting user marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (!userLocation || !isValidCoord([userLocation.latitude, userLocation.longitude])) {
      return;
    }
    const pos = [userLocation.latitude, userLocation.longitude];
    if (userMarker) {
      userMarker.setLatLng(pos);
    } else {
      const m = L.circleMarker(pos, { radius: 8, color: '#0ea5e9', fillColor: '#0ea5e9' }).addTo(mapRef.current);
      setUserMarker(m);
    }
  }, [userLocation]);
  
  return (
    <div className="relative">
      <style>
        {`
          .custom-bus-icon {
            transition: all 0.5s ease-in-out;
          }
          
          .leaflet-marker-icon.custom-bus-icon:hover {
            transform: scale(1.1);
          }
          
          .user-location-icon {
            position: relative;
          }
          
          .bus-stop-icon {
            transition: all 0.3s ease;
          }
          
          .bus-stop-icon:hover {
            transform: scale(1.1);
          }
          
          .route-stop-icon {
            transition: all 0.3s ease;
            z-index: 1000;
          }
          
          .route-stop-icon:hover {
            transform: scale(1.1);
          }
          
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes userLocationPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>
      
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <h1 className="text-xl font-bold text-gray-800">{t("pages.map")}</h1>
        {selectedRoute && (
          <div className="text-sm text-gray-600 mt-1">
            Route: {selectedRoute.busName}
          </div>
        )}
        {!selectedRoute && fromStop && toStop && (
          <div className="text-sm text-gray-600 mt-1">
            {directRoute === false ? (
              <div>
                <div className="text-yellow-600 font-medium">⚠️ No Direct Route</div>
                <div>From: {fromStop.name_nepali}</div>
                <div>To: {toStop.name_nepali}</div>
              </div>
            ) : (
              <div>
                <div>From: {fromStop.name_nepali}</div>
                <div>To: {toStop.name_nepali}</div>
              </div>
            )}
          </div>
        )}
        {(message || error) && (
          <div className={`text-sm mt-2 p-2 rounded ${error ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {error || message}
          </div>
        )}
        {isTracking && (
          <div className="flex items-center mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm text-green-600">Live Tracking Active</span>
          </div>
        )}
        {userLocation && (
          <div className="flex items-center mt-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              Live Location: ON
              {userLocation.accuracy && (
                <span className="text-xs text-gray-500 ml-2">
                  (±{Math.round(userLocation.accuracy)}m)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Nearby Bus Stops Panel - Only show when no route is selected */}
      {!selectedRoute && nearbyStops.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <h3 className="font-semibold text-gray-800 mb-2">🚏 Nearby Bus Stops</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {nearbyStops.map((stop) => (
              <div key={stop.id} className="p-2 bg-gray-50 rounded border">
                <div className="font-medium text-sm">{stop.name}</div>
                <div className="text-xs text-gray-600">{stop.name_nepali}</div>
                <div className="text-xs text-blue-600 font-medium">
                  {stop.distance.toFixed(2)} km away
                </div>
                <button
                  onClick={() => openDirections(stop.latitude, stop.longitude, stop.name)}
                  className="mt-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                >
                  🗺️ Navigate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Buses Panel - Only show when route is selected */}
      {selectedRoute && buses.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <h3 className="font-semibold text-gray-800 mb-2">🚍 Active Buses ({buses.length})</h3>
          
          {/* Speed Legend */}
          <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
            <div className="font-medium mb-1">Speed Legend:</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Fast (30+ km/h)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Normal (20-30 km/h)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Slow (&lt;20 km/h)</span>
            </div>
          </div>
          
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {buses.map((bus) => {
              const distance = userLocation ? calculateDistance(
                userLocation.latitude, 
                userLocation.longitude, 
                bus.latitude, 
                bus.longitude
              ) : null;
              
              return (
                <div key={bus.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">🚌 {bus.bus_number}</span>
                    <div className="text-xs text-gray-600">{bus.current_stop}</div>
                    {distance && (
                      <div className="text-xs text-blue-600">{distance.toFixed(2)} km away</div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`font-medium ${
                      bus.speed > 30 ? 'text-green-600' : 
                      bus.speed > 20 ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      {bus.speed} km/h
                    </span>
                    <div className="text-xs text-gray-500">{bus.direction.split(' ')[1]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div id="map" className="w-full h-screen"></div>
    </div>
  );
};

export default Map;
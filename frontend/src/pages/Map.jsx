import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";

// Fix default Leaflet marker icons
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const Map = () => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef([]);
  const location = useLocation();
  const { selectedRoute } = location.state || {};

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current) {
      const mapDiv = document.getElementById("map");
      if (!mapDiv) return;

      mapRef.current = L.map(mapDiv).setView([27.7104, 85.3077], 13); // Kathmandu center
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Plot all bus stops if no specific route is selected
  useEffect(() => {
    if (!mapRef.current || selectedRoute) return;

    const fetchBusStops = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/bus-stops");
        const data = await res.json();
        if (data.success) {
          data.data.forEach((stop) => {
            const marker = L.marker([stop.latitude, stop.longitude])
              .addTo(mapRef.current)
              .bindPopup(`<b>${stop.name}</b><br>${stop.name_nepali}`);
            markersRef.current.push(marker);
          });
        }
      } catch (err) {
        console.error("Error fetching bus stops:", err);
      }
    };

    fetchBusStops();
  }, [selectedRoute]);

  // Plot selected route if available
  useEffect(() => {
    if (!mapRef.current || !selectedRoute) return;

    // Remove previous markers
    markersRef.current.forEach((marker) => mapRef.current.removeLayer(marker));
    markersRef.current = [];

    // Remove previous route polyline
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const stops = selectedRoute.stopsDetails || [];
    if (stops.length === 0) return;

    // Add markers for stops
    stops.forEach((stop) => {
      const marker = L.marker([stop.latitude, stop.longitude])
        .addTo(mapRef.current)
        .bindPopup(`${stop.name}<br>${stop.name_nepali}`);
      markersRef.current.push(marker);
    });

    // Fetch route from backend
    const fetchRoute = async () => {
      try {
        const coordinates = stops.map((stop) => [
          stop.longitude,
          stop.latitude,
        ]); // ORS expects [lng, lat]
        const res = await fetch("http://localhost:5001/api/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coordinates }),
        });
        const data = await res.json();

        let routeCoords = [];
        if (data.features?.[0]?.geometry?.coordinates) {
          routeCoords = data.features[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          routeLayerRef.current = L.polyline(routeCoords, {
            color: "blue",
            weight: 4,
          });
        } else {
          // fallback straight lines
          routeCoords = stops.map((stop) => [stop.latitude, stop.longitude]);
          routeLayerRef.current = L.polyline(routeCoords, {
            color: "red",
            weight: 4,
            dashArray: "5,10",
          });
        }

        routeLayerRef.current.addTo(mapRef.current);
        mapRef.current.fitBounds(routeLayerRef.current.getBounds());
      } catch (err) {
        console.error("Error fetching route:", err);
      }
    };

    fetchRoute();
  }, [selectedRoute]);

  return (
    <div>
      <h1 className="text-2xl font-bold p-4">{t("pages.map")}</h1>
      <div id="map" className="w-full h-screen"></div>
    </div>
  );
};

export default Map;

import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next"; //harina

import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, shadowUrl });

const Map = () => {
  const { t } = useTranslation();//harina

  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const location = useLocation();
  const { selectedRoute } = location.state || {};

  useEffect(() => {

    // Default zoom level of kathmandu
    // Map chai default zoom to kathmandu
    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    mapRef.current = L.map(mapDiv).setView([27.7104, 85.3077], 200); // Kathmandu center

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    // Only plot all bus stops if no specific route is selected
    if (!selectedRoute) {
      // Fetch and plot bus stops
      fetch("http://localhost:5001/api/bus-stops")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            data.data.forEach((stop) => {
              L.marker([stop.latitude, stop.longitude])
                .addTo(mapRef.current)
                .bindPopup(`<b>${stop.name}</b><br>${stop.name_nepali}`);
            });
          }
        })
        .catch((err) => console.error("Error fetching bus stops:", err));
    }

    return () => mapRef.current.remove();
  }, [selectedRoute]);

  useEffect(() => {
    if (!selectedRoute || !mapRef.current) return;

    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current.removeLayer(layer);
      }
    });

    const stops = selectedRoute.stopsDetails || [];
    if (stops.length === 0) return;

    // Plot stops as markers
    stops.forEach((stop, i) => {
      L.marker([stop.latitude, stop.longitude])
        .addTo(mapRef.current)
        .bindPopup(`${stop.name}<br>${stop.name_nepali}`);
    });

    // Fetch actual route from ORS
    const coordinates = stops.map(stop => [stop.longitude, stop.latitude]); // ORS expects [lng, lat]
    fetch("http://localhost:5001/api/route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coordinates }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.features && data.features[0] && data.features[0].geometry.coordinates) {
          const routeCoords = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); // Swap to [lat, lng]
          routeLayerRef.current = L.polyline(routeCoords, {
            color: "blue",
            weight: 4,
          }).addTo(mapRef.current);

          mapRef.current.fitBounds(routeLayerRef.current.getBounds());
        } else {
          // Fallback to straight lines
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
        console.error("Error fetching route:", err);
        // Fallback
        const routeCoords = stops.map(stop => [stop.latitude, stop.longitude]);
        routeLayerRef.current = L.polyline(routeCoords, {
          color: "red",
          weight: 4,
          dashArray: "5, 10",
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(routeLayerRef.current.getBounds());
      });
  }, [selectedRoute]);

  return(
//harina
  <div> 

   <h1 className="text-2xl font-bold p-4">{t("pages.map")}</h1>
  <div id="map" className="w-full h-screen"></div>;

  </div>
  );
};

export default Map;
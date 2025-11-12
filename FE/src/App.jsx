import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import MapView from "./pages/MapView.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/map" element={<MapView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

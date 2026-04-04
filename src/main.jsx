import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";

const Ghost = lazy(() => import("./Ghost.jsx"));
const Sign = lazy(() => import("./Sign.jsx"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div style={{ background: "#000", minHeight: "100vh" }} />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/ghost" element={<Ghost />} />
          <Route path="/sign" element={<Sign />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);

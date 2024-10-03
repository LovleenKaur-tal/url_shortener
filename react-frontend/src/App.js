import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import ShortenUrl from "./ShortenUrl";
import History from "./History";
import "./App.css";
import { NavLink } from "react-router-dom";

function App() {
  const [history, setHistory] = useState([]);

  // Function to handle URL shortening
  const addToHistory = (newItem) => {
    setHistory([...history, newItem]);
  };

  // Function to handle URL deletion
  const deleteUrl = async (shortUrl) => {
    try {
      const shortCode = shortUrl.split("/").pop(); // Extract shortcode from URL
      await axios.delete(`http://localhost:8000/api/url/${shortCode}/delete/`);
      // Remove the deleted URL from the history state
      setHistory(history.filter((item) => item.shortUrl !== shortUrl));
      window.location.reload();
    } catch (error) {
      console.error("Error deleting URL:", error);
    }
  };

  // Function to handle shortcode renaming
  const renameShortcode = async (shortUrl, newShortcode) => {
    try {
      if (!shortUrl) {
        throw new Error("shortUrl is undefined");
      }
  
      // Extract the short code from the full URL (e.g., "abc123" from "http://localhost:8000/abc123")
      const shortCode = shortUrl.split("/").pop();
  
      // API call to update the short code
      const response = await axios.put(`http://localhost:8000/api/url/${shortCode}/rename/`, {
        new_short_code: newShortcode,
      });
  
      // Construct the full URL with the new short code
      const newFullUrl = `${window.location.origin}/${response.data.short_code}`;
  
      // Update the history state with the new full URL and short code
      setHistory(
        history.map((item) =>
          item.short_code === shortCode
            ? { ...item, short_code: response.data.short_code, shortUrl: newFullUrl }  // Update both short code and full URL
            : item
        )
      );
      window.location.reload();
    } catch (error) {
      console.error("Error renaming shortcode:", error);
    }
  };
  

  // Function to handle changing the expiration time
  const changeExpiry = async (shortUrl, newExpiry) => {
    try {
      const shortCode = shortUrl.split("/").pop(); // Extract shortcode from URL
      await axios.put(`http://localhost:8000/api/url/${shortCode}/update-expiry/`, {
        expires_at: newExpiry,
      });
      // Update the history state with the new expiry date
      setHistory(
        history.map((item) =>
          item.shortUrl === shortUrl ? { ...item, expiresAt: newExpiry } : item
        )
      );
    } catch (error) {
      console.error("Error changing expiry date:", error);
    }
  };

  return (
    <Router>
      <div className="App">
      <nav className="nav-bar">
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Shorten URL</NavLink>
        <NavLink to="/history" className={({ isActive }) => isActive ? "active" : ""}>History</NavLink>
      </nav>

        <Routes>
          <Route
            path="/"
            element={<ShortenUrl onUrlShortened={addToHistory} />}
          />
          <Route
            path="/history"
            element={
              <History
                onDelete={deleteUrl}
                onRename={renameShortcode}
                onChangeExpiry={changeExpiry}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

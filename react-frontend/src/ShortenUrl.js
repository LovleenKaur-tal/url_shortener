import React, { useState } from "react";
import axios from "axios";

function ShortenUrl({ onUrlShortened }) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [expirationDate, setExpirationDate] = useState(""); // Expiration date state
  const [shortCode, setShortCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setShortCode("");
    setShowToast(false);

    if (!originalUrl) {
      setError("Please enter a valid URL.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/shorten/", {
        original_url: originalUrl,
        expires_at: expirationDate, // Pass expiration date to the backend
      });

      const shortenedCode = response.data.short_code;
      const expiration = response.data.expires_at; // Capture expiration date from API

      setShortCode(shortenedCode);
      onUrlShortened({
        originalUrl,
        shortUrl: `${window.location.origin}/${shortenedCode}`,
        expiresAt: expiration, // Store expiration date in history
      });
      setShowToast(true);
    } catch (err) {
      setError("Unable to shorten the URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ShortenUrl">
      <h1>Shorten URL</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter a long URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          placeholder="Expiration Date"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Shortening..." : "Shorten URL"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {shortCode && (
        <div className="result">
          <p>
            Shortened URL:{" "}
            <a
              href={`http://localhost:8000/${shortCode}`}
              target="_blank"
              rel="noreferrer"
            >
              {window.location.origin}/{shortCode}
            </a>
          </p>
        </div>
      )}

      {showToast && <div className="toast"><p>URL shortened successfully!</p></div>}
    </div>
  );
}

export default ShortenUrl;

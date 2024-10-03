import "./History.css";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function History({ onDelete, onRename, onChangeExpiry }) {
  const [editingShortcode, setEditingShortcode] = useState(null); // State to track which shortcode is being edited
  const [newShortcode, setNewShortcode] = useState(''); // State to store the new shortcode
  const [newExpiry, setNewExpiry] = useState(''); // State to store the new expiration date
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handleRename = (shortUrl) => {
    onRename(shortUrl, newShortcode);
    setEditingShortcode(null);  // Close the editing field after saving
  };

  const handleExpiryChange = (shortUrl) => {
    onChangeExpiry(shortUrl, newExpiry);
    setNewExpiry('');  // Reset the input field after saving
  };

  useEffect(() => {
    // Fetch history from backend when the component mounts
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/urls/");  
        console.log(response.data);  // Log the response to verify it
        setHistory(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch history.");
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="History">
      <h2>Shortened URLs History</h2>

      {history.length === 0 ? (
        <p>No URLs shortened yet!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Original URL</th>
              <th>Short URL</th>
              <th>Expiration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td><a href={item.original_url} target="_blank" rel="noreferrer">{item.original_url}</a></td>
                <td>
                  {editingShortcode === item.short_code ? (
                    <>
                      <input
                        type="text"
                        value={newShortcode}
                        onChange={(e) => setNewShortcode(e.target.value)}
                        placeholder="New Shortcode"
                      />
                      <button onClick={() => handleRename(`http://localhost:8000/${item.short_code}`)}>Save</button>
                      <button onClick={() => setEditingShortcode(null)}>Cancel</button>
                    </>
                  ) : (
                    <a href={item.original_url} target="_blank" rel="noreferrer">{item.short_code}</a>
                  )}
                </td>
                <td>{item.expires_at ? new Date(item.expires_at).toLocaleString() : "Never"}</td>
                <td>
                  {/* Action buttons */}
                  <div className="actions">
                  <button className="delete" onClick={() => onDelete(item.short_code)}>🗑️ Delete</button>
                  <button className="rename" onClick={() => setEditingShortcode(item.short_code)}>✏️ Rename</button>
                  <input
                    type="datetime-local"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    placeholder="Change Expiry"
                  />
                  <button className="save" onClick={() => handleExpiryChange(item.short_code)}>Save Expiry</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default History;

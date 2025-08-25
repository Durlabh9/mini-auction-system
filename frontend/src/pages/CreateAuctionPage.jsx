import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
const getFormattedDateTime = (date) => {
  const pad = (num) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function CreateAuctionPage() {
  const now = new Date();
  // Set a default end time for 1 day later
  const defaultEndTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    startingPrice: '',
    bidIncrement: '',
    startTime:getFormattedDateTime(now),
    endTime: getFormattedDateTime(defaultEndTime),
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auctionData = {
    ...formData,
    startTime: new Date(formData.startTime).toISOString(),
    endTime: new Date(formData.endTime).toISOString(),
  };
    try {

      await api.post('/auctions', auctionData);
      alert('Auction created successfully!');
      navigate('/'); 
    } catch (error) {
      console.error('Failed to create auction:', error);
      alert('Failed to create auction. You must be logged in.');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h1>Create a New Auction</h1>
        <div className="form-group">
          <label htmlFor="itemName">Item Name</label>
          <input
            type="text"
            id="itemName"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="startingPrice">Starting Price (₹)</label>
          <input
            type="number"
            id="startingPrice"
            name="startingPrice"
            value={formData.startingPrice}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="bidIncrement">Bid Increment (₹)</label>
          <input
            type="number"
            id="bidIncrement"
            name="bidIncrement"
            value={formData.bidIncrement}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="startTime">Start Time</label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endTime">End Time</label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          Create Auction
        </button>
      </form>
    </div>
  );
}

export default CreateAuctionPage;
import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function CreateAuctionPage() {
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    startingPrice: '',
    bidIncrement: '',
    startTime: '',
    endTime: '',
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
    <div>
      <h1>Create a New Auction</h1>
      <form onSubmit={handleSubmit}>
        {/* We'll use a simplified form for now */}
        <input name="itemName" value={formData.itemName} onChange={handleChange} placeholder="Item Name" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
        <input name="startingPrice" type="number" value={formData.startingPrice} onChange={handleChange} placeholder="Starting Price" required />
        <input name="bidIncrement" type="number" value={formData.bidIncrement} onChange={handleChange} placeholder="Bid Increment" required />
        <label>Start Time:</label>
        <input name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} required />
        <label>End Time:</label>
        <input name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} required />
        <button type="submit">Create Auction</button>
      </form>
    </div>
  );
}

export default CreateAuctionPage;
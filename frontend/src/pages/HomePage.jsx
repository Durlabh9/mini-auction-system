import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import auction from '../assets/auction.jpg';
import './HomePage.css';

function HomePage() {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await api.get('/auctions');
        setAuctions(response.data);
      } catch (error) {
        console.error('Failed to fetch auctions:', error);
      }
    };

    fetchAuctions();
  }, []);

return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Rare Treasures at Live Auctions</h1>
          <p>Join the world's most sophisticated auction platform...</p>
          <div className="hero-buttons">
            <Link to="/create-auction" className="sell-button">Start Selling</Link>
            <a href="#featured-auctions" className="browse-button">Browse Auctions</a>
          </div>
        </div>
        <div className="hero-image">

          <img src={auction} alt="Hero" />
        </div>
      </section>

      {/* Featured Auctions Section */}
      <section id="featured-auctions" className="featured-auctions">

        <h2>Featured Auctions</h2>
        <p>Discover exceptional items currently available for bidding...</p>
        <div className="auction-list">
          {auctions.map((auction) => (
            <Link key={auction.id} to={`/auction/${auction.id}`} className="auction-card-link">
              <div className="auction-card">
                
                <div className="auction-details">
                  <h3>{auction.itemName}</h3>
                  <p>Sold by: {auction.seller?.username || 'Unknown'}</p>
                  <p>Current Bid: <strong>₹{auction.currentPrice}</strong></p>
                  <p>Ends at: {new Date(auction.endTime).toLocaleString()}</p>
                  <button>Place Bid</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        
      </section>
    </div>
  );
}

export default HomePage;
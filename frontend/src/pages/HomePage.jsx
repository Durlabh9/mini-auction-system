import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import auction from '../assets/auction.jpg';
import './HomePage.css';
const CategoryIcon = ({ children }) => (
  <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>{children}</div>
);

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
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Rare Treasures at Live Auctions</h1>
          <p>Join the world's most sophisticated auction platform and find unique items from around the globe.</p>
          <div className="hero-buttons">
            <a href="#featured-auctions" className="btn btn-primary">Browse Auctions</a>
            <Link to="/create-auction" className="btn btn-secondary" style={{marginLeft: '1rem'}}>Start Selling</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src={auction} alt="A collection of fine auction items" style={{width: '100%', borderRadius: '8px'}}/>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" style={{ textAlign: 'center', padding: '3rem 0', background: 'var(--color-surface)' }}>
        <h2>How It Works</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ maxWidth: '300px' }}>
            <h3>1. Register</h3>
            <p>Create an account in seconds to start bidding and selling.</p>
          </div>
          <div style={{ maxWidth: '300px' }}>
            <h3>2. Bid or List</h3>
            <p>Place bids on items you love or list your own treasures for auction.</p>
          </div>
          <div style={{ maxWidth: '300px' }}>
            <h3>3. Win & Ship</h3>
            <p>Win auctions and receive your items, or get paid for what you sell.</p>
          </div>
        </div>
      </section>

      {/* Featured Auctions Section */}
      <section id="featured-auctions" style={{padding: '3rem 0'}}>
        <h2 style={{ textAlign: 'center', margin: '2rem 0' }}>Featured Auctions</h2>
        <div className="auction-list">
          {auctions.map((auction) => (
            <Link key={auction.id} to={`/auction/${auction.id}`} style={{ textDecoration: 'none' }}>
              <div className="auction-card">
                <div className="auction-card-content">
                  <h3>{auction.itemName}</h3>
                  <p>Sold by: {auction.seller?.username || 'N/A'}</p>
                  <div className="auction-card-price">₹{auction.currentPrice}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>



      {/* Footer */}
      <footer style={{ textAlign: 'center',  marginTop: '.1rem', background: 'orange', color: 'white' }}>
        <p>&copy; 2025 Auctioneer. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;

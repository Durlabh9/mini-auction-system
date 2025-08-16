import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import api from '../api';
import Countdown from '../components/Countdown';

// This makes the WebSocket URL dynamic
const SOCKET_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://mini-auction-system-wze2.onrender.com';

const socket = io(SOCKET_URL);

function AuctionRoomPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [auction, setAuction] = useState(null);
    const [currentBid, setCurrentBid] = useState(0);
    const [bidAmount, setBidAmount] = useState('');
    const [counterPrice, setCounterPrice] = useState('');

    const currentUser = useMemo(() => {
        const token = localStorage.getItem('token');
        return token ? jwtDecode(token) : null;
    }, []);

    useEffect(() => {
        const fetchAuction = async () => {
            try {
                const response = await api.get(`/auctions/${id}`);
                setAuction(response.data);
                setCurrentBid(response.data.currentPrice);
            } catch (error) {
                console.error("Failed to fetch auction", error);
                navigate('/');
            }
        };
        fetchAuction();

        if (currentUser) {
            socket.emit('registerUser', currentUser.id);
        }

        socket.emit('joinAuction', id);
        socket.on('newHighestBid', (data) => setCurrentBid(data.bidAmount));
        socket.on('bidError', (error) => alert(error.message));
        socket.on('outbid', (data) => alert(data.message));

        return () => {
            socket.off('newHighestBid');
            socket.off('bidError');
            socket.off('outbid');
        };
    }, [id, navigate, currentUser]);

    const handleBidSubmit = (e) => {
        e.preventDefault();
        if (!currentUser) return alert('You must be logged in to place a bid.');
        socket.emit('placeBid', { auctionId: id, bidAmount: parseFloat(bidAmount), userId: currentUser.id });
        setBidAmount('');
    };

    const handleAcceptBid = async () => {
        try { await api.post(`/auctions/${id}/accept`); alert('You have accepted the highest bid!'); navigate('/'); } catch (error) { console.error('Failed to accept bid:', error); alert('Failed to accept bid.'); }
    };

    const handleRejectBid = async () => {
        try { await api.post(`/auctions/${id}/reject`); alert('You have rejected the bid.'); navigate('/'); } catch (error) { console.error('Failed to reject bid:', error); alert('Failed to reject bid.'); }
    };

    const handleCounterOffer = async (e) => {
        e.preventDefault();
        if (!counterPrice || parseFloat(counterPrice) <= auction.currentPrice) {
            return alert('Counter-offer must be higher than the current highest bid.');
        }
        try { await api.post(`/auctions/${id}/counter`, { newPrice: counterPrice }); alert('Counter-offer has been sent.'); navigate('/'); } catch (error) { console.error('Failed to make counter-offer:', error); alert('Failed to make counter-offer.'); }
    };

    const handleAcceptCounter = async () => {
        try { await api.post(`/auctions/${id}/accept-counter`); alert('You have accepted the counter-offer! Congratulations!'); navigate('/'); } catch (error) { console.error('Failed to accept counter-offer:', error); alert('Failed to accept counter-offer.'); }
    };

    const handleRejectCounter = async () => {
        try { await api.post(`/auctions/${id}/reject-counter`); alert('You have rejected the counter-offer.'); navigate('/'); } catch (error) { console.error('Failed to reject counter-offer:', error); alert('Failed to reject counter-offer.'); }
    };

    if (!auction) {
        return <div>Loading auction...</div>;
    }

    const isAuctionOver = new Date() > new Date(auction.endTime);
    const isSeller = currentUser && currentUser.id === auction.sellerId;
    const isHighestBidder = currentUser && auction.highestBidderId && Number(currentUser.id) === Number(auction.highestBidderId);

    // --- ADD THIS DEBUG BLOCK ---
    console.log("--- BIDDER ID DEBUG ---");
    console.log("Current User ID:", currentUser?.id, "(Type:", typeof currentUser?.id, ")");
    console.log("Highest Bidder ID:", auction.highestBidderId, "(Type:", typeof auction.highestBidderId, ")");
    console.log("-----------------------");
    // ----------------------------

    return (
        <div style={{ padding: '1rem' }}>
            <h1>{auction.itemName}</h1>
            <p>Sold by: {auction.seller.username}</p>
            <p>{auction.description}</p>
            <hr />

            <div style={{ margin: '20px 0' }}>
                <Countdown endTime={auction.endTime} />
            </div>

            <h2>Current Highest Bid: ${currentBid}</h2>

            {/* --- Show Bidding Form --- */}
            {!isAuctionOver && !isSeller && (
                <form onSubmit={handleBidSubmit}>
                    <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Your bid (min ${Number(currentBid) + Number(auction.bidIncrement)})`}
                        step="0.01"
                        min={Number(currentBid) + Number(auction.bidIncrement)}
                        required
                    />
                    <button type="submit">Place Bid</button>
                </form>
            )}

            {/* --- Show message to seller during active auction --- */}
            {!isAuctionOver && isSeller && (
                <p>This is your auction. You can see bids in real-time.</p>
            )}

            {/* --- Show Seller Actions After Auction Ends --- */}
            {isAuctionOver && isSeller && auction.status === 'ended' && (
                <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9' }}>
                    <h3>Seller Actions</h3>
                    <p>The auction has ended. Please choose an action.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <button onClick={handleAcceptBid}>Accept Highest Bid</button>
                        <span>OR</span>
                        <button onClick={handleRejectBid} style={{ backgroundColor: '#dc3545' }}>Reject Bid</button>
                    </div>
                    <hr style={{ margin: '20px 0' }} />
                    <form onSubmit={handleCounterOffer}>
                        <label style={{ fontWeight: 'bold' }}>Make a Counter-Offer:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <input
                                type="number"
                                value={counterPrice}
                                onChange={(e) => setCounterPrice(e.target.value)}
                                placeholder="Enter new price"
                                step="0.01"
                                required
                            />
                            <button type="submit">Send Counter-Offer</button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- Show Buyer's Response to Counter-Offer --- */}
            {auction.status === 'counter-offered' && isHighestBidder && (
                <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #007bff', borderRadius: '8px' }}>
                    <h3>Counter-Offer from Seller</h3>
                    <p>The seller has made a counter-offer of: <strong>${auction.counterOfferPrice}</strong></p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleAcceptCounter}>Accept Offer</button>
                        <button onClick={handleRejectCounter} style={{ backgroundColor: '#dc3545' }}>Reject Offer</button>
                    </div>
                </div>
            )}

            {/* --- Show Final Auction Status Messages --- */}
            {isAuctionOver && <p style={{ fontWeight: 'bold', marginTop: '20px' }}>This auction has ended.</p>}
            
            {auction.status === 'closed' && auction.winner && (
                <div style={{ padding: '10px', marginTop: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px' }}>
                    Winner: <strong>{auction.winner.username}</strong> with a final price of ${auction.currentPrice}!
                </div>
            )}

            {auction.status === 'rejected' && <p style={{ color: 'red', fontWeight: 'bold' }}>This auction was closed with no winner.</p>}
            
            {auction.status === 'counter-offered' && !isHighestBidder && (
                <p style={{ color: 'blue' }}>The seller has made a counter-offer to the highest bidder.</p>
            )}
        </div>
    );
}

export default AuctionRoomPage;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import api from '../api';
import Countdown from '../components/Countdown';

const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;
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
        try {
            return token ? jwtDecode(token) : null;
        } catch (error) {
            return null;
        }
    }, []);

    const fetchAuction = useCallback(async () => {
        try {
            const response = await api.get(`/auctions/${id}`);
            setAuction(response.data);
            setCurrentBid(response.data.currentPrice);
        } catch (error) {
            console.error("Failed to fetch auction", error);
            navigate('/');
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchAuction();
        if (currentUser) socket.emit('registerUser', currentUser.id);
        socket.emit('joinAuction', id);
        socket.on('newHighestBid', (data) => setCurrentBid(data.bidAmount));
        socket.on('bidError', (error) => alert(error.message));
        socket.on('outbid', (data) => alert(data.message));
        socket.on('auctionUpdated', fetchAuction);

        return () => {
            socket.off('newHighestBid');
            socket.off('bidError');
            socket.off('outbid');
            socket.off('auctionUpdated');
        };
    }, [id, currentUser, fetchAuction]);

    const handleBidSubmit = (e) => { e.preventDefault(); if (!currentUser) return alert('You must be logged in.'); socket.emit('placeBid', { auctionId: id, bidAmount: parseFloat(bidAmount), userId: currentUser.id }); setBidAmount(''); };
    const handleAcceptBid = async () => { try { await api.post(`/auctions/${id}/accept`); alert('Bid accepted!'); } catch (error) { alert('Failed to accept bid.'); } };
    const handleRejectBid = async () => { try { await api.post(`/auctions/${id}/reject`); alert('Bid rejected.'); } catch (error) { alert('Failed to reject bid.'); } };
    const handleCounterOffer = async (e) => { e.preventDefault(); if (!counterPrice || parseFloat(counterPrice) <= auction.currentPrice) return alert('Counter must be higher than current bid.'); try { await api.post(`/auctions/${id}/counter`, { newPrice: counterPrice }); alert('Counter-offer sent.'); } catch (error) { alert('Failed to send counter-offer.'); } };
    const handleAcceptCounter = async () => { try { await api.post(`/auctions/${id}/accept-counter`); alert('Counter-offer accepted!'); } catch (error) { alert('Failed to accept counter-offer.'); } };
    const handleRejectCounter = async () => { try { await api.post(`/auctions/${id}/reject-counter`); alert('Counter-offer rejected.'); } catch (error) { alert('Failed to reject counter-offer.'); } };

    if (!auction || !auction.seller) return <div>Loading...</div>;

    const isAuctionOver = new Date() > new Date(auction.endTime);
    const isSeller = currentUser && currentUser.id === auction.sellerId;
    const isHighestBidder = currentUser && auction.highestBidderId && Number(currentUser.id) === Number(auction.highestBidderId);

    return (
        <div style={{ padding: '1rem' }}>
            <h1>{auction.itemName}</h1>
            <p>Sold by: {auction.seller.username}</p>
            <p>{auction.description}</p>
            <hr />
            <div style={{ margin: '20px 0' }}><Countdown endTime={auction.endTime} /></div>
            <h2>Current Highest Bid: ₹{currentBid}</h2>

            {!isAuctionOver && !isSeller && (
                <form onSubmit={handleBidSubmit}>
                    <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder={`Your bid (min ₹${Number(currentBid) + Number(auction.bidIncrement)})`} required />
                    <button type="submit">Place Bid</button>
                </form>
            )}
            {!isAuctionOver && isSeller && <p>This is your auction. Bids will appear in real-time.</p>}
            
            {isAuctionOver && isSeller && auction.status === 'ended' && (
                 <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>Seller Actions</h3>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}><button onClick={handleAcceptBid}>Accept Bid</button><button onClick={handleRejectBid}>Reject Bid</button></div>
                    <form onSubmit={handleCounterOffer}>
                        <label>Make a Counter-Offer:</label>
                        <input type="number" value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)} placeholder="Enter new price" required />
                        <button type="submit">Send Counter</button>
                    </form>
                </div>
            )}

            {auction.status === 'counter-offered' && isHighestBidder && (
                <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #007bff', borderRadius: '8px' }}>
                    <h3>Counter-Offer from Seller</h3>
                    <p>The seller has offered a price of: <strong>₹{auction.counterOfferPrice}</strong></p>
                    <div><button onClick={handleAcceptCounter}>Accept</button><button onClick={handleRejectCounter}>Reject</button></div>
                </div>
            )}
            
            {isAuctionOver && <p style={{ fontWeight: 'bold', marginTop: '20px' }}>Auction Ended</p>}
            {auction.status === 'closed' && auction.winner && <div>Winner: <strong>{auction.winner.username}</strong> at ₹{auction.currentPrice}</div>}
            {auction.status === 'rejected' && <p>The bid was rejected.</p>}
            {auction.status === 'counter-offered' && !isHighestBidder && <p>The seller has made a counter-offer to the highest bidder.</p>}
        </div>
    );
}

export default AuctionRoomPage;
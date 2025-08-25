import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import api from '../api';
import Countdown from '../components/Countdown';

const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;
const socket = io(SOCKET_URL);
const ActionBox = ({ title, children }) => (
  <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)' }}>
    <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{title}</h3>
    {children}
  </div>
);
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

    const handleBidSubmit = (e) => { 
        e.preventDefault(); 
        if (!currentUser) return alert('You must be logged in.'); 
        socket.emit('placeBid', 
            { auctionId: id, 
                bidAmount: parseFloat(bidAmount), 
                userId: currentUser.id }); 
                setBidAmount(''); };
    const handleAcceptBid = async () => { try 
        { await api.post(`/auctions/${id}/accept`); 
            alert('Bid accepted!'); } 
            catch (error) { alert('Failed to accept bid.'); } };
    const handleRejectBid = async () => { 
        try 
        { await api.post(`/auctions/${id}/reject`); 
            alert('Bid rejected.'); } 
            catch (error) { alert('Failed to reject bid.'); } };
    const handleCounterOffer = async (e) => { e.preventDefault(); 
        if (!counterPrice || parseFloat(counterPrice) <= auction.currentPrice) return alert('Counter must be higher than current bid.'); 
        try { await api.post(`/auctions/${id}/counter`, { newPrice: counterPrice }); 
        alert('Counter-offer sent.'); } 
        catch (error) { 
            alert('Failed to send counter-offer.'); } };
    const handleAcceptCounter = async () => { 
        try { 
            await api.post(`/auctions/${id}/accept-counter`); 
            alert('Counter-offer accepted!'); } 
            catch (error) { alert('Failed to accept counter-offer.'); } };
    const handleRejectCounter = async () => { 
        try { await api.post(`/auctions/${id}/reject-counter`); 
            alert('Counter-offer rejected.'); } 
            catch (error) { alert('Failed to reject counter-offer.'); } };

    if (!auction || !auction.seller) return <div>Loading...</div>;

    const isAuctionOver = new Date() > new Date(auction.endTime);
    const isSeller = currentUser && currentUser.id === auction.sellerId;
    const isHighestBidder = currentUser && auction.highestBidderId && 
    Number(currentUser.id) === Number(auction.highestBidderId);
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', 
        gap: '3rem', alignItems: 'start' }}>

            <div className="item-details-column">
                
                <div className="item-info" style={{ marginTop: '2rem' }}>
                    <h1 style={{ marginTop: 0, fontSize: '2.5rem' }}>{auction.itemName}</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Sold by: {auction.seller.username}</p>
                    <div className="details-tabs" style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
                        <h3 style={{ paddingTop: '1rem' }}>Description</h3>
                        <p>{auction.description || "No description provided."}</p>
                    </div>
                </div>
            </div>

            {/* right column  */}
            <div style={{ position: 'sticky', top: '2rem' }}>
                <div className="auction-card" style={{ padding: '2rem' }}>
                    <Countdown endTime={auction.endTime} />
                    <hr style={{ margin: '1.5rem 0' }} />
                    <div>
                        <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '1rem' }}>Current Bid</p>
                        <div className="auction-card-price" style={{ margin: '0.25rem 0 0 0', fontSize: '2.5rem' }}>₹{currentBid}</div>
                    </div>

                    {/* bidding Form */}
                    {!isAuctionOver && !isSeller && (
                        <form onSubmit={handleBidSubmit} style={{ marginTop: '1.5rem' }}>
                            <div className="form-group">
                                <input type="number" value={bidAmount} 
                                onChange={(e) => setBidAmount(e.target.value)} 
                                placeholder={`Min bid: ₹${Number(currentBid) + Number(auction.bidIncrement)}`} required />
                            </div>
                            <button
                             type="submit" className="btn btn-primary" 
                            style={{ width: '100%', padding: '12px', fontSize: '1.1rem' }}>
                            Place Bid
                            </button>
                        </form>
                    )}
                    
                    {!isAuctionOver && isSeller && <p 
                    style={{marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)'}}>
                    This is your auction. Bids will appear in real-time.</p>}
                </div>

                {/* Seller Actions */}
                {isAuctionOver && isSeller && auction.status === 'ended' && (
                    <ActionBox title="Seller Actions">
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                        <button onClick={handleAcceptBid} className="btn btn-primary">
                        Accept Bid
                        </button>
                        <button onClick={handleRejectBid} className="btn btn-secondary">
                        Reject Bid
                        </button>
                        </div>
                        <form onSubmit={handleCounterOffer} className="form-group">
                            <label>Make a Counter-Offer:</label>
                            <input type="number" value={counterPrice} 
                            onChange={(e) => setCounterPrice(e.target.value)} 
                            placeholder="Enter new price" required />
                            <button type="submit" className="btn btn-primary" 
                            style={{marginTop: '0.5rem'}}>Send</button>
                        </form>
                    </ActionBox>
                )}

                {/* Buyer Counter-Offer Response */}
                {auction.status === 'counter-offered' && isHighestBidder && (
                    <ActionBox title="Counter-Offer Received">
                        <p>The seller has offered a price of: 
                        <strong>₹{auction.counterOfferPrice}</strong></p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleAcceptCounter} className="btn btn-primary">
                        Accept</button>
                        <button onClick={handleRejectCounter} className="btn btn-secondary">
                        Reject</button>
                        </div>
                    </ActionBox>
                )}

                {/* Final Status Messages */}
                {auction.status === 'closed' && auction.winner && 
                <ActionBox title="Auction Closed">
                Winner: <strong>{auction.winner.username}</strong> at ₹{auction.currentPrice}
                </ActionBox>}
                {auction.status === 'rejected' && 
                <ActionBox title="Auction Closed">The final bid was rejected.</ActionBox>}
                {auction.status === 'counter-offered' && !isHighestBidder && (
                    <ActionBox title="Status">
                        The seller has made a counter-offer to the highest bidder.
                    </ActionBox>
                )}
            </div>
        </div>
    );
}
export default AuctionRoomPage;
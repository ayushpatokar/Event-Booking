import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaTimesCircle } from 'react-icons/fa';

const UserDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return; // wait for the auth check to finish before deciding
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, authLoading, navigate]);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchBookings();
            } catch (error) {
                alert(error.response?.data?.error || error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    if (authLoading || loading) return <div className="text-center py-20 text-xl font-semibold">Loading dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto animate-fade-in-up">
            {/* Welcome banner — changed to a gradient background instead of plain white,
                matching the indigo/purple/pink accent used on the Home page */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-3xl font-bold uppercase tracking-widest shrink-0 border-2 border-white/30">
                    {user?.name?.charAt(0)}
                </div>
                <div className="flex flex-col items-center sm:items-start">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Welcome, {user?.name}!</h1>
                    <p className="text-white/80 flex items-center justify-center sm:justify-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span> User Dashboard
                    </p>
                    {/* Added: shows the user's email under the welcome text for a bit more personalization */}
                    {user?.email && (
                        <p className="text-white/70 text-sm mt-1">{user.email}</p>
                    )}
                </div>
            </div>

            {/* Added: quick stats row summarizing the user's bookings at a glance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-3xl font-black text-indigo-600">{bookings.length}</p>
                    <p className="text-gray-500 text-sm font-medium mt-1">Total Requests</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-3xl font-black text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</p>
                    <p className="text-gray-500 text-sm font-medium mt-1">Confirmed</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-3xl font-black text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</p>
                    <p className="text-gray-500 text-sm font-medium mt-1">Pending</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                    <FaTicketAlt className="text-indigo-600" /> My Booking Requests
                </h2>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTicketAlt className="text-indigo-300 text-3xl" />
                    </div>
                    <p className="text-xl text-gray-500 mb-6 mt-4 font-medium">You haven't booked any events yet.</p>
                    {/* Changed: gradient button, matches Home page's "View Details" style */}
                    <Link to="/" className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-md hover:shadow-lg">
                        Browse Events
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col hover:-translate-y-1 duration-300">
                            <div className="p-6 border-b border-gray-50 flex-grow">
                                {booking.eventId ? (
                                    <>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{booking.eventId.title}</h3>
                                            <div className="flex flex-col gap-1 items-end">
                                                <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                                {booking.status !== 'cancelled' && (
                                                    <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {booking.paymentStatus?.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-4 space-y-1">
                                            <p><strong className="text-gray-700">Date:</strong> {new Date(booking.eventId.date).toLocaleDateString()}</p>
                                            <p><strong className="text-gray-700">Amount:</strong> {booking.amount === 0 ? 'Free' : `₹${booking.amount}`}</p>
                                            <p><strong className="text-gray-700">Requested:</strong> {new Date(booking.bookedAt).toLocaleDateString()}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-red-500 italic">Event details unavailable (might have been deleted)</p>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-between items-center shrink-0">
                                {booking.eventId && booking.status !== 'cancelled' ? (
                                    <>
                                        <Link to={`/events/${booking.eventId._id}`} className="text-indigo-600 font-semibold text-sm hover:underline">View Event</Link>
                                        <button
                                            onClick={() => cancelBooking(booking._id)}
                                            className="text-red-500 font-semibold text-sm hover:text-red-700 transition flex items-center gap-1"
                                        >
                                            <FaTimesCircle /> Cancel
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full text-center text-sm text-gray-500 italic">Booking Cancelled</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
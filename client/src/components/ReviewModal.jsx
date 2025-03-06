import React, { useState } from 'react';
import { Modal } from './Modal';
import { TicketRating } from './TicketRating';
import { useUser } from '../context/UserContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const ReviewModal = ({ isOpen, onClose, movieId, movieTitle, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { dbUser } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: dbUser._id,
                    movieId,
                    rating,
                    reviewText
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            const data = await response.json();
            onReviewSubmitted?.(data);
            handleClose();
        } catch (err) {
            setError(err.message || 'Failed to submit review');
            console.error('Review submission error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setReviewText('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-6 max-w-lg w-full">
                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                    Rate & Review {movieTitle}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center mb-6">
                        <TicketRating
                            rating={rating}
                            onChange={setRating}
                            interactive={true}
                            size="lg"
                            color="#ff4b4b"
                            precision={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Your Review
                        </label>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="w-full h-32 p-3 bg-gray-700 rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff4b4b]"
                            placeholder="Share your thoughts about the movie..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            500 Chars
                        </label>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="px-4 py-2 bg-[#ff4b4b] text-white rounded-lg hover:bg-[#ff716d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
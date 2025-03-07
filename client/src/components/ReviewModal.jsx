import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { TicketRating } from './TicketRating';
import { useUser } from '../context/UserContext';
import '../styles/ReviewModal.css';
import { useToast } from './Toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const ReviewModal = ({ isOpen, onClose, movieId, movieTitle, onReviewSubmitted, existingReview }) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { dbUser } = useUser();
    const { addToast } = useToast();

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setReviewText(existingReview.reviewText || '');
        } else {
            setRating(0);
            setReviewText('');
        }
    }, [existingReview, isOpen]);

    const addToTierList = async () => {
        try {
            const response = await fetch(`${API_URL}/api/tier-lists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: dbUser._id,
                    movieId,
                    rank: "U",
                    order: 1
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add to tier list');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error adding to tier list:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

            try {
                let response;
                if (existingReview) {
                    response = await fetch(`${API_URL}/api/reviews/${existingReview._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            rating,
                            reviewText
                        }),
                    });
            } else {
                response = await fetch(`${API_URL}/api/reviews`, {
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
            }

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            if(!existingReview) {
                try {
                    console.log("Adding to tier list with rank U");
                    const response = await fetch(`${API_URL}/api/tier-lists`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            userId: dbUser._id,
                            movieId,
                            rank: "U",
                            order: 1
                        })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        console.log("Tier list entry created:", data);
                        // setIsInTierList(true);
                        // setTierListEntryId(data._id);
                        // await checkMovieStatus();
                        alert('Added to tier list successfully!');
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Unknown error');
                    }
                } catch (error) {
                    console.error('Error adding to tier list:', error);
                    alert(`Failed to add to tier list: ${error.message}`);
                }
            }

            const happening = `${dbUser.username} ${existingReview ? 'updated their review of' : 'gave'} ${movieTitle} ${existingReview ? 'to' : ''} ${rating} ${rating === 1 ? 'ticket' : 'tickets'}`;
            await fetch(`${API_URL}/api/user-happenings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: dbUser._id, happening })
                }
            )

            const data = await response.json();
            onReviewSubmitted?.(data);
            addToast(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!', 'success');
            handleClose();
        } catch (err) {
            setError(err.message || 'Failed to submit review');
            addToast(err.message || 'Failed to submit review', 'error');
            console.error('Review submission error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!existingReview) {
            setRating(0);
            setReviewText('');
        }
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
                <div className="review-modal-header">
                    <h2>{existingReview ? 'Edit Review' : 'Rate & Review'} {movieTitle}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="review-modal-body">

                        <div className="flex justify-center mb-6">
                            <TicketRating
                                rating={rating}
                                onChange={setRating}
                                interactive={true}
                                size="lg"
                                color="#ff4b4b"
                            />
                        </div>

                        <div>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="review-textarea"
                                placeholder="Share your thoughts about the movie..."
                                maxLength={500}
                            />
                            <div className="review-char-count">
                                {reviewText.length}/500 characters
                            </div>
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>

                    <div className="review-modal-footer">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="review-modal-button cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="review-modal-button submit"
                        >
                            {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                        </button>
                    </div>
                </form>
        </Modal>
    );
};
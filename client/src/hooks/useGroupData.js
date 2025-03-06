// client/src/hooks/useGroupData.js
import { useState, useEffect, useCallback } from 'react';
import { groupAPI } from '../services/groupAPI';
import { tmdbAPI } from '../services/tmdbAPI';

const mockGroups = {
    '1': {
        id: '1',
        name: 'Movie Buffs',
        members: [
            { id: '1', name: 'FatalSnipes_1', avatar: 'F' },
            { id: '2', name: 'FatalSnipes_2', avatar: 'F' },
            { id: '3', name: 'FatalSnipes_3', avatar: 'F' },
            { id: '4', name: 'FatalSnipes_4', avatar: 'F' },
            { id: '5', name: 'FatalSnipes_5', avatar: 'F' },
            { id: '6', name: 'FatalSnipes_6', avatar: 'F' },
        ],
        activity: [
            { id: '1', user: 'John', action: 'gave', movie: 'Nosferatu', rating: 4.5, timestamp: '2 hours ago' },
            { id: '2', user: 'John', action: 'gave', movie: 'Nosferatu', rating: 4.5, timestamp: '1 day ago' },
            { id: '3', user: 'John', action: 'gave', movie: 'Nosferatu', rating: 4.5, timestamp: '2 days ago' }
        ],
        scores: [
            {
                id: '1',
                movie: 'Moonlight',
                poster: 'https://image.tmdb.org/t/p/w200/93nKrUO92ONl8x6tWv7xj2qVPQz.jpg',
                rating: 4.5
            },
            {
                id: '2',
                movie: 'Schindler\'s List',
                poster: 'https://image.tmdb.org/t/p/w200/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
                rating: 4.5
            }
        ],
        showtime: {
            date: 'Feb 16th',
            time: '8:00 PM',
            attending: [
                { id: '1', name: 'F', status: 'no' }
            ]
        }
    },
    '2': {
        id: '2',
        name: 'Sci-Fi Lovers',
        members: [
            { id: '1', name: 'FatalSnipes_1', avatar: 'F' },
            { id: '4', name: 'FatalSnipes_4', avatar: 'F' },
        ],
        activity: [
            { id: '1', user: 'Alex', action: 'added', movie: 'Blade Runner 2049', timestamp: '5 hours ago' },
            { id: '2', user: 'John', action: 'rated', movie: 'The Matrix', rating: 5, timestamp: '3 days ago' },
        ],
        scores: [
            {
                id: '1',
                movie: 'Blade Runner 2049',
                poster: 'https://image.tmdb.org/t/p/w200/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
                rating: 4.5
            },
            {
                id: '2',
                movie: 'The Matrix',
                poster: 'https://image.tmdb.org/t/p/w200/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
                rating: 4.5
            }
        ],
        showtime: {
            date: 'Mar 10th',
            time: '7:30 PM',
            attending: [
                { id: '1', name: 'F', status: 'yes' }
            ]
        }
    }
};

const mockScores = [
    {
        id: '1',
        movieId: '123',
        movie: 'Moonlight',
        poster: 'https://image.tmdb.org/t/p/w200/93nKrUO92ONl8x6tWv7xj2qVPQz.jpg',
        rating: 4.5
    },
    {
        id: '2',
        movieId: '456',
        movie: 'Schindler\'s List',
        poster: 'https://image.tmdb.org/t/p/w200/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
        rating: 4.5
    }
];

export const useGroupData = (groupId) => {
    const [groupData, setGroupData] = useState(null);
    const [members, setMembers] = useState([]);
    const [activity, setActivity] = useState([]);
    const [scores, setScores] = useState([]);
    const [movieNights, setMovieNights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGroupMovieRatings = async (movies) => {
        try {
            const movieRatings = await Promise.all(
                movies.map(async (movie) => {
                    try {
                        const ratingData = await groupAPI.getMovieAverageRating(groupId, movie.id);

                        return {
                            id: movie.id,
                            movieId: movie.id,
                            movie: movie.title,
                            poster: movie.poster_path ?
                                `https://image.tmdb.org/t/p/w200${movie.poster_path}` :
                                'https://via.placeholder.com/200x300?text=No+Poster',
                            rating: ratingData.averageRating
                        };
                    } catch (err) {
                        console.warn(`Error fetching rating for movie ${movie.id}:`, err);
                        return null;
                    }
                })
            );

            return movieRatings.filter(rating => rating && rating.rating);
        } catch (err) {
            console.error('Error fetching movie ratings:', err);
            return mockScores;
        }
    };

    // useEffect(() => {
    //     const fetchGroupData = async () => {
    const fetchGroupData = useCallback(async () => {

        if (!groupId) return;

        setLoading(true);
        try {
            const group = await groupAPI.getGroupById(groupId);
            setGroupData(group);

            const membersData = await groupAPI.getGroupMembers(groupId);
            const transformedMembers = membersData.map(member => ({
                id: member._id || member.id,
                name: member.username || member.name,
                avatar: (member.username || member.name).charAt(0).toUpperCase()
            }));
            setMembers(transformedMembers);

            const nights = await groupAPI.getGroupMovieNights(groupId);
            setMovieNights(nights || []);

            // const uniqueMovies = [...new Set(nights.map(night => night.movieId))]
            //     .filter(movieId => movieId);

            const uniqueMovies = [];

            // Fetch movie details and ratings
            if (uniqueMovies.length > 0) {
                const movieDetails = await Promise.all(
                    uniqueMovies.map(movieId => tmdbAPI.getMovieDetails(movieId))
                );
                const movieRatings = await fetchGroupMovieRatings(movieDetails);
                setScores(movieRatings);
            } else {
                setScores(mockScores);
            }

            setActivity([
                { id: '1', user: 'John', action: 'gave', movie: 'Nosferatu', rating: 4.5, timestamp: '2 hours ago' },
                { id: '2', user: 'Sarah', action: 'gave', movie: 'Interstellar', rating: 5, timestamp: '1 day ago' }
            ]);

        } catch (err) {
            console.error('Error fetching group data:', err);
            if (mockGroups[groupId]) {
                console.log('Using mock data for group', groupId);
                setGroupData(mockGroups[groupId]);
                setMembers(mockGroups[groupId].members);
                setActivity(mockGroups[groupId].activity);
                setScores(mockGroups[groupId].scores);
                setMovieNights([]);
            } else {
                console.error('Error fetching group data:', err);
                setActivity([]);
                setScores(mockScores);
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchGroupData();
    }, [fetchGroupData]);

    // const getNextShowtime = () => {
    //     if (!movieNights.length) return null;
    //
    //     const nextNight = movieNights
    //         .filter(night => new Date(night.dateTime) > new Date())
    //         .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))[0];
    //
    //     if (!nextNight) return null;
    //
    //     return {
    //         date: new Date(nextNight.dateTime).toLocaleDateString('en-US', {
    //             month: 'short',
    //             day: 'numeric'
    //         }),
    //         time: new Date(nextNight.dateTime).toLocaleTimeString('en-US', {
    //             hour: 'numeric',
    //             minute: '2-digit'
    //         }),
    //         movieId: nextNight.movieId,
    //         movieDetails: nextNight.movieDetails
    //     };
    // };

    const showtime = movieNights.length > 0 ?
        movieNights
            .filter(night => new Date(night.dateTime) > new Date())
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
            .map(night => ({
                date: new Date(night.dateTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }),
                time: new Date(night.dateTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                }),
                attending: [],
                movieDetails: night.movieDetails
            }))[0]
        : mockGroups[groupId]?.showtime || null;

    const refreshData = useCallback(() => {
    setLoading(true);
    fetchGroupData();
    }, [fetchGroupData]);

    return {
        groupData,
        members,
        activity,
        scores,
        movieNights,
        // showtime: getNextShowtime(),
        showtime,
        loading,
        error,
        refreshData
    };
};
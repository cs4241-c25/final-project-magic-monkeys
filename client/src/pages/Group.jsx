import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { useAuth0 } from '@auth0/auth0-react';
import { BiChevronDown, BiFilterAlt, BiPlus, BiCog } from 'react-icons/bi';
import { BsTicketFill, BsTicket } from "react-icons/bs";
import '../styles/Dashboard.css';
import '../styles/Group.css';

export const Group = () => {
    const { groupId } = useParams();
    const { user, isLoading, isAuthenticated } = useAuth0();
    const navigate = useNavigate();

    const [isExpanded, setIsExpanded] = useState(false);
    const [groupData, setGroupData] = useState(null);
    const [activeTab, setActiveTab] = useState('activity');

    // Mock data for development
    const mockGroups = {
        '1': {
            id: '1',
            name: 'Movie Buffs',
            members: [
                { id: '1', name: 'John Doe', avatar: 'J' },
                { id: '2', name: 'Jane Smith', avatar: 'J' },
                { id: '3', name: 'Sam Wilson', avatar: 'S' },
            ],
            activity: [
                { id: '1', user: 'John', action: 'added', movie: 'Oppenheimer', timestamp: '2 hours ago' },
                { id: '2', user: 'Jane', action: 'rated', movie: 'Dune', rating: 4.5, timestamp: '1 day ago' },
                { id: '3', user: 'Sam', action: 'commented', movie: 'Interstellar', comment: 'This was amazing!', timestamp: '2 days ago' }
            ],
            watchlist: [
                { id: '1', title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w200/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg' },
                { id: '2', title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
                { id: '3', title: 'Interstellar', poster: 'https://image.tmdb.org/t/p/w200/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
                { id: '4', title: 'Arrival', poster: 'https://image.tmdb.org/t/p/w200/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg' },
            ],
            reviews: [
                {
                    id: '1',
                    user: 'John',
                    movie: 'Oppenheimer',
                    poster: 'https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
                    rating: 5,
                    content: 'A masterpiece of modern cinema. The cinematography and acting were superb.'
                },
                {
                    id: '2',
                    user: 'Jane',
                    movie: 'Dune',
                    poster: 'https://image.tmdb.org/t/p/w200/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
                    rating: 4,
                    content: 'Visually stunning with great world-building. Looking forward to Part Two!'
                }
            ]
        },
        '2': {
            id: '2',
            name: 'Sci-Fi Lovers',
            members: [
                { id: '1', name: 'John Doe', avatar: 'J' },
                { id: '4', name: 'Alex Johnson', avatar: 'A' },
            ],
            activity: [
                { id: '1', user: 'Alex', action: 'added', movie: 'Blade Runner 2049', timestamp: '5 hours ago' },
                { id: '2', user: 'John', action: 'rated', movie: 'The Matrix', rating: 5, timestamp: '3 days ago' },
            ],
            watchlist: [
                { id: '1', title: 'Blade Runner 2049', poster: 'https://image.tmdb.org/t/p/w200/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg' },
                { id: '2', title: 'The Matrix', poster: 'https://image.tmdb.org/t/p/w200/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
                { id: '3', title: 'Interstellar', poster: 'https://image.tmdb.org/t/p/w200/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
            ],
            reviews: [
                {
                    id: '1',
                    user: 'Alex',
                    movie: 'Blade Runner 2049',
                    poster: 'https://image.tmdb.org/t/p/w200/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
                    rating: 5,
                    content: 'A worthy sequel to the original. The visuals are breathtaking.'
                }
            ]
        }
    };

    // Fetch group data
    useEffect(() => {
        if (groupId) {
            // Simulate API call with mock data
            if (mockGroups[groupId]) {
                setGroupData(mockGroups[groupId]);
            } else {
                // Group not found or user doesn't have access
                navigate('/dashboard');
            }
        }
    }, [groupId, navigate]);

    if (isLoading) return <div>Loading Group...</div>;
    if (!isAuthenticated) navigate('/');
    if (!groupData) return <div>Loading Group Data...</div>;

    return (
        <div className="dashboard-container">
            <SideNav
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
            />
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="group-info">
                        <h1>{groupData.name}</h1>
                        <div className="group-members-preview">
                            {groupData.members.map((member, index) => (
                                <div key={index} className="member-avatar" title={member.name}>
                                    {member.avatar}
                                </div>
                            ))}
                            <button className="add-member-button">
                                <BiPlus />
                            </button>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="settings-button">
                            <BiCog />
                        </button>
                    </div>
                </header>

                <div className="dashboard-content">
                    {/* Activity Feed */}
                    <div className="content-section group-activity">
                        <h2>
                            Group Activity
                            <BiChevronDown className="section-chevron" />
                        </h2>
                        <div className="happenings-content">
                            {groupData.activity.map((item) => (
                                <div key={item.id} className="happening-item">
                                    <span className="user">{item.user}</span>
                                    <span className="action">{item.action}</span>
                                    <span className="movie">{item.movie}</span>
                                    {item.rating && (
                                        <div className="activity-rating">
                                            {Array(Math.floor(item.rating)).fill().map((_, i) => (
                                                <BsTicketFill key={i} />
                                            ))}
                                            {item.rating % 1 !== 0 && <BsTicket />}
                                            <span className="rating-value">({item.rating}/5)</span>
                                        </div>
                                    )}
                                    {item.comment && (
                                        <p className="activity-comment">"{item.comment}"</p>
                                    )}
                                    <span className="timestamp">{item.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Group Watchlist */}
                    <div className="content-section group-watchlist">
                        <h2>
                            Group Watchlist
                            <BiChevronDown className="section-chevron" />
                            <div className="header-actions">
                                <button className="add-movie-button">
                                    <BiPlus />
                                    <span>Add Movie</span>
                                </button>
                                <BiFilterAlt className="filter-icon" />
                            </div>
                        </h2>
                        <div className="watchlist-grid">
                            {groupData.watchlist.map((movie) => (
                                <div key={movie.id} className="watchlist-item">
                                    <img src={movie.poster} alt={movie.title} />
                                    <div className="movie-title">{movie.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Group Reviews */}
                    <div className="content-section group-reviews">
                        <h2>
                            Group Reviews
                            <BiChevronDown className="section-chevron" />
                            <BiFilterAlt className="filter-icon" />
                        </h2>
                        <div className="reviews-list">
                            {groupData.reviews.map((review) => (
                                <div key={review.id} className="review-card">
                                    <img
                                        src={review.poster}
                                        alt={review.movie}
                                    />
                                    <div className="review-content">
                                        <h4>{review.movie}</h4>
                                        <p className="review-author">by {review.user}</p>
                                        <div className="rating-tickets">
                                            {Array(review.rating).fill().map((_, i) => (
                                                <BsTicketFill key={i} />
                                            ))}
                                            {Array(5 - review.rating).fill().map((_, i) => (
                                                <BsTicket key={i} />
                                            ))}
                                        </div>
                                        <p>{review.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="content-section group-members">
                        <h2>
                            Members
                            <BiChevronDown className="section-chevron" />
                            <button className="invite-button">
                                <BiPlus />
                                <span>Invite</span>
                            </button>
                        </h2>
                        <div className="members-list">
                            {groupData.members.map((member) => (
                                <div key={member.id} className="member-item">
                                    <div className="member-avatar">{member.avatar}</div>
                                    <div className="member-name">{member.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Group;
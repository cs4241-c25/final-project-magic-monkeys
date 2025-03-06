import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { useAuth0 } from '@auth0/auth0-react';
import { BiChevronDown, BiFilterAlt, BiPlus, BiCog } from 'react-icons/bi';
import { BsTicketFill, BsTicket } from "react-icons/bs";
import '../styles/Dashboard.css';
import '../styles/Group.css';
import {useGroupData} from "../hooks/useGroupData";
import { TicketRating } from '../components/TicketRating';
import { useUser } from '../context/UserContext';
import { MovieNightSchedulerModal } from '../components/MovieNightSchedulerModal';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const Group = () => {
    const { groupId } = useParams();
    const { isLoading, isAuthenticated } = useAuth0();
    const { dbUser } = useUser();
    const navigate = useNavigate();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isSchedulerOpen, setSchedulerOpen] = useState(false);

    const {
        groupData,
        members,
        activity,
        scores,
        movieNightSchedules,
        movieNights,
        showtime,
        loading,
        error,
        refreshData
    } = useGroupData(groupId);

    // Mock data
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
                { id: '3', user: 'John', action: 'gave', movie: 'Nosferatu', rating: 4.5, timestamp: '2 days ago' },
                { id: '4', user: 'John', action: 'gave', movie: 'Nosferatu', rating: 4.5, timestamp: '3 days ago' },
                { id: '5', user: 'John', action: 'gave', movie: 'Nosferatu', rating: 4.5, timestamp: '4 days ago' },
                { id: '6', user: 'John', action: 'gave', movie: 'Nosferatu', rating: 4.5, timestamp: '5 days ago' },
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
                },
                {
                    id: '3',
                    movie: 'Moonlight',
                    poster: 'https://image.tmdb.org/t/p/w200/93nKrUO92ONl8x6tWv7xj2qVPQz.jpg',
                    rating: 4.5
                },
                {
                    id: '4',
                    movie: 'Moonlight',
                    poster: 'https://image.tmdb.org/t/p/w200/93nKrUO92ONl8x6tWv7xj2qVPQz.jpg',
                    rating: 4.5
                },
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
                },
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

    const generateCalendar = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Get the first day of the month
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

        const dates = [];

        // Add last month's days to fill the first row
        const firstDayIndex = firstDayOfMonth.getDay();
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth, -i);
            dates.push({
                day: date.getDate(),
                month: date.getMonth() + 1,
                isCurrentMonth: false,
                hasEvent: false
            });
        }

        // Add this month's days
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const date = new Date(currentYear, currentMonth, i);
            let hasEvent = false;
            
            if(movieNightSchedules){
                movieNightSchedules.forEach(night => {
                    const nightDate = new Date(night.dateTime);
                    if(!night.recurring && nightDate.getDate() === i &&
                        nightDate.getMonth() === currentMonth &&
                        nightDate.getFullYear() === currentYear) {
                            hasEvent = true;
                        }
                });
            }

            if(movieNightSchedules){
                movieNightSchedules.forEach(night => {
                    if(night.recurring && night.recurrenceDays) {
                        const startDate = new Date(night.startDate);
                        const endDate = night.endDate ? new Date(night.endDate) : null;
                        const weekday = date.toLocaleDateString('en-US', { weekday: "long" });

                        if(date >= startDate && (!endDate || date <= endDate) && night.recurrenceDays.includes(weekday)) {
                            hasEvent = true;
                        }
                    }
                });
            }

            dates.push({
                day: i,
                month: currentMonth + 1,
                isCurrentMonth: true,
                hasEvent
            });
        }

        // If needed, fill the last row with next month's days
        const lastRowDays = 7 - (dates.length % 7);
        if (lastRowDays < 7) {
            for (let i = 1; i <= lastRowDays; i++) {
                dates.push({
                    day: i,
                    month: currentMonth + 2 > 12 ? 1 : currentMonth + 2,
                    isCurrentMonth: false,
                    hasEvent: false
                });
            }
        }

        return { days, dates };
    };

    const leaveGroup = async () => {
        try {
            await axios.delete(`${API_URL}/api/user-groups/${dbUser._id}/${groupId}`);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error deleting group membership:', error);
            throw error;
        }
    };

    const calendar = generateCalendar();

    if (isLoading || loading) return <div>Loading Group...</div>;
    if (!isAuthenticated) {
        navigate('/');
        return null;
    }
    // if (!groupData) return <div>Loading Group Data...</div>;

    if (error) {
        return (
            <div className="error-container">
                <h2>Error loading group</h2>
                <p>{error.message}</p>
                <button onClick={refreshData} className="retry-button">
                    Try Again
                </button>
            </div>
        );
    }

    if (!groupData) return <div>Group not found</div>;

    return (
        <div className="dashboard-container">
            <SideNav
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
            />
            <main className="dashboard-main">
                <div className="group-header">
                    <h1>{groupData.name}</h1>
                    <button
                        type="button"
                        onClick={leaveGroup}
                        class="px-4 py-2 text-white bg-[#373737] hover:bg-[#444444] rounded-lg transition-colors"
                    >Leave Group</button>
                </div>

                <div className="group-content">
                    {/* Top Section */}
                    <div className="group-top-section">
                        <div className="group-showtime">
                            <div>
                                <button 
                                    onClick={() => setSchedulerOpen(true)}
                                    className="bg-green-500 text-white px-4 py-2 rounded">
                                    Schedule Movie Night
                                </button>
                                <MovieNightSchedulerModal 
                                    isOpen={isSchedulerOpen} 
                                    onClose={() => setSchedulerOpen(false)} 
                                    groupId={groupId} 
                                    refreshData={refreshData} 
                                />
                            </div>
                            <div className="showtime-date">
                                {showtime?.date || 'No showtime scheduled'}
                            </div>
                            {showtime?.time && (
                                <div className="showtime-time">{showtime.time}</div>
                            )}
                            {showtime?.movieDetails && (
                                <div className="showtime-movie">
                                    {showtime.movieDetails.title}
                                </div>
                            )}
                            <div className="showtime-status">
                                <div className="status-icons">
                                    <div className="status-icon no">
                                    {showtime?.attending.map(attendee => (
                                        <span key={attendee.id}>{attendee.profilePicture}</span>

                                    ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group-calendar">
                            <div className="calendar-header">
                                {calendar.days.map(day => (
                                    <div key={day} className="calendar-day-name">{day}</div>
                                ))}
                            </div>
                            <div className="calendar-grid">
                                {calendar.dates.map((date, index) => (
                                    <div
                                        key={index}
                                        className={`calendar-date 
                                            ${date.isCurrentMonth ? 'current-month' : 'other-month'}
                                            ${date.hasEvent ? 'has-event bg-blue-500 text-white font-bold' : ''}`}
                                    >
                                        {date.day}
                                        {date.hasEvent && (
                                            <span className="event-indicator">🎬</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle Section */}
                    <div className="group-middle-section">
                        <div className="group-members-box">
                            <h2>Members</h2>
                            <div className="members-grid">
                                {members.map(member => (
                                    <div key={member.id} className="member-card">
                                        <div className="member-avatar">{member.avatar}</div>
                                        <div className="member-name">{member.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="group-activity-box">
                            <div className="activity-header">
                                <h2>The Happenings</h2>
                            </div>
                            <div className="activity-list-container">
                                <div className="activity-list">
                                    {activity.map(item => (
                                        <div key={item.id} className="activity-item">
                                            <span className="bullet">•</span>
                                            <span className="activity-user">{item.user}</span>
                                            <span className="activity-action">{item.action}</span>
                                            <span className="activity-movie">{item.movie}</span>
                                            {item.rating && (
                                                <span className="activity-text">a {item.rating} out of 5 tickets</span>
                                            )}
                                            <span className="activity-timestamp">{item.timestamp}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="group-bottom-section">
                        <div className="group-scores-box">
                            <div className="scores-header">
                                <h2>Group Scores</h2>
                                <div className="scores-sort">
                                    <span>Date</span>
                                </div>
                            </div>

                            <div className="score-container">
                                <div className="scores-list">

                                    {scores.map(score => (
                                        <div key={score.id} className="review-card">

                                            {/*<div className="score-poster">*/}
                                            {/*    <img src={score.poster} alt={score.movie}/>*/}
                                            {/*    */}
                                                <img
                                                    src={score.poster}
                                                    alt={score.movie}
                                                />
                                            {/*</div>*/}
                                            <div className="review-content">
                                                <h4>{score.movie}</h4>
                                                {/*<div className="score-rating">{score.rating}</div>*/}
                                                <div className="ticket-rating-container">
                                                    <TicketRating
                                                        rating={score.rating}
                                                        size="lg"
                                                        color="#ff4b4b"
                                                    />
                                                    {/*  <TicketRating rating={i === 4 ? 5 : 4}/>*/}

                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="group-tierlist-box">
                            <h2>Tier List</h2>
                            <div className="tierlist-placeholder">
                                <span>Coming soon...</span>

                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
);
};

export default Group;
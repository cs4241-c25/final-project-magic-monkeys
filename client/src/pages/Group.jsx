import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { useAuth0 } from '@auth0/auth0-react';
import { BiMenu } from 'react-icons/bi';
import '../styles/Dashboard.css';
import '../styles/Group.css';
import {useGroupData} from "../hooks/useGroupData";
import { TicketRating } from '../components/TicketRating';
import { useUser } from '../context/UserContext';
import { MovieNightSchedulerModal } from '../components/MovieNightSchedulerModal';
import { GroupMemberPermissionsModal } from '../components/GroupMemberPermissionsModal';
import axios from 'axios';
import { useToast } from '../components/Toast';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const Group = () => {
    const { groupId } = useParams();
    const { isLoading, isAuthenticated } = useAuth0();
    const { dbUser } = useUser();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            if(!dbUser || !dbUser._id) return;
            try{
                const response = await axios.get(`${API_URL}/api/user-groups/check/${dbUser._id}/${groupId}`);
                setUserRole(response.data.role);
            } catch(error){
                console.error("Error fetchinguser role:", error);
                setUserRole(null);
            }
        };

        fetchUserRole();
    }, [groupId, dbUser]);

    const [showMenu, setShowMenu] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSchedulerOpen, setSchedulerOpen] = useState(false);
    const [isPermissionModalOpen, setPermissionModalOpen] = useState(false);
    const [selectedMovieNight, setSelectedMovieNight] = useState(null);

    const today = new Date();
    const initStartOfThisWeek = new Date(today.setDate(today.getDate() - today.getDay() - 1));
    const [displayedWeekStart, setDisplayedWeekStart] = useState(initStartOfThisWeek);

    const resetDisplayWeekStart = () => {
        const today = new Date();
        const startOfThisWeek = new Date(today.setDate(today.getDate() - today.getDay() - 1));
        setDisplayedWeekStart(startOfThisWeek);
    }

    const [expandedDay, setExpandedDay] = useState(null);

    const toggleExpandDay = (index) => {
        setExpandedDay((prev) => (prev === index ? null : index));
    }

    const [expandedRow, setExpandedRow] = useState(null);

    const toggleExpandRow = (index) => {
        const rowIndex = Math.floor(index / 7);
        setExpandedRow((prev) => (prev === rowIndex ? null : rowIndex));
    };

    const [isCalendarCondensed, setIsCalendarCondensed] = useState(true);

    const toggleCalendarView = () => {
        setIsCalendarCondensed((prev) => {
            const newState = !prev;
            
            if(newState){
                const today = new Date();
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
                resetDisplayWeekStart();
            }
    
            return newState;
        });
    };

    const calendarRef = useRef(null);
    const [calendarHeight, setCalendarHeight] = useState(0);
    const dateRefs = useRef({});

    const scrollToMovieNight = (event) => {
        const eventDate = new Date(event.dateTime);
        const eventYear = eventDate.getFullYear();
        const eventMonth = eventDate.getMonth();

        if(isCalendarCondensed){
            const startOfEventWeek = new Date(eventDate);
            startOfEventWeek.setDate(eventDate.getDate() - eventDate.getDay() - 1);

            const endOfEventWeek = new Date(startOfEventWeek);
            endOfEventWeek.setDate(startOfEventWeek.getDate() + 7);

            const today = new Date();
            const startOfCurrentWeek = new Date(today.setDate(today.getDate() - today.getDay() - 1));
            const endOfCurrentWeek = new Date(startOfCurrentWeek);
            endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 7);

            const isInCurrentWeek = eventDate >= startOfCurrentWeek && eventDate <=endOfCurrentWeek;

            if(!isInCurrentWeek){
                setCurrentYear(eventYear);
                setCurrentMonth(eventMonth);
                setDisplayedWeekStart(startOfEventWeek);

                setTimeout(() => {
                    scrollToDate(eventDate);
                }, 300);
            } else{
                scrollToDate(eventDate);
            }   
        } else{
            if(eventYear !== currentYear || eventMonth !== currentMonth){
                setCurrentYear(eventYear);
                setCurrentMonth(eventMonth);
    
                setTimeout(() => {
                    scrollToDate(eventDate);
                }, 300);
            } else{
                scrollToDate(eventDate);
            }
        }
    };

    const scrollToDate = (eventDate) => {
        const key = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}-${eventDate.getDate()}`;

        if(dateRefs.current[key]){
            dateRefs.current[key].scrollIntoView({ behavior: "smooth", block: "center" });

            const element = dateRefs.current[key];
            element.classList.add("flash-highlight");

            setTimeout(() => {
                element.classList.add("fade-out");
            }, 500);

            setTimeout(() => {
                element.classList.remove("flash-highlight", "fade-out");
            }, 1500);
        }
    }

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const changeMonth = (direction) => {
        if(isCalendarCondensed) return;

        setCurrentMonth((prevMonth) => {
            let newMonth = prevMonth + direction;

            if(newMonth < 0){
                return 11;
            } else if(newMonth > 11){
                return 0;
            }
            return newMonth;
        });

        setCurrentYear((prevYear) => {
            if(direction === -1 && currentMonth === 0){
                return prevYear - 1;
            } else if(direction === 1 && currentMonth === 11){
                return prevYear + 1
            }
            return prevYear
        });
    };

    const getCurrentWeek = (dates) => {
        if(!displayedWeekStart) return dates;

        return dates.filter(date => {
            const weekStart = new Date(displayedWeekStart);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);

            const dateObj = new Date(date.year, date.month - 1, date.day);
            return dateObj >= weekStart && dateObj <= weekEnd;
        })
    };

    const { addToast } = useToast();

    const {
        groupData,
        members,
        activity,
        scores,
        movieNightSchedules,
        movieNights,
        loading,
        error,
        refreshData
    } = useGroupData(groupId);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const generateCalendar = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        // Get the first day of the month
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

        const dates = [];

        // Add last month's days to fill the first row
        const firstDayIndex = firstDayOfMonth.getDay();
        const previousMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - 1, previousMonthLastDay - i);
            dates.push({
                day: date.getDate(),
                month: date.getMonth() + 1 < 1 ? 12 : date.getMonth() + 1,
                year: date.getMonth() + 1 < 1 ? date.getFullYear() - 1 : date.getFullYear(),
                isCurrentMonth: false,
                events: []
            });
        }

        // Add this month's days
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            dates.push({
                day: i,
                month: currentMonth + 1,
                year: currentYear,
                isCurrentMonth: true,
                events: []
            });
        }

        // If needed, fill the last row with next month's days
        const lastRowDays = 7 - (dates.length % 7);
        if (lastRowDays < 7) {
            for (let i = 1; i <= lastRowDays; i++) {
                dates.push({
                    day: i,
                    month: currentMonth + 2 > 12 ? 1 : currentMonth + 2,
                    year: currentMonth + 2 > 12 ? currentYear + 1 : currentYear,
                    isCurrentMonth: false,
                    events: []
                });
            }
        }

        const calculateEndTime = (startTime, duration) => {
            if(!startTime || !duration) return null;
            const startDate = new Date(startTime);
            startDate.setMinutes(startDate.getMinutes() + duration);
            return startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        dates.forEach(date => {
            movieNightSchedules.forEach(event => {
                const eventDate = new Date(event.dateTime);
                const eventStartTime = new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const eventEndTime = calculateEndTime(event.dateTime, event.duration);
                const eventTimeDisplay = eventEndTime ? `${eventStartTime} - ${eventEndTime}` : eventStartTime;

                if(!event.recurring){
                    if(eventDate.getDate() === date.day &&
                    eventDate.getMonth() + 1 === date.month &&
                    eventDate.getFullYear() === date.year){
                        date.events.push({
                            movieNightSchedule: event,
                            time: eventTimeDisplay,
                            startTimestamp: new Date(event.dateTime).getTime(),
                        });
                    }
                }
            });

            movieNightSchedules.forEach(event => {
                if(event.recurring && event.recurrenceDays){
                    const startDate = new Date(event.startDate);
                    const endDate = event.endDate ? new Date(event.endDate) : null;
                    const weekday = new Date(date.year, date.month - 1, date.day).toLocaleDateString('en-US', { weekday: 'long' });
                    if(
                        (date.year > startDate.getFullYear() ||
                        (date.year === startDate.getFullYear() && date.month > startDate.getMonth() + 1) ||
                        (date.year === startDate.getFullYear() && date.month === startDate.getMonth() + 1 && date.day >= startDate.getDate())) &&
                        (endDate ? (date.year < endDate.getFullYear() ||
                        (date.year === endDate.getFullYear() && date.month < endDate.getMonth() + 1) ||
                        (date.year === endDate.getFullYear() && date.month === endDate.getMonth() + 1 && date.day <= endDate.getDate())) : true) &&
                        event.recurrenceDays.includes(weekday)
                    ){

                        const eventStartTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const eventEndTime = calculateEndTime(event.startTime, event.duration);
                        const eventTimeDisplay = eventEndTime ? `${eventStartTime} - ${eventEndTime}` : eventStartTime;

                        date.events.push({
                            movieNightSchedule: event,
                            time: eventTimeDisplay,
                            startTimestamp: new Date(event.startTime).getTime()
                        });
                    }
                }
            });

            date.events.sort((a, b) => a.startTimestamp - b.startTimestamp);
        });

        return { days, dates };
    };

    const leaveGroup = async () => {
        try {
            await axios.delete(`${API_URL}/api/user-groups/${dbUser._id}/${groupId}`);
            navigate('/dashboard');
            addToast('Left the group', 'success');
        } catch (error) {
            console.error('Error deleting group membership:', error);
            throw error;
        }
    };

    const openEditModal = (event) => {
        setSelectedMovieNight(event);
        setSchedulerOpen(true);
    }

    const getUpcomingMovieNights = () => {
        if (!movieNightSchedules || movieNightSchedules.length === 0) return [];

        const now = new Date();

        const generateRecurringInstances = (event) => {
            if(!event.recurring || !event.recurrenceDays) return [];

            const instances = [];
            const startDate = new Date(event.startDate);
            const endDate = event.endDate ? new Date(event.endDate) : null;
            const limitDate = new Date();
            limitDate.setMonth(limitDate.getMonth() + 1);

            let currentDate = new Date(startDate);

            while(currentDate <= limitDate && (!endDate || currentDate <= endDate)) {
                const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

                if(event.recurrenceDays.includes(weekday) && currentDate >= now) {
                    const eventStartTime = new Date(event.startTime);
                    currentDate.setHours(eventStartTime.getHours(), eventStartTime.getMinutes(), 0, 0);
                    instances.push({
                        ...event,
                        dateTime: new Date(currentDate),
                    });
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            return instances;
        };

        let allUpcomingEvents = movieNightSchedules
            .filter(event => !event.recurring && new Date(event.dateTime) > now)
            .map(event => ({
                ...event,
                dateTime: new Date(event.dateTime),
            }));

        movieNightSchedules.forEach(event => {
            if(event.recurring){
                allUpcomingEvents = allUpcomingEvents.concat(generateRecurringInstances(event));
            }
        });

        return allUpcomingEvents.sort((a, b) => a.dateTime - b.dateTime);
    };

    const calendar = generateCalendar();
    const displayedDates = isCalendarCondensed ? getCurrentWeek(generateCalendar().dates) : calendar.dates;
    const upcomingMovieNights = getUpcomingMovieNights();
    const displayedMovieNights = isCalendarCondensed ? upcomingMovieNights.slice(0, 1) : upcomingMovieNights.slice(0, 10);

    useEffect(() => {
        if(calendarRef.current) {
            setCalendarHeight(calendarRef.current.scrollHeight);
        }
    }, [isCalendarCondensed, displayedDates]);

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
                    <p className="group-invite-code">Invite Code: {groupData.inviteCode}</p>
                    <div className="group-menu" ref={menuRef}>
                        <button
                            className="menu-button"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <BiMenu size={24}/>
                        </button>
                        {showMenu && (
                            <div className="menu-dropdown">
                                {userRole === "owner" && (
                                    <button 
                                        className="menu-item"
                                        onClick={() => {
                                            setPermissionModalOpen(true);
                                            setShowMenu(false);
                                        }}>
                                        Member Permissions
                                    </button>
                                )}
                                {(userRole === "admin" || userRole === "owner") && (
                                    <button 
                                        className="menu-item"
                                        onClick={() => {
                                            setSchedulerOpen(true);
                                            setShowMenu(false);
                                        }}>
                                        Schedule Movie Night
                                    </button>
                                )}
                                <button
                                    className="menu-item"
                                    onClick={leaveGroup}
                                >
                                    Leave Group
                                </button>
                            </div>
                        )}
                    </div>
                    <GroupMemberPermissionsModal 
                        isOpen={isPermissionModalOpen} 
                        onClose={() => setPermissionModalOpen(false)} 
                        groupId={groupId} 
                    />
                </div>

                <div className="group-content">
                    {/* Top Section */}
                    <div className={`group-top-section ${isCalendarCondensed ? 'condensed' : 'expanded'}`}>
                        <div className="group-top-content">
                            <div className="group-showtime" style={{ maxHeight: `${calendarHeight}px`}}>
                                <div className="schedule-header-zone">
                                    <span className="schedule-header">
                                        Upcoming Movie Nights
                                    </span>
                                </div>
                                <div className="group-showtime-content">
                                    {displayedMovieNights.length > 0 ? (
                                        displayedMovieNights.map((event, index) => (
                                            <div key={index} className="showtime-card" onClick={() => scrollToMovieNight(event)}>
                                                <h3 className="showtime-date">
                                                    {new Date(event.dateTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric'})}
                                                </h3>
                                                <div className="showtime-time">
                                                    {new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="showtime-placeholder">No upcoming movie nights</div>
                                    )}
                                </div>
                            </div>
                            <div className="group-calendar" ref={calendarRef}>
                                <div className="calendar-navigation">
                                    {!isCalendarCondensed && (
                                        <button onClick={() => changeMonth(-1)} className="calendar-nav-btn">{"<"}</button>
                                    )}
                                    <span className="calendar-month">
                                        {new Date(currentYear, currentMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                    </span>
                                    {!isCalendarCondensed && (
                                        <button onClick={() => changeMonth(1)} className="calendar-nav-btn">{">"}</button>
                                    )}
                                </div>
                                <div>
                                    <MovieNightSchedulerModal 
                                        isOpen={isSchedulerOpen} 
                                        onClose={() => {
                                            setSchedulerOpen(false)
                                            setSelectedMovieNight(null);
                                        }} 
                                        groupId={groupId} 
                                        refreshData={refreshData}
                                        movieNightSchedule={selectedMovieNight} 
                                    />
                                </div>
                                <div className="calendar-header">
                                    {calendar.days.map(day => (
                                        <div key={day} className="calendar-day-name">{day}</div>
                                    ))}
                                </div>
                                <div className="calendar-grid">
                                    {displayedDates.map((date, index) => {
                                        const key = `${date.year}-${date.month}-${date.day}`;

                                        const isExpanded = expandedDay === index;
                                        const rowIndex = Math.floor(index / 7);
                                        const isRowExpanded = expandedRow === rowIndex;
                                        const maxVisibleEvents = 2;

                                        const today = new Date();
                                        const isToday = 
                                            date.day === today.getDate() &&
                                            date.month === today.getMonth() + 1 &&
                                            date.year === today.getFullYear();

                                        return (
                                            <div
                                                key={index}
                                                ref={(el) => (dateRefs.current[key] = el)}
                                                className={`calendar-date flex flex-col items-center justify-start p-2
                                                    ${date.isCurrentMonth ? 'current-month' : 'other-month'}
                                                    ${date.events.length > 0 ? 'has-event' : ''}
                                                    ${isRowExpanded ? 'expanded' : ''}
                                                    ${isToday ? 'current-day' : ''}`}
                                            >
                                                <span className="calendar-day-number font-bold text-lg">{date.day}</span>

                                                <div className="calendar-events-container flex flex-col items-center w-full">
                                                    {date.events.slice(0, isExpanded ? date.events.length : maxVisibleEvents - (date.events.length > maxVisibleEvents ? 1 : 0)).map((event, eventIndex) => (
                                                        <button
                                                            key={eventIndex}
                                                            onClick={() => openEditModal(event.movieNightSchedule)}
                                                            className="calendar-event bg-gray-800 text-white text-xs p-1 rounded w-full text-center mt-1 hover:bg-gray-700 transition"
                                                        >
                                                            <span className="calendar-event-time font-semibold">{event.time}</span>
                                                        </button>
                                                    ))}

                                                    {date.events.length > maxVisibleEvents && !isExpanded && (
                                                        <button
                                                            className="calendar-more-events text-xs text-gray-300 mt-1 underline"
                                                            onClick={() => {
                                                                toggleExpandRow(index);
                                                                toggleExpandDay(index);
                                                            }}
                                                        >
                                                            +{date.events.length - maxVisibleEvents + 1} more
                                                        </button>
                                                    )}

                                                    {isExpanded && (
                                                        <button
                                                            className="calendar-less-events text-xs text-gray-300 mt-1 underline"
                                                            onClick={() => {
                                                                toggleExpandRow(index);
                                                                toggleExpandDay(index);
                                                            }}
                                                        >
                                                            Show Less
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <button onClick={toggleCalendarView} className="calendar-toggle-btn">
                            {isCalendarCondensed ? "Show Full Calendar" : "Minimize Calendar"}
                        </button>
                    </div>

                    {/* Middle Section */}
                    <div className="group-middle-section">
                        <div className="group-members-box">
                            <h2>Members</h2>
                            <div className="members-grid">
                                {members.map(member => (
                                    <div key={member.id} className="member-card">
                                        <div className="member-avatar">{member.avatar}</div>
                                        <Link 
                                            to={`/user/${member.name}`} 
                                            className="member-name-link"
                                        >
                                            {member.name}
                                        </Link>
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
                                    {activity
                                        .filter(item => item.userId._id !== dbUser._id)
                                        .map((item, index) => (
                                        <div key={item.id} className={`activity-item ${index % 2 === 0 ? 'activity-even' : 'activity-odd'}`}>
                                            <span className="bullet">•</span>
                                            <span className="activity-happening">{item.happening}</span>
                                            {/*<span className="activity-timestamp">{item.createdAt}</span>*/}
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
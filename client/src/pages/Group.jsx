import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { useAuth0 } from '@auth0/auth0-react';
import { BiMenu } from 'react-icons/bi';
import '../styles/Dashboard.css';
import '../styles/Group.css';
import '../styles/HappeningsCard.css';
import { useGroupData } from "../hooks/useGroupData";
import { TicketRating } from '../components/TicketRating';
import { useUser } from '../context/UserContext';
import { MovieNightSchedulerModal } from '../components/MovieNightSchedulerModal';
import { GroupMemberPermissionsModal } from '../components/GroupMemberPermissionsModal';
import axios from 'axios';
import { useToast } from '../components/Toast';
import { DateTime } from 'luxon';  // <-- Import Luxon

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const TMDB_API_KEY = 'e7b225b138e7b083d203ad7bc2819fec';

export const Group = () => {
  const { groupId } = useParams();
  const { isLoading, isAuthenticated } = useAuth0();
  const { dbUser } = useUser();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [userRole, setUserRole] = useState(null);

  const getMovieData = async (movieId) => {
    const movieRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    return movieRes.json();
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!dbUser || !dbUser._id) return;
      try {
        const response = await axios.get(`${API_URL}/api/user-groups/check/${dbUser._id}/${groupId}`);
        setUserRole(response.data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
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

  // Use Luxon for the current date
  const today = DateTime.local();
  const initStartOfThisWeek = today.minus({ days: today.weekday + 1 }).toJSDate();
  const [displayedWeekStart, setDisplayedWeekStart] = useState(initStartOfThisWeek);

  const resetDisplayWeekStart = () => {
    const today = DateTime.local();
    const startOfThisWeek = today.minus({ days: today.weekday + 1 }).toJSDate();
    setDisplayedWeekStart(startOfThisWeek);
  };

  const [expandedDay, setExpandedDay] = useState(null);
  const toggleExpandDay = (index) => {
    setExpandedDay((prev) => (prev === index ? null : index));
  };

  const [expandedRow, setExpandedRow] = useState(null);
  const toggleExpandRow = (index) => {
    const rowIndex = Math.floor(index / 7);
    setExpandedRow((prev) => (prev === rowIndex ? null : rowIndex));
  };

  const [isCalendarCondensed, setIsCalendarCondensed] = useState(true);
  const toggleCalendarView = () => {
    setIsCalendarCondensed((prev) => {
      const newState = !prev;
      if (newState) {
        const now = DateTime.local();
        setCurrentMonth(now.month - 1);
        setCurrentYear(now.year);
        resetDisplayWeekStart();
      }
      return newState;
    });
  };

  const calendarRef = useRef(null);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const dateRefs = useRef({});

  // Use Luxon to convert the event time from UTC to local time
  const scrollToMovieNight = (event) => {
    const eventDateLuxon = DateTime.fromISO(event.dateTime, { zone: 'utc' }).setZone('local');
    const jsEventDate = eventDateLuxon.toJSDate();
    const eventYear = eventDateLuxon.year;
    // Adjust for 0-indexed month since currentMonth is from new Date()
    const eventMonth = eventDateLuxon.month - 1;

    if (isCalendarCondensed) {
      const startOfEventWeek = new Date(jsEventDate);
      startOfEventWeek.setDate(jsEventDate.getDate() - jsEventDate.getDay() - 1);
      const endOfEventWeek = new Date(startOfEventWeek);
      endOfEventWeek.setDate(startOfEventWeek.getDate() + 7);

      const todayJS = new Date();
      const startOfCurrentWeek = new Date(todayJS);
      startOfCurrentWeek.setDate(todayJS.getDate() - todayJS.getDay() - 1);
      const endOfCurrentWeek = new Date(startOfCurrentWeek);
      endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 7);

      const isInCurrentWeek = jsEventDate >= startOfCurrentWeek && jsEventDate <= endOfCurrentWeek;

      if (!isInCurrentWeek) {
        setCurrentYear(eventYear);
        setCurrentMonth(eventMonth);
        setDisplayedWeekStart(startOfEventWeek);
        setTimeout(() => {
          scrollToDate(jsEventDate);
        }, 300);
      } else {
        scrollToDate(jsEventDate);
      }
    } else {
      if (eventYear !== currentYear || eventMonth !== currentMonth) {
        setCurrentYear(eventYear);
        setCurrentMonth(eventMonth);
        setTimeout(() => {
          scrollToDate(jsEventDate);
        }, 300);
      } else {
        scrollToDate(jsEventDate);
      }
    }
  };

  const scrollToDate = (eventDate) => {
    const dt = DateTime.fromJSDate(eventDate);
    const key = `${dt.year}-${dt.month}-${dt.day}`;
    if (dateRefs.current[key]) {
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
  };

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const changeMonth = (direction) => {
    if (isCalendarCondensed) return;
    setCurrentMonth((prevMonth) => {
      let newMonth = prevMonth + direction;
      if (newMonth < 0) {
        return 11;
      } else if (newMonth > 11) {
        return 0;
      }
      return newMonth;
    });
    setCurrentYear((prevYear) => {
      if (direction === -1 && currentMonth === 0) {
        return prevYear - 1;
      } else if (direction === 1 && currentMonth === 11) {
        return prevYear + 1;
      }
      return prevYear;
    });
  };

  const getCurrentWeek = (dates) => {
    if (!displayedWeekStart) return dates;
    return dates.filter(date => {
      const weekStart = new Date(displayedWeekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const dateObj = new Date(date.year, date.month - 1, date.day);
      return dateObj >= weekStart && dateObj <= weekEnd;
    });
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

  // Update calculateEndTime so it uses Luxon for conversion and formatting
  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return null;
    const startDateLuxon = DateTime.fromISO(startTime, { zone: 'utc' }).setZone('local');
    const endDateLuxon = startDateLuxon.plus({ minutes: duration });
    return endDateLuxon.toFormat('hh:mm a');
  };

  const generateCalendar = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const dates = [];

    // Fill in last month’s days to fill the first row
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

    // Add days for the current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      dates.push({
        day: i,
        month: currentMonth + 1,
        year: currentYear,
        isCurrentMonth: true,
        events: []
      });
    }

    // Fill in next month’s days if necessary
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

    // Process non-recurring events
    dates.forEach(date => {
      movieNightSchedules.forEach(event => {
        if (!event.recurring) {
          const eventDateLuxon = DateTime.fromISO(event.dateTime, { zone: 'utc' }).setZone('local');
          const jsEventDate = eventDateLuxon.toJSDate();
          const eventStartTime = eventDateLuxon.toFormat('hh:mm a');
          const eventEndTime = calculateEndTime(event.dateTime, event.duration);
          const eventTimeDisplay = eventEndTime ? `${eventStartTime} - ${eventEndTime}` : eventStartTime;

          if (
            jsEventDate.getDate() === date.day &&
            jsEventDate.getMonth() + 1 === date.month &&
            jsEventDate.getFullYear() === date.year
          ) {
            date.events.push({
              movieNightSchedule: event,
              time: eventTimeDisplay,
              startTimestamp: eventDateLuxon.toMillis(),
            });
          }
        }
      });

      // Process recurring events
      movieNightSchedules.forEach(event => {
        if (event.recurring && event.recurrenceDays) {
          const startDateLuxon = DateTime.fromISO(event.startDate, { zone: 'utc' }).setZone('local');
          const endDateLuxon = event.endDate ? DateTime.fromISO(event.endDate, { zone: 'utc' }).setZone('local') : null;
          const currentDateLuxon = DateTime.fromObject({ year: date.year, month: date.month, day: date.day });
          const weekday = currentDateLuxon.toFormat('cccc'); // e.g. "Monday"
          if (
            (currentDateLuxon >= startDateLuxon) &&
            (endDateLuxon ? (currentDateLuxon <= endDateLuxon) : true) &&
            event.recurrenceDays.includes(weekday)
          ) {
            const eventStartTimeLuxon = DateTime.fromISO(event.startTime, { zone: 'utc' }).setZone('local');
            const eventEndTime = calculateEndTime(event.startTime, event.duration);
            const eventTimeDisplay = eventEndTime
              ? `${eventStartTimeLuxon.toFormat('hh:mm a')} - ${eventEndTime}`
              : eventStartTimeLuxon.toFormat('hh:mm a');
            date.events.push({
              movieNightSchedule: event,
              time: eventTimeDisplay,
              startTimestamp: eventStartTimeLuxon.toMillis()
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
  };

  const getUpcomingMovieNights = () => {
    if (!movieNightSchedules || movieNightSchedules.length === 0) return [];
    const nowLuxon = DateTime.local();

    const generateRecurringInstances = (event) => {
      if (!event.recurring || !event.recurrenceDays) return [];
      const instances = [];
      const startDateLuxon = DateTime.fromISO(event.startDate, { zone: 'utc' }).setZone('local');
      const endDateLuxon = event.endDate ? DateTime.fromISO(event.endDate, { zone: 'utc' }).setZone('local') : null;
      const limitDateLuxon = DateTime.local().plus({ months: 1 });
      let currentDateLuxon = startDateLuxon;

      while (
        currentDateLuxon <= limitDateLuxon &&
        (!endDateLuxon || currentDateLuxon <= endDateLuxon)
      ) {
        const weekday = currentDateLuxon.toFormat('cccc');
        if (event.recurrenceDays.includes(weekday) && currentDateLuxon >= nowLuxon) {
          const eventStartTimeLuxon = DateTime.fromISO(event.startTime, { zone: 'utc' }).setZone('local');
          const instanceDateTime = currentDateLuxon.set({
            hour: eventStartTimeLuxon.hour,
            minute: eventStartTimeLuxon.minute,
            second: 0,
            millisecond: 0
          });
          instances.push({
            ...event,
            dateTime: instanceDateTime.toJSDate(),
          });
        }
        currentDateLuxon = currentDateLuxon.plus({ days: 1 });
      }
      return instances;
    };

    let allUpcomingEvents = movieNightSchedules
      .filter(event => 
        !event.recurring &&
        DateTime.fromISO(event.dateTime, { zone: 'utc' }).setZone('local') > nowLuxon
      )
      .map(event => ({
        ...event,
        dateTime: DateTime.fromISO(event.dateTime, { zone: 'utc' }).setZone('local').toJSDate(),
      }));

    movieNightSchedules.forEach(event => {
      if (event.recurring) {
        allUpcomingEvents = allUpcomingEvents.concat(generateRecurringInstances(event));
      }
    });
    return allUpcomingEvents.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  };

  const calendar = generateCalendar();
  const displayedDates = isCalendarCondensed ? getCurrentWeek(generateCalendar().dates) : calendar.dates;
  const upcomingMovieNights = getUpcomingMovieNights();
  const displayedMovieNights = isCalendarCondensed ? upcomingMovieNights.slice(0, 1) : upcomingMovieNights.slice(0, 10);

  const copyInviteCode = () => {
    if (groupData?.inviteCode) {
      navigator.clipboard.writeText(groupData.inviteCode)
        .then(() => addToast("Invite code copied to clipboard.", "Success"))
        .catch(() => addToast("Failed to copy invite code.", "error"));
    }
  };

  useEffect(() => {
    if (calendarRef.current) {
      setCalendarHeight(calendarRef.current.scrollHeight);
    }
  }, [isCalendarCondensed, displayedDates]);

  if (isLoading || loading) return <div>Loading Group...</div>;
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }
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
      <SideNav isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <main className="dashboard-main">
        <div className="group-header">
          <h1>{groupData.name}</h1>
          <button className="group-invite-code-btn" onClick={copyInviteCode}>
            Invite Code: {groupData.inviteCode}
          </button>
          <div className="group-menu" ref={menuRef}>
            <button className="menu-button" onClick={() => setShowMenu(!showMenu)}>
              <BiMenu size={24} />
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                {userRole === "owner" && (
                  <button
                    className="menu-item"
                    onClick={() => {
                      setPermissionModalOpen(true);
                      setShowMenu(false);
                    }}
                  >
                    Member Permissions
                  </button>
                )}
                {(userRole === "admin" || userRole === "owner") && (
                  <button
                    className="menu-item"
                    onClick={() => {
                      setSchedulerOpen(true);
                      setShowMenu(false);
                    }}
                  >
                    Schedule Movie Night
                  </button>
                )}
                <button className="menu-item" onClick={leaveGroup}>
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
              <div className="group-showtime" style={{ maxHeight: `${calendarHeight}px` }}>
                <div className="schedule-header-zone">
                  <span className="schedule-header">Upcoming Movie Nights</span>
                </div>
                <div className="group-showtime-content">
                  {displayedMovieNights.length > 0 ? (
                    displayedMovieNights.map((event, index) => (
                      <div key={index} className="showtime-card" onClick={() => scrollToMovieNight(event)}>
                        <h3 className="showtime-date">
                          {DateTime.fromJSDate(event.dateTime).toLocaleString({
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </h3>
                        <div className="showtime-time">
                          {DateTime.fromJSDate(event.dateTime).toFormat('hh:mm a')}
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
                    <button onClick={() => changeMonth(-1)} className="calendar-nav-btn">
                      {"<"}
                    </button>
                  )}
                  <span className="calendar-month">
                    {new Date(currentYear, currentMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  {!isCalendarCondensed && (
                    <button onClick={() => changeMonth(1)} className="calendar-nav-btn">
                      {">"}
                    </button>
                  )}
                </div>
                <div>
                  <MovieNightSchedulerModal
                    isOpen={isSchedulerOpen}
                    onClose={() => {
                      setSchedulerOpen(false);
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
                    const todayJS = new Date();
                    const isToday =
                      date.day === todayJS.getDate() &&
                      date.month === todayJS.getMonth() + 1 &&
                      date.year === todayJS.getFullYear();
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
                          {date.events
                            .slice(0, isExpanded ? date.events.length : maxVisibleEvents - (date.events.length > maxVisibleEvents ? 1 : 0))
                            .map((event, eventIndex) => (
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
                    <Link to={`/user/${member.name}`} className="member-name-link">
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
                    .map((item, index) => {
                      const formatHappeningText = (text) => {
                        const words = text.split(' ');
                        return (
                          <span className="happening-text">
                            <span className="first-word">{words[0]}</span>
                            {' ' + words.slice(1).join(' ')}
                          </span>
                        );
                      };
                      return (
                        <div key={item.id} className={`activity-item ${index % 2 === 0 ? 'activity-even' : 'activity-odd'}`}>
                          <span className="bullet">•</span>
                          <span className="activity-happening">{formatHappeningText(item.happening)}</span>
                        </div>
                      );
                    })}
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
                  {scores.map(score => {
                    // Example placeholder – update as needed
                    return <p key={score.id}>Coming Soon</p>;
                  })}
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

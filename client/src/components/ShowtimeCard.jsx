import React, { useEffect, useState } from 'react';
import { BiChevronUp, BiChevronDown } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ShowtimeCard.css';
import '../styles/LoadingAnimations.css';

export const ShowtimeCard = ({ 
  userMovieNights, 
  currentMovieNight, 
  currentMovieNightIndex, 
  isMovieNightAnimating, 
  movieNightAnimationDirection,
  handlePrevMovieNight,
  handleNextMovieNight,
  handleMovieNightClick,
  formatMovieNightDate,
  formatMovieNightTime,
  isLoading = false
}) => {
  // Define animation variants
  const contentVariants = {
    initial: (direction) => ({
      y: direction === 'up' ? 30 : -30,
      opacity: 0
    }),
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        duration: 0.3
      }
    },
    exit: (direction) => ({
      y: direction === 'up' ? -30 : 30,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        duration: 0.3
      }
    })
  };

  // Loading placeholder
  const renderLoadingPlaceholder = () => (
    <div className="showtime-loading">
      <div className="showtime-loading-date shimmer pulse"></div>
      <div className="showtime-loading-time shimmer pulse"></div>
      <div className="showtime-loading-group shimmer pulse"></div>
    </div>
  );

  // Safely format the time
  const safeFormatTime = (timeData) => {
    try {
      if (!timeData) return "No time available";
      return formatMovieNightTime(timeData);
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Time unavailable";
    }
  };

  // Safely format the date
  const safeFormatDate = (dateData) => {
    try {
      if (!dateData) return "No date available";
      return formatMovieNightDate(dateData);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date unavailable";
    }
  };

  return (
    <div className="content-section showtime">
      <h2>
        Showtimes
        <div className="chevron-controls">
          <BiChevronUp 
            className={`chevron-arrow ${userMovieNights.length <= 1 ? 'disabled' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (userMovieNights.length > 1) handlePrevMovieNight(e);
            }}
          />
          <BiChevronDown 
            className={`chevron-arrow ${userMovieNights.length <= 1 ? 'disabled' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (userMovieNights.length > 1) handleNextMovieNight(e);
            }}
          />
        </div>
      </h2>
      <div className="showtime-card-container">
        <div className="flex-grow flex items-center justify-center w-full">
          {isLoading ? (
            renderLoadingPlaceholder()
          ) : (
            <AnimatePresence mode="wait" custom={movieNightAnimationDirection}>
              <motion.div
                key={currentMovieNightIndex}
                className="flex flex-col items-center justify-center font-['Cabin'] w-full"
                custom={movieNightAnimationDirection}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {currentMovieNight ? (
                  <>
                    <h3 
                      onClick={userMovieNights.length > 0 ? handleMovieNightClick : undefined}
                      className="text-[#ff4b4b] text-[2.5rem] m-0 hover:underline transition-all cursor-pointer max-w-[calc(100%-60px)] text-center font-['Cabin'] font-semibold"
                    >
                      {safeFormatDate(currentMovieNight.displayDate || currentMovieNight.date)}
                    </h3>
                    <div className="text-[#ff8a80] -mt-2 mb-1 text-[1.6rem] font-['Cabin']">
                      {safeFormatTime(currentMovieNight)}
                    </div>
                    <div className="text-white text-md font-['Cabin']">
                      {currentMovieNight.groupName || currentMovieNight.group}
                    </div>
                  </>
                ) : (
                  <h3 className="text-[#ff4b4b] text-[2.5rem] m-0 text-center font-['Cabin'] font-semibold">No Showtimes</h3>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
        
        {userMovieNights.length > 0 && !isLoading && (
          <div className="text-center mt-auto text-sm text-[#888] font-['Cabin']">
            {currentMovieNightIndex + 1} / {userMovieNights.length}
          </div>
        )}
      </div>
    </div>
  );
}; 
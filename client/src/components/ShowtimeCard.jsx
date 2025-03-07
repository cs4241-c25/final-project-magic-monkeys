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

  return (
    <div className="bg-[#333] p-4 rounded-md relative h-[calc(100%)] flex flex-col justify-between">
    {/* <div className="bg-[#333] p-4 rounded-md border border-[#444] relative h-[calc(100%-45px)] flex flex-col justify-center"> */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 z-10">
        <BiChevronUp 
          className={`text-4xl text-[#888] hover:text-[#ff4b4b] transition-colors ${userMovieNights.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (userMovieNights.length > 1) handlePrevMovieNight(e);
          }}
        />
        <BiChevronDown 
          className={`text-4xl text-[#888] hover:text-[#ff4b4b] transition-colors ${userMovieNights.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (userMovieNights.length > 1) handleNextMovieNight(e);
          }}
        />
      </div>
      
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
                    {formatMovieNightDate(currentMovieNight.displayDate)}
                  </h3>
                  <div className="text-[#ff8a80] -mt-2 mb-1 text-[1.6rem] font-['Cabin']">{formatMovieNightTime(currentMovieNight)}</div>
                  <div className="text-white text-md font-['Cabin']">{currentMovieNight.groupName}</div>
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
  );
}; 
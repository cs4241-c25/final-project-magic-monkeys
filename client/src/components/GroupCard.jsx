import React, { useEffect, useState } from 'react';
import { BiChevronUp, BiChevronDown } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/GroupCard.css';
import '../styles/LoadingAnimations.css';

export const GroupCard = ({
  userGroups,
  currentGroupName,
  currentGroupIndex,
  isAnimating,
  animationDirection,
  handlePrevGroup,
  handleNextGroup,
  handleGroupCardClick,
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
    <div className="group-loading">
      <div className="group-loading-name shimmer pulse"></div>
    </div>
  );

  return (
    <div className={`bg-[#333] p-4 rounded-md relative h-[calc(100%)] flex flex-col justify-between`}>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 z-10">
        <BiChevronUp 
          className={`text-4xl hover:text-[#ff4b4b] transition-colors ${userGroups.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (userGroups.length > 1) handlePrevGroup();
          }}
        />
        <BiChevronDown 
          className={`text-4xl hover:text-[#ff4b4b] transition-colors ${userGroups.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (userGroups.length > 1) handleNextGroup();
          }}
        />
      </div>
      
      <div className="flex-grow flex items-center justify-center w-full">
        {isLoading ? (
          renderLoadingPlaceholder()
        ) : (
          <AnimatePresence mode="wait" custom={animationDirection}>
            <motion.div 
              key={currentGroupIndex}
              className="flex justify-center items-center font-['Cabin'] w-full"
              custom={animationDirection}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {userGroups.length > 0 ? (
                <h3 
                  onClick={userGroups.length > 0 ? handleGroupCardClick : undefined}
                  className="text-white text-[2.5rem] m-0 hover:text-[#ff4b4b] transition-all cursor-pointer max-w-[calc(100%-60px)] text-center font-['Cabin'] font-semibold"
                >
                  {currentGroupName}
                </h3>
              ) : (
                <h3 className="text-white text-[2.5rem] m-0 text-center font-['Cabin'] font-semibold">No Groups</h3>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      
      {userGroups.length > 0 && !isLoading && (
        <div className="text-center mt-auto text-sm text-[#888] font-['Cabin']">
          {currentGroupIndex + 1} / {userGroups.length}
        </div>
      )}
    </div>
  );
}; 
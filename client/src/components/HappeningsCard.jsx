import React from 'react';
import '../styles/HappeningsCard.css';
import '../styles/LoadingAnimations.css';

export const HappeningsCard = ({ happenings, isLoading = false }) => {
  // Loading placeholder
  const renderLoadingPlaceholder = () => (
    <div className="happenings-content flex-1 overflow-y-auto pr-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="happenings-loading-item shimmer">
          <div className="happenings-loading-user pulse"></div>
          <div className="happenings-loading-movie pulse"></div>
          <div className="happenings-loading-rating pulse"></div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {isLoading ? (
        renderLoadingPlaceholder()
      ) : (
        <div className="happenings-content flex-1 overflow-y-auto pr-2">
          {happenings.map((event, index) => (
            <div 
              key={index} 
              className="happening-item py-3 border-b border-[#333] text-base text-[#888] flex items-center gap-2 relative pl-3"
            >
              <span className="font-medium text-[#aaa]">{event.user}</span>
              <span>gave</span>
              <span className="font-medium text-[#ff4b4b]">{event.movie}</span>
              <span>a</span>
              <span className="font-bold text-white">{event.rating}</span>
              <span>out of</span>
              <span className="font-medium text-[#aaa]">{event.tickets}</span>
              <span>tickets</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}; 
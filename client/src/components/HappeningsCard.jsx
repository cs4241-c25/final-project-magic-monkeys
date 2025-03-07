import React from 'react';
import '../styles/HappeningsCard.css';
import '../styles/LoadingAnimations.css';

export const HappeningsCard = ({ happenings, isLoading = false }) => {
  // Loading placeholder
  const renderLoadingPlaceholder = () => (
    <div className="happenings-loading">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="happenings-loading-item shimmer">
          <div className="happenings-loading-user pulse"></div>
          <div className="happenings-loading-movie pulse"></div>
          <div className="happenings-loading-rating pulse"></div>
        </div>
      ))}
    </div>
  );

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
    <div className="content-section happenings">
      <h2>Happenings</h2>
      <div className="happenings-card-container">
        {isLoading ? (
          renderLoadingPlaceholder()
        ) : (
          <div className="happenings-content">
            {happenings.map((event, index) => (
              <div 
                key={index} 
                className={`happening-item ${index % 2 === 0 ? 'happening-item-even' : 'happening-item-odd'}`}
              >
                {formatHappeningText(event.happening)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 
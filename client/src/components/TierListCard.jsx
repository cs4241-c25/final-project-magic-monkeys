import React from 'react';
import '../styles/TierListCard.css';
import '../styles/LoadingAnimations.css';
import { useNavigate } from 'react-router-dom';

export const TierListCard = ({ 
  tierListData, 
  isTierListLoading
}) => {
  const navigate = useNavigate();

  const handleMovieClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  // Get tier text color based on index
  const getTierTextColor = (index) => {
    const colors = [
      '#ff4b4b', // S Tier - Darkest salmon
      '#ff5c5c', // A Tier
      '#ff6e6e', // B Tier
      '#ff8080', // C Tier
      '#ff9292', // D Tier
      '#ffa4a4'  // F Tier - Lightest salmon
    ];
    return colors[index] || colors[0];
  };

  // Loading placeholder
  const renderLoadingPlaceholder = () => (
    <div className="flex flex-col flex-1 h-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`tierlist-loading-row shimmer ${i % 2 === 0 ? 'tier-row-even' : 'tier-row-odd'}`} style={{ height: 'calc(100% / 3)' }}>
          <div className="tierlist-loading-label pulse"></div>
          <div className="tierlist-loading-movies">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="tierlist-loading-movie pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Get tier keys in order
  const orderedTiers = ['S', 'A', 'B', 'C', 'D', 'F'].filter(tier => 
    Object.keys(tierListData).includes(tier)
  );

  // Filter to include only tiers that are present in tierListData
  const availableTiers = tierListData ? 
    orderedTiers.filter(tier => tierListData[tier] && tierListData[tier].length > 0).slice(0, 3) : 
    [];

  return (
    <div className="flex-1 overflow-hidden h-full">
      {isTierListLoading ? (
        renderLoadingPlaceholder()
      ) : (
        <div className="flex flex-col gap-0 flex-1 h-full">
          {availableTiers.length > 0 ? (
            availableTiers.map((tier, index) => (
              <div 
                key={tier} 
                className={`flex items-center ${index % 2 === 0 ? 'tier-row-even' : 'tier-row-odd'}`} 
                style={{ 
                  height: `calc(100% / ${availableTiers.length})`, 
                  paddingLeft: '20px',
                  paddingTop: '5px',
                  paddingBottom: '5px'
                }}
              >
                <div 
                  className="w-[70px] flex items-center justify-center mr-6 font-bold text-[2.5rem]"
                  style={{ height: '100%' }}
                >
                  <span className={`tier-text-${tier}`}>{tier}</span>
                </div>
                <div className="tier-movies flex gap-3 p-2 flex-1 overflow-x-auto items-center">
                  {tierListData[tier].length > 0 ? (
                    tierListData[tier].map((movie, i) => (
                      <div 
                        key={`${tier}-${i}`}
                        style={{ 
                          width: '90px',
                          height: '135px',
                          backgroundImage: `url(${movie.poster})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          borderRadius: '4px',
                          flexShrink: 0,
                          transition: 'transform 0.2s'
                        }}
                        className="hover:scale-105 cursor-pointer"
                        title={movie.title}
                        onClick={() => handleMovieClick(movie.movieId)}
                      ></div>
                    ))
                  ) : (
                    <span className="flex items-center justify-center text-[#888] italic w-full h-[135px] rounded-md text-[0.9rem]">
                      No movies in this tier
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <p className="text-[#888] text-base">Your tier list is empty. Add movies to your tier list to see them here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add this CSS to your global.css or create a new styled component
// .hide-scrollbar::-webkit-scrollbar {
//   display: none;
// } 
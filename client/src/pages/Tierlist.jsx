import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SideNav } from '../components/SideNav';
import { BiLock, BiLockOpen } from 'react-icons/bi';
import { BsArrowsMove } from 'react-icons/bs';
import '../styles/Tierlist.css';

// Helper function to reorder items in a list
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Initialize tiers structure
const initialTiers = {
  S: { items: [], label: 'S Tier' },
  A: { items: [], label: 'A Tier' },
  B: { items: [], label: 'B Tier' },
  C: { items: [], label: 'C Tier' },
  D: { items: [], label: 'D Tier' },
  F: { items: [], label: 'F Tier' },
  pool: { items: [], label: 'Unranked Movies' },
};

export const Tierlist = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [tiers, setTiers] = useState({
    ...initialTiers,
    pool: {
      ...initialTiers.pool,
      items: [
        { id: '1', title: "Oppenheimer", poster: "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
        { id: '2', title: "Interstellar", poster: "https://image.tmdb.org/t/p/w200/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
        { id: '3', title: "Arrival", poster: "https://image.tmdb.org/t/p/w200/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg" },
        { id: '4', title: "Midsommar", poster: "https://image.tmdb.org/t/p/w200/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg" },
        { id: '5', title: "Moonlight", poster: "https://image.tmdb.org/t/p/w200/rcICfiL9fvwRjoWHxW8QeroLYrJ.jpg" },
        { id: '6', title: "Eternal Sunshine of the Spotless Mind", poster: "https://www.themoviedb.org/t/p/w200/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg" },
      ],
    },
  });

  const onDragEnd = (result) => {
    if (!result.destination || isLocked) return;

    const sourceKey = result.source.droppableId;
    const destKey = result.destination.droppableId;

    if (sourceKey === destKey) {
      // Reordering within same tier
      const reorderedItems = reorder(
        tiers[sourceKey].items,
        result.source.index,
        result.destination.index
      );

      setTiers((prev) => ({
        ...prev,
        [sourceKey]: {
          ...prev[sourceKey],
          items: reorderedItems,
        },
      }));
    } else {
      // Moving between tiers
      const sourceItems = Array.from(tiers[sourceKey].items);
      const [removed] = sourceItems.splice(result.source.index, 1);
      const destItems = Array.from(tiers[destKey].items);
      destItems.splice(result.destination.index, 0, removed);

      setTiers((prev) => ({
        ...prev,
        [sourceKey]: {
          ...prev[sourceKey],
          items: sourceItems,
        },
        [destKey]: {
          ...prev[destKey],
          items: destItems,
        },
      }));
    }
  };

  return (
    <div className="tierlist-container">
      <SideNav isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      <div className={`tierlist-main ${isExpanded ? 'expanded' : ''}`}>
        <div className="tierlist-header">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg"
            >
              {isLocked ? <BiLock size={20} /> : <BiLockOpen size={20} />}
              {isLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="tier-container">
            {['S', 'A', 'B', 'C', 'D', 'F'].map((tierKey) => (
              <div className="tier-row" key={tierKey}>
                <div className="tier-label">{tierKey}</div>
                <Droppable droppableId={tierKey} direction="horizontal" isDropDisabled={isLocked}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="tier-movies"
                    >
                      {tiers[tierKey].items.map((movie, index) => (
                        <Draggable key={movie.id} draggableId={movie.id} index={index} isDragDisabled={isLocked}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="relative group"
                            >
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className="hover:transform hover:scale-105"
                              />
                              {!isLocked && (
                                <div className="absolute top-1 left-1 text-white/50">
                                  <BsArrowsMove />
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

            {/* Unranked Movies Pool */}
            <div className="content-section mt-4">
              <h2 className="text-lg font-semibold mb-4">Unranked Movies</h2>
              <Droppable droppableId="pool" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="tier-movies"
                  >
                    {tiers.pool.items.map((movie, index) => (
                      <Draggable key={movie.id} draggableId={movie.id} index={index} isDragDisabled={isLocked}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="relative group"
                          >
                            <img
                              src={movie.poster}
                              alt={movie.title}
                              className="hover:transform hover:scale-105"
                            />
                            {!isLocked && (
                              <div className="absolute top-1 left-1 text-white/50">
                                <BsArrowsMove />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};
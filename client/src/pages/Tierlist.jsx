import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SideNav } from '../components/SideNav';
import { BiLock, BiLockOpen } from 'react-icons/bi';
import { BsArrowsMove } from 'react-icons/bs';
import { useUser } from '../context/UserContext';
import '../styles/Tierlist.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

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
  const { dbUser } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  // Pre-load any movies you want in the pool by default:
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

  // 1) On mount (or when dbUser changes), fetch the user’s saved tier list
  useEffect(() => {
    if (!dbUser) return; // Wait until user data is available

    const fetchTierList = async () => {
      try {
        // GET /api/tier-lists/:userId (adjust if your route differs)        
        const response = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/tier-lists`);
        if (!response.ok) {
          // If no tier list found or some error, just skip
          console.log("No existing tier list or error fetching it.");
          return;
        }

        const savedData = await response.json(); // array of docs like { movieId, rank, order }

        // Create a fresh copy of initialTiers
        const newTiers = structuredClone(initialTiers);

        // We'll assume the same 6 known movies are in the pool. Let's gather them for easy lookup:
        const poolMovies = [
          { id: '1', title: "Oppenheimer", poster: "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
          { id: '2', title: "Interstellar", poster: "https://image.tmdb.org/t/p/w200/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
          { id: '3', title: "Arrival", poster: "https://image.tmdb.org/t/p/w200/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg" },
          { id: '4', title: "Midsommar", poster: "https://image.tmdb.org/t/p/w200/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg" },
          { id: '5', title: "Moonlight", poster: "https://image.tmdb.org/t/p/w200/rcICfiL9fvwRjoWHxW8QeroLYrJ.jpg" },
          { id: '6', title: "Eternal Sunshine of the Spotless Mind", poster: "https://www.themoviedb.org/t/p/w200/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg" },
        ];

        // 2) Place each saved item in the appropriate rank array
        savedData.forEach(item => {
          // Find the corresponding movie in our known pool
          const foundMovie = poolMovies.find(m => m.id === String(item.movieId));
          if (foundMovie && newTiers[item.rank]) {
            newTiers[item.rank].items.push(foundMovie);
          }
        });

        // 3) Remove placed movies from the pool
        newTiers.pool.items = poolMovies.filter(m => {
          // Only keep movies that aren't placed in any rank
          return !savedData.some(d => String(d.movieId) === m.id);
        });

        // 4) Sort each tier’s items by their `order` from DB
        for (const rank of ['S', 'A', 'B', 'C', 'D', 'F']) {
          // Sort by the `order` field in savedData
          newTiers[rank].items.sort((a, b) => {
            const docA = savedData.find(d => String(d.movieId) === a.id);
            const docB = savedData.find(d => String(d.movieId) === b.id);
            return (docA?.order ?? 0) - (docB?.order ?? 0);
          });
        }

        // 5) Update state
        setTiers(newTiers);
      } catch (error) {
        console.error("Error fetching tier list:", error);
      }
    };

    fetchTierList();
  }, [dbUser]);

  // Handle Drag and Drop
  const onDragEnd = (result) => {
    if (!result.destination || isLocked) return;

    const sourceKey = result.source.droppableId;
    const destKey = result.destination.droppableId;

    if (sourceKey === destKey) {
      // Reordering within the same tier
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

  // Handle Saving
  const handleSave = async () => {
    if (!dbUser) {
      console.error("dbUser is null. User data has not been loaded yet.");
      alert("Please wait until your profile loads before saving your tier list.");
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/tier-lists/bulk-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: dbUser._id,
          tiers,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save tier list");
      }
  
      const data = await response.json();
      console.log("Tier list saved:", data);
      alert("Tier list saved successfully!");
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving your tier list.");
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

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Save
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
                        <Draggable
                          key={movie.id}
                          draggableId={movie.id}
                          index={index}
                          isDragDisabled={isLocked}
                        >
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
                      <Draggable
                        key={movie.id}
                        draggableId={movie.id}
                        index={index}
                        isDragDisabled={isLocked}
                      >
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

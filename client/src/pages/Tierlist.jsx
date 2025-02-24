import { useState } from 'react';
import { SideNav } from '../components/SideNav';
import '../styles/Tierlist.css';
import { BiChevronDown, BiChevronUp, BiFilterAlt } from 'react-icons/bi';
import { BsTicketFill, BsTicket } from "react-icons/bs";
import { useAuth0 } from '@auth0/auth0-react';


export const Tierlist = () => {
  const { user, isLoading } = useAuth0();

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('Group Name');

  if (isLoading) return <div>Loading Dashboard...</div>;

  const movieData = [
    {
      id: 1,
      title: "Oppenheimer",
      poster: "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"
    },
    {
      id: 2,
      title: "Interstellar",
      poster: "https://image.tmdb.org/t/p/w200/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
    },
    {
      id: 3,
      title: "Arrival",
      poster: "https://image.tmdb.org/t/p/w200/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg"
    },
    {
      id: 4,
      title: "Midsommar",
      poster: "https://image.tmdb.org/t/p/w200/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg"
    },
    {
      id: 5,
      title: "Moonlight",
      poster: "https://image.tmdb.org/t/p/w200/rcICfiL9fvwRjoWHxW8QeroLYrJ.jpg"
    },
    {
      id: 6,
      title: "Eternal Sunshine of the Spotless Mind",
      poster: "https://www.themoviedb.org/t/p/w200/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg"
    }
  ];

  const dummyMovies = Array(12).fill(null).map((_, i) => movieData[i % 4]);

  return (
    <div className="tierlist-container">
      <SideNav 
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      
    </div>
  );
}; 
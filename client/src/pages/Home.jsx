import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeroImage } from '../components/HeroImage';
import { MdGroups, MdStarRate, MdChat, MdRecommend } from 'react-icons/md';
import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import '../styles/Home.css';

export const Home = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    if (!isLoading && isAuthenticated && !location.state?.stayOnHome) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Movie Mates</h1>
          <p className="hero-subtitle">
            The social platform that brings friends together through movies. 
            Create groups, share ratings, and find the perfect movie for your next watch party.
          </p>
          <div className="hero-buttons mb-5">
            {!isAuthenticated ? (
                <button onClick={() => loginWithRedirect()} className="cta-button">
                  Log In
                </button>
            ) : (
                <Link to="/dashboard" className="cta-button">
                  Dashboard
                </Link>
            )}
            <Link to="/movies" className="cta-button">
              Movies
            </Link>
          </div>
          <p className="hero-subtitle">
            ***THIS IS A WPI STUDENT PROJECT***
          </p>
        </div>
        <div className="hero-image">
          <HeroImage />
        </div>
      </section>

      <section className="features-section">
        <h2>Watch Movies Better, Together</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <MdGroups />
            </div>
            <h3>Create Watch Groups</h3>
            <p>Form movie clubs, join friends, and maintain shared watchlists for your next movie night</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <MdStarRate />
            </div>
            <h3>Group Ratings</h3>
            <p>Rate movies together and see how your tastes align with your friends</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <MdChat />
            </div>
            <h3>Social Reviews</h3>
            <p>Share your thoughts and compare opinions with your movie-watching circle</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <MdRecommend />
            </div>
            <h3>Smart Recommendations</h3>
            <p>Get movie suggestions that everyone in your group will love</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How Movie Mates Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Group</h3>
            <p>Invite friends and form your movie-watching circle</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Build Your Watchlist</h3>
            <p>Collaborate on a shared list of movies to watch together</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Rate & Discuss</h3>
            <p>Share ratings and reviews with your group after watching</p>
          </div>
        </div>
      </section>

      <section className="social-proof">
        <h2>Join the Movie Community</h2>
        <div className="stats-container">
          <div className="stat">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Active Groups</span>
          </div>
          <div className="stat">
            <span className="stat-number">50K+</span>
            <span className="stat-label">Movies Rated</span>
          </div>
          <div className="stat">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Watch Parties</span>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to watch together?</h2>
        <p>Join Movie Mates and make movie nights better with friends</p>
        <div className="hero-buttons">
          <Link to="/dashboard" className="cta-button">
            Dashboard
          </Link>
          <Link to="/movies" className="cta-button">
            Movies
          </Link>
        </div>
      </section>
    </div>
  );
}; 
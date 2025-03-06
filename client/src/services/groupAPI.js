// client/src/services/groupAPI.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const groupAPI = {
    async getGroupById(groupId) {
        try {
            const res = await axios.get(`${API_URL}/api/groups/${groupId}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching group:', error);
            throw error;
        }
    },

    // Get members of a group
    async getGroupMembers(groupId) {
        try {
            const res = await axios.get(`${API_URL}/api/groups/${groupId}/members`);
            return res.data;
        } catch (error) {
            console.error('Error fetching group members:', error);
            throw error;
        }
    },

    async getUserGroups(userId) {
        try {
            const res = await axios.get(`${API_URL}/api/users/${userId}/groups`);
            return res.data;
        } catch (error) {
            console.error('Error fetching user groups:', error);
            throw error;
        }
    },

    async getGroupMovieNightSchedules(groupId) {
        try {
            const res = await axios.get(`${API_URL}/api/groups/${groupId}/movie-night-schedules`);
            return res.data;
        } catch (error) {
            console.error('Error fetching movie night schedules:', error);
            throw error;
        }
    },

    // Get movie nights for a group
    async getGroupMovieNights(groupId) {
        try {
            //const res = await axios.get(`${API_URL}/api/groups/${groupId}/movie-nights`);
            //return res.data;
        } catch (error) {
            console.error('Error fetching movie nights:', error);
            throw error;
        }
    },

    async getMovieAverageRating(groupId, movieId) {
        try {
            // const res = await axios.get(`${API_URL}/api/groups/${groupId}/movies/${movieId}/average-rating`);
            // return res.data;
        } catch (error) {
            console.error('Error fetching movie average rating:', error);
            throw error;
        }
    },

    async getUserReviews(userId) {
        try {
            // const res = await axios.get(`${API_URL}/api/users/${userId}/reviews`);
            // return res.data;
        } catch (error) {
            console.error('Error fetching user reviews:', error);
            throw error;
        }
    }
};
/**
 * API Client for Social Media Recommendation System
 * Connects React frontend to Python FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000';

class APIClient {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async fetch(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Check if API is available
    async healthCheck() {
        try {
            await this.fetch('/');
            return true;
        } catch {
            return false;
        }
    }

    // Get users with optional filters
    async getUsers(limit = 100, offset = 0, segment = null) {
        let url = `/users?limit=${limit}&offset=${offset}`;
        if (segment) url += `&segment=${encodeURIComponent(segment)}`;
        return this.fetch(url);
    }

    // Get single user
    async getUser(userId) {
        return this.fetch(`/users/${userId}`);
    }

    // Get recommendations for user
    async getRecommendations(userId, n = 10) {
        return this.fetch(`/recommendations/${userId}?n=${n}`);
    }

    // Get segment statistics
    async getSegments() {
        return this.fetch('/segments');
    }

    // Get city distribution
    async getCities() {
        return this.fetch('/cities');
    }

    // Get hourly engagement data
    async getHourlyEngagement() {
        return this.fetch('/engagement/hourly');
    }

    // Get weekly trends
    async getWeeklyTrends() {
        return this.fetch('/trends/weekly');
    }

    // Get summary stats
    async getSummaryStats() {
        return this.fetch('/stats/summary');
    }
}

// Create singleton instance
const apiClient = new APIClient();

// Export functions that mirror the old dataGenerator interface
// This allows gradual migration from frontend-only to API-backed

export const loadFromAPI = async () => {
    const isAvailable = await apiClient.healthCheck();
    if (!isAvailable) {
        console.warn('⚠️ Python API not available, falling back to frontend data');
        return null;
    }
    console.log('✅ Connected to Python ML backend');
    return true;
};

export const fetchUsersFromAPI = async (limit = 1000) => {
    try {
        const users = await apiClient.getUsers(limit);
        // Transform API response to match frontend format
        return users.map(user => ({
            userId: user.user_id,
            username: user.username,
            age: user.age,
            gender: user.gender,
            city: user.city ? user.city.charAt(0).toUpperCase() + user.city.slice(1) : 'Unknown',
            interests: user.interests ? user.interests.split(',').map(i => i.trim()) : [],
            followers: user.follower_count,
            following: user.following_count,
            posts: user.posts_count,
            likes: user.likes_received || 0,
            engagementRate: user.engagement_rate?.toFixed(2) || '0',
            influenceScore: user.influence_score?.toFixed(3) || '0',
            segment: user.segment_name || 'Unknown',
            segmentColor: getSegmentColor(user.segment_name),
            segmentId: user.segment
        }));
    } catch (error) {
        console.error('Failed to fetch users from API:', error);
        return null;
    }
};

export const fetchRecommendationsFromAPI = async (userId, n = 10) => {
    try {
        const recs = await apiClient.getRecommendations(userId, n);
        return recs.map(rec => ({
            userId: rec.user_id,
            username: rec.username,
            similarity: rec.similarity_score,
            segment: rec.segment,
            segmentColor: getSegmentColor(rec.segment),
            followers: rec.follower_count,
            interests: rec.interests ? rec.interests.split(',').map(i => i.trim()) : [],
            reason: rec.reason
        }));
    } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return null;
    }
};

export const fetchSegmentStatsFromAPI = async () => {
    try {
        const segments = await apiClient.getSegments();
        const stats = {};
        segments.forEach(seg => {
            stats[seg.name] = {
                name: seg.name,
                color: seg.color,
                count: seg.count,
                percentage: ((seg.count / segments.reduce((s, x) => s + x.count, 0)) * 100).toFixed(1),
                avgEngagement: seg.avg_engagement.toFixed(2),
                avgFollowers: Math.round(seg.avg_followers),
                avgInfluence: seg.avg_influence.toFixed(3)
            };
        });
        return stats;
    } catch (error) {
        console.error('Failed to fetch segment stats:', error);
        return null;
    }
};

export const fetchCitiesFromAPI = async () => {
    try {
        const cities = await apiClient.getCities();
        const distribution = {};
        cities.forEach(city => {
            distribution[city.city] = city.count;
        });
        return distribution;
    } catch (error) {
        console.error('Failed to fetch cities:', error);
        return null;
    }
};

export const fetchHourlyEngagementFromAPI = async () => {
    try {
        return await apiClient.getHourlyEngagement();
    } catch (error) {
        console.error('Failed to fetch hourly engagement:', error);
        return null;
    }
};

export const fetchWeeklyTrendFromAPI = async () => {
    try {
        return await apiClient.getWeeklyTrends();
    } catch (error) {
        console.error('Failed to fetch weekly trends:', error);
        return null;
    }
};

// Helper function to get segment color
function getSegmentColor(segmentName) {
    const colors = {
        'Micro-Influencers': '#f87171',
        'Engaged Creators': '#8b5cf6',
        'Rising Stars': '#06b6d4',
        'Active Community': '#10b981',
        'Casual Browsers': '#f59e0b',
        'Highly Engaged': '#3b82f6',
        'Growing Accounts': '#10b981',
        'Content Creators': '#ec4899',
        'Casual Users': '#6b7280',
        'Newbies': '#9ca3af'
    };
    return colors[segmentName] || '#6b7280';
}

export default apiClient;

// Load data from Kaggle dataset or generate synthetic data as fallback
let kaggleData = null;

// Segment definitions for K-Means clustering
export const segments = [
    { id: 0, name: 'Micro-Influencers', color: '#8b5cf6', minFollowers: 10000, minEngagement: 5 },
    { id: 1, name: 'Highly Engaged', color: '#3b82f6', minFollowers: 5000, minEngagement: 4 },
    { id: 2, name: 'Engaged Creators', color: '#3b82f6', minFollowers: 5000, minEngagement: 4 },
    { id: 3, name: 'Growing Accounts', color: '#10b981', minFollowers: 2000, minEngagement: 3 },
    { id: 4, name: 'Active Community', color: '#f59e0b', minFollowers: 500, minEngagement: 2 },
    { id: 5, name: 'Content Creators', color: '#ec4899', minFollowers: 1000, minEngagement: 3 },
    { id: 6, name: 'Casual Users', color: '#6b7280', minFollowers: 0, minEngagement: 0 },
    { id: 7, name: 'Newbies', color: '#6b7280', minFollowers: 0, minEngagement: 0 }
];

const interests = ['technology', 'fashion', 'travel', 'food', 'fitness', 'gaming', 'music', 'art', 'sports', 'photography', 'business', 'education'];
const cities = ['New York', 'Los Angeles', 'London', 'Mumbai', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Toronto', 'Dubai', 'Singapore'];
const genders = ['Male', 'Female', 'Non-binary'];

// Load Kaggle data
export const loadKaggleData = async () => {
    try {
        const response = await fetch('/kaggle_users.json');
        if (response.ok) {
            kaggleData = await response.json();
            console.log(`✅ Loaded ${kaggleData.length} users from Kaggle dataset`);
            return kaggleData;
        }
    } catch (error) {
        console.log('⚠️ Kaggle data not available, using synthetic data');
    }
    return null;
};

// Generate synthetic social media user data (fallback)
export const generateUserData = (numUsers = 1000) => {
    // If Kaggle data is loaded, use it
    if (kaggleData && kaggleData.length > 0) {
        console.log(`📊 Using ${Math.min(numUsers, kaggleData.length)} users from Kaggle dataset`);
        return kaggleData.slice(0, numUsers);
    }

    // Otherwise generate synthetic data
    console.log(`🔄 Generating ${numUsers} synthetic users`);
    const users = [];

    for (let i = 0; i < numUsers; i++) {
        const userInterests = [];
        const numInterests = Math.floor(Math.random() * 4) + 2;

        for (let j = 0; j < numInterests; j++) {
            const interest = interests[Math.floor(Math.random() * interests.length)];
            if (!userInterests.includes(interest)) {
                userInterests.push(interest);
            }
        }

        const followers = Math.floor(Math.random() * 50000) + 100;
        const following = Math.floor(Math.random() * 2000) + 50;
        const posts = Math.floor(Math.random() * 500) + 10;
        const likes = followers * (0.05 + Math.random() * 0.1);

        users.push({
            userId: `U${String(i + 1).padStart(4, '0')}`,
            username: `user_${i + 1}`,
            age: Math.floor(Math.random() * 40) + 18,
            gender: genders[Math.floor(Math.random() * genders.length)],
            city: cities[Math.floor(Math.random() * cities.length)],
            interests: userInterests,
            followers: followers,
            following: following,
            posts: posts,
            likes: Math.floor(likes),
            comments: Math.floor(likes * 0.15),
            shares: Math.floor(likes * 0.05),
            engagementRate: ((likes + likes * 0.15 + likes * 0.05) / followers * 100).toFixed(2),
            influenceScore: (Math.random() * 0.5 + 0.3).toFixed(3)
        });
    }

    return users;
};

// K-Means clustering simulation (or use existing segment from Kaggle data)
export const performClustering = (users) => {
    return users.map(user => {
        // If user already has segment from Kaggle data
        if (user.segment && user.segmentColor) {
            return user;
        }

        // Otherwise compute segment
        let segment = segments.find(s => s.name === 'Casual Users') || segments[segments.length - 1];

        for (let i = 0; i < segments.length - 1; i++) {
            if (user.followers >= segments[i].minFollowers &&
                parseFloat(user.engagementRate) >= segments[i].minEngagement) {
                segment = segments[i];
                break;
            }
        }

        return { ...user, segment: segment.name, segmentColor: segment.color, segmentId: segment.id };
    });
};

// Calculate similarity between two users
export const calculateSimilarity = (user1, user2) => {
    // Interest overlap (Jaccard similarity)
    const interests1 = new Set(user1.interests || []);
    const interests2 = new Set(user2.interests || []);
    const intersection = new Set([...interests1].filter(x => interests2.has(x)));
    const union = new Set([...interests1, ...interests2]);
    const interestSim = union.size > 0 ? intersection.size / union.size : 0;

    // Age similarity
    const ageDiff = Math.abs((user1.age || 25) - (user2.age || 25));
    const ageSim = Math.max(0, 1 - ageDiff / 50);

    // Engagement similarity
    const engagementDiff = Math.abs(parseFloat(user1.engagementRate || 5) - parseFloat(user2.engagementRate || 5));
    const engagementSim = Math.max(0, 1 - engagementDiff / 20);

    // City bonus (same city = more similar)
    const cityBonus = user1.city === user2.city ? 0.1 : 0;

    // Combined score
    return Math.min(1, 0.45 * interestSim + 0.25 * ageSim + 0.2 * engagementSim + cityBonus);
};

// Generate recommendation reason
const generateReason = (user1, user2) => {
    const shared = (user1.interests || []).filter(i => (user2.interests || []).includes(i));

    if (shared.length >= 3) {
        return `Shares ${shared.length} interests: ${shared.slice(0, 3).join(', ')}`;
    } else if (user1.city === user2.city) {
        return `Also in ${user2.city}`;
    } else if (user1.segment === user2.segment) {
        return `Similar profile (${user1.segment})`;
    } else if (Math.abs((user1.age || 25) - (user2.age || 25)) <= 5) {
        return `Similar age group (${user2.age} years old)`;
    } else if (shared.length > 0) {
        return `Shares interest: ${shared[0]}`;
    } else {
        return 'Similar engagement patterns';
    }
};

// Get recommendations for a user
export const getRecommendations = (targetUser, allUsers, n = 10) => {
    const recommendations = allUsers
        .filter(user => user.userId !== targetUser.userId)
        .map(user => ({
            ...user,
            similarity: calculateSimilarity(targetUser, user),
            sharedInterests: (targetUser.interests || []).filter(i => (user.interests || []).includes(i)),
            reason: generateReason(targetUser, user)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, n);

    return recommendations;
};

// Get segment statistics
export const getSegmentStats = (users) => {
    const stats = {};
    const segmentNames = [...new Set(users.map(u => u.segment))];

    segmentNames.forEach(segName => {
        const segUsers = users.filter(u => u.segment === segName);
        const count = segUsers.length;

        if (count > 0) {
            const segDef = segments.find(s => s.name === segName) || { color: '#6b7280' };
            stats[segName] = {
                name: segName,
                color: segDef.color,
                count: count,
                percentage: ((count / users.length) * 100).toFixed(1),
                avgEngagement: (segUsers.reduce((sum, u) => sum + parseFloat(u.engagementRate || 0), 0) / count).toFixed(2),
                avgFollowers: Math.round(segUsers.reduce((sum, u) => sum + (u.followers || 0), 0) / count),
                avgPosts: Math.round(segUsers.reduce((sum, u) => sum + (u.posts || 0), 0) / count)
            };
        }
    });

    return stats;
};

// Get city distribution
export const getCityDistribution = (users) => {
    const distribution = {};

    users.forEach(user => {
        const city = user.city || 'Unknown';
        distribution[city] = (distribution[city] || 0) + 1;
    });

    // Sort by count and return top cities
    const sorted = Object.entries(distribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    return Object.fromEntries(sorted);
};

// Get engagement by hour (simulated)
export const getEngagementByHour = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
        let baseEngagement = 100;
        if (i >= 9 && i <= 11) baseEngagement = 250;
        if (i >= 12 && i <= 14) baseEngagement = 200;
        if (i >= 18 && i <= 22) baseEngagement = 350;
        if (i >= 0 && i <= 6) baseEngagement = 50;

        hours.push({
            hour: i,
            engagement: baseEngagement + Math.floor(Math.random() * 50)
        });
    }
    return hours;
};

// Get weekly engagement trend
export const getWeeklyTrend = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
        day,
        engagement: Math.floor(Math.random() * 30) + 70,
        followers: Math.floor(Math.random() * 500) + 100
    }));
};

// Export all interests for filtering
export { interests, cities, genders };

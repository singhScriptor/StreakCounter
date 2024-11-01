async function fetchContributions(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/events`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching contributions:", error);
        return [];
    }
}

function calculateStreaks(contributions) {
    let total = 0; // Initialize total contributions count
    let currentStreak = 0;
    let longestStreak = 0;

    // Filter only relevant events
    const validEvents = contributions.filter(event => 
        event.type === 'PushEvent' || 
        event.type === 'PullRequestEvent' || 
        event.type === 'IssuesEvent' // You can add more relevant event types here
    );

    // Create a Set to store unique contribution dates
    const contributionDates = new Set();

    validEvents.forEach(event => {
        const date = new Date(event.created_at).setHours(0, 0, 0, 0);
        contributionDates.add(date);
    });

    // Total contributions count is the size of the Set
    total = contributionDates.size;

    // Sort dates for streak calculation
    const dates = Array.from(contributionDates).sort((a, b) => b - a); // Sort in descending order

    let lastDate = null;

    dates.forEach(date => {
        if (lastDate === null) {
            currentStreak = 1; // First contribution
        } else {
            const difference = (lastDate - date) / (1000 * 60 * 60 * 24); // Difference in days
            if (difference === 1) {
                currentStreak++; // Increment streak for consecutive days
            } else if (difference > 1) {
                longestStreak = Math.max(longestStreak, currentStreak); // Update longest streak
                currentStreak = 1; // Reset current streak
            }
        }
        lastDate = date; // Update lastDate
    });

    // Final check for longest streak
    longestStreak = Math.max(longestStreak, currentStreak);

    return { total, currentStreak, longestStreak };
}

function updateCircles(total, currentStreak, longestStreak) {
    document.getElementById('circle-total').style.setProperty('--progress', total > 0 ? (total / 100) * 360 : 0);
    document.getElementById('circle-current').style.setProperty('--progress', currentStreak > 0 ? (currentStreak / 100) * 360 : 0);
    document.getElementById('circle-longest').style.setProperty('--progress', longestStreak > 0 ? (longestStreak / 100) * 360 : 0);
}

async function updateStreak(username) {
    const contributions = await fetchContributions(username);
    console.log(contributions); // Log contributions data for debugging

    const { total, currentStreak, longestStreak } = calculateStreaks(contributions);

    // Update circles with calculated values
    updateCircles(total, currentStreak, longestStreak);
}

// Replace 'Dhirajkr08' with the desired username
updateStreak('Dhirajkr08');

async function fetchContributions(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/events/public`);
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
    let total = 0;
    let currentStreak = 0;
    let longestStreak = 0;

    const validEvents = contributions.filter(event =>
        event.type === 'PushEvent' ||
        event.type === 'PullRequestEvent' ||
        event.type === 'IssuesEvent'
    );

    console.log("Valid events count:", validEvents.length); // Debugging output

    const contributionDates = new Set();
    validEvents.forEach(event => {
        const date = new Date(event.created_at).setHours(0, 0, 0, 0);
        contributionDates.add(date);
    });

    console.log("Contribution dates:", Array.from(contributionDates)); // Debugging output

    total = contributionDates.size;
    const dates = Array.from(contributionDates).sort((a, b) => a - b);

    let lastDate = null;
    let tempStreak = 0;
    dates.forEach(date => {
        if (lastDate !== null) {
            const difference = (date - lastDate) / (1000 * 60 * 60 * 24);
            if (difference === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        } else {
            tempStreak = 1;
        }
        lastDate = date;
    });

    currentStreak = tempStreak;
    longestStreak = Math.max(longestStreak, currentStreak);

    return { total, currentStreak, longestStreak };
}

function updateCircles(total, currentStreak, longestStreak) {
    const circleTotal = document.querySelector('#circle-total .circle-ring');
    const circleCurrent = document.querySelector('#circle-current .circle-ring');
    const circleLongest = document.querySelector('#circle-longest .circle-ring');

    const totalPercent = total > 0 ? (total / 400) * 360 : 0;  // Assuming max contributions at 400 for the ring
    const currentPercent = currentStreak > 0 ? (currentStreak / 30) * 360 : 0;  // Assuming max streak days at 30 for the ring
    const longestPercent = longestStreak > 0 ? (longestStreak / 30) * 360 : 0;  // Same for the longest streak

    circleTotal.style.setProperty('--progress', totalPercent);
    circleCurrent.style.setProperty('--progress', currentPercent);
    circleLongest.style.setProperty('--progress', longestPercent);

    document.querySelector('#circle-total p').textContent = `Total Contributions: ${total}`;
    document.querySelector('#circle-current p').textContent = `Current Streak: ${currentStreak}`;
    document.querySelector('#circle-longest p').textContent = `Longest Streak: ${longestStreak}`;
}

async function updateStreak(username) {
    const contributions = await fetchContributions(username);
    const { total, currentStreak, longestStreak } = calculateStreaks(contributions);
    updateCircles(total, currentStreak, longestStreak);
}

// Call the function with a specific username
updateStreak('Dhirajkr08');

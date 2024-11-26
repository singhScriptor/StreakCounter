document.getElementById('streak-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    if (username) {
        getGitHubStats(username);
    } else {
        alert('Please enter a valid GitHub username.');
    }
});

async function fetchRepos(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const repos = await response.json();
        return repos.map(repo => repo.name);
    } catch (error) {
        console.error("Error fetching repos:", error);
        return [];
    }
}

async function fetchCommits(username, repo) {
    try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/commits?per_page=100`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const commits = await response.json();
        return commits.map(commit => commit.commit.author.date.split('T')[0]);
    } catch (error) {
        console.error(`Error fetching commits for repo ${repo}:`, error);
        return [];
    }
}

async function fetchCommitData(username) {
    const repos = await fetchRepos(username);
    let allCommitDates = [];
    for (const repo of repos) {
        const commitDates = await fetchCommits(username, repo);
        allCommitDates = allCommitDates.concat(commitDates);
    }
    return allCommitDates;
}

function calculateStreaks(dates) {
    const uniqueDates = Array.from(new Set(dates)).sort();
    let totalCommits = dates.length;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const diffDays = (currentDate - lastDate) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
        lastDate = currentDate;
    }

    currentStreak = tempStreak;
    longestStreak = Math.max(longestStreak, currentStreak);

    return { totalCommits, currentStreak, longestStreak };
}

function updateUI(totalCommits, currentStreak, longestStreak) {
    document.querySelector('#circle-total p').textContent = `Total Contributions: ${totalCommits}`;
    document.querySelector('#circle-current p').textContent = `Current Streak: ${currentStreak}`;
    document.querySelector('#circle-longest p').textContent = `Longest Streak: ${longestStreak}`;

    const totalPercent = totalCommits > 0 ? (totalCommits / totalCommits) * 360 : 0;
    const currentPercent = currentStreak > 0 ? (currentStreak / 365) * 360 : 0;
    const longestPercent = longestStreak > 0 ? (longestStreak / 365) * 360 : 0;

    document.querySelector('#circle-total .circle-ring').style.setProperty('--progress', totalPercent);
    document.querySelector('#circle-current .circle-ring').style.setProperty('--progress', currentPercent);
    document.querySelector('#circle-longest .circle-ring').style.setProperty('--progress', longestPercent);
}

async function getGitHubStats(username) {
    try {
        const commitDates = await fetchCommitData(username);
        console.log('Commit Dates:', commitDates);
        if (commitDates.length > 0) {
            const { totalCommits, currentStreak, longestStreak } = calculateStreaks(commitDates);
            updateUI(totalCommits, currentStreak, longestStreak);
        } else {
            updateUI(0, 0, 0);
        }
    } catch (error) {
        console.error("Error updating streak:", error);
        updateUI(0, 0, 0);
    }
}

// Initial state
updateUI(0, 0, 0);

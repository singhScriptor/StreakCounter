document.getElementById('streak-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    if (username) {
        console.log('Fetching stats for:', username);
        getGitHubStats(username);
    } else {
        alert('Please enter a valid GitHub username.');
    }
});

async function fetchRepos(username) {
    try {
        console.log('Fetching repositories for:', username);
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const repos = await response.json();
        console.log('Repositories fetched:', repos);
        return repos.map(repo => repo.name);
    } catch (error) {
        console.error("Error fetching repos:", error);
        return [];
    }
}

async function fetchCommits(username, repo) {
    try {
        console.log(`Fetching commits for repo: ${repo}`);
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/commits?per_page=100`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const commits = await response.json();
        console.log(`Commits fetched for repo: ${repo}`, commits);
        return commits.map(commit => commit.commit.author.date.split('T')[0]);
    } catch (error) {
        console.error(`Error fetching commits for repo ${repo}:`, error);
        return [];
    }
}

async function fetchCommitData(username) {
    try {
        const repos = await fetchRepos(username);
        let allCommitDates = [];
        for (const repo of repos) {
            const commitDates = await fetchCommits(username, repo);
            allCommitDates = allCommitDates.concat(commitDates);
        }
        console.log('All commit dates fetched:', allCommitDates);
        return allCommitDates;
    } catch (error) {
        console.error("Error fetching commit data:", error);
        return [];
    }
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
    const totalCircle = document.querySelector('#circle-total');
    const currentCircle = document.querySelector('#circle-current');
    const longestCircle = document.querySelector('#circle-longest');

    if (totalCircle && currentCircle && longestCircle) {
        console.log('Updating UI with:', totalCommits, currentStreak, longestStreak);
        totalCircle.querySelector('p').textContent = `Total Contributions: ${totalCommits}`;
        currentCircle.querySelector('p').textContent = `Current Streak: ${currentStreak}`;
        longestCircle.querySelector('p').textContent = `Longest Streak: ${longestStreak}`;

        const totalPercent = totalCommits > 0 ? 360 : 0;
        const currentPercent = currentStreak > 0 ? (currentStreak / 365) * 360 : 0;
        const longestPercent = longestStreak > 0 ? (longestStreak / 365) * 360 : 0;

        totalCircle.querySelector('.circle-ring').style.setProperty('--progress', totalPercent);
        currentCircle.querySelector('.circle-ring').style.setProperty('--progress', currentPercent);
        longestCircle.querySelector('.circle-ring').style.setProperty('--progress', longestPercent);
    } else {
        console.error("UI elements not found");
    }
}

async function getGitHubStats(username) {
    try {
        const commitDates = await fetchCommitData(username);
        if (commitDates.length > 0) {
            console.log('Commit Dates:', commitDates);
            const { totalCommits, currentStreak, longestStreak } = calculateStreaks(commitDates);
            console.log('Calculated Streaks:', { totalCommits, currentStreak, longestStreak });
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

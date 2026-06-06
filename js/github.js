// GitHub API — all data fetching lives here
const GitHub = (() => {
  const BASE = 'https://api.github.com';

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  async function fetchJSON(url) {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      if (res.status === 404) throw new Error('User not found. Check the username and try again.');
      if (res.status === 403) throw new Error('GitHub API rate limit reached. Wait a minute and try again.');
      throw new Error(`GitHub API error (${res.status})`);
    }
    return res.json();
  }

  async function getUser(username) {
    return fetchJSON(`${BASE}/users/${username}`);
  }

  async function getRepos(username) {
    // Fetch up to 100 repos sorted by most recently pushed
    return fetchJSON(`${BASE}/users/${username}/repos?per_page=100&sort=pushed`);
  }

  // Aggregate language stats from repos
  function aggregateLangs(repos) {
    const counts = {};
    const repoNames = {};
    for (const repo of repos) {
      if (repo.fork) continue;
      if (!repo.language) continue;
      counts[repo.language] = (counts[repo.language] || 0) + 1;
      if (!repoNames[repo.language]) repoNames[repo.language] = [];
      repoNames[repo.language].push(repo.name);
    }
    return { counts, repoNames };
  }

  // Get top repos (non-fork, sorted by stars)
  function getTopRepos(repos, limit = 5) {
    return repos
      .filter(r => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, limit);
  }

  // Compute summary stats
  function computeStats(user, repos) {
    const ownRepos = repos.filter(r => !r.fork);
    const totalStars = ownRepos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    const totalForks = ownRepos.reduce((s, r) => s + (r.forks_count || 0), 0);
    const totalWatchers = ownRepos.reduce((s, r) => s + (r.watchers_count || 0), 0);
    const accountAgeYears = Math.floor(
      (Date.now() - new Date(user.created_at)) / (365.25 * 24 * 3600 * 1000)
    );
    const joinYear = new Date(user.created_at).getFullYear();

    return {
      totalRepos: user.public_repos,
      totalStars,
      totalForks,
      totalWatchers,
      followers: user.followers,
      following: user.following,
      accountAgeYears,
      joinYear,
    };
  }

  // Monthly activity from updatedAt dates (last 12 months)
  function buildActivityData(repos) {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleString('default', { month: 'short' }),
        count: 0,
      });
    }

    for (const repo of repos) {
      const updated = repo.pushed_at || repo.updated_at;
      if (!updated) continue;
      const d = new Date(updated);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const slot = months.find(m => m.key === key);
      if (slot) slot.count++;
    }

    return months;
  }

  // Format large numbers
  function fmtNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
    return String(n);
  }

  return { getUser, getRepos, aggregateLangs, getTopRepos, computeStats, buildActivityData, fmtNum };
})();

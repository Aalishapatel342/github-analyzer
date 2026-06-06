// Render — all DOM updates live here
const Render = (() => {

  // ── Profile Card ──────────────────────────────────────────────
  function profile(user) {
    const el = document.getElementById('profileCard');

    const location = user.location
      ? `<span class="meta-item">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
           ${escHtml(user.location)}
         </span>` : '';

    const company = user.company
      ? `<span class="meta-item">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
           ${escHtml(user.company.replace('@', ''))}
         </span>` : '';

    const blog = user.blog
      ? `<span class="meta-item">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
           <a href="${escHtml(ensureHttp(user.blog))}" target="_blank" rel="noopener">${escHtml(user.blog)}</a>
         </span>` : '';

    const twitter = user.twitter_username
      ? `<span class="meta-item">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
           @${escHtml(user.twitter_username)}
         </span>` : '';

    el.innerHTML = `
      <img class="profile-avatar" src="${escHtml(user.avatar_url)}&s=160" alt="${escHtml(user.login)} avatar" />
      <div class="profile-body">
        <div class="profile-name">${escHtml(user.name || user.login)}</div>
        <div class="profile-login">@${escHtml(user.login)}</div>
        ${user.bio ? `<div class="profile-bio">${escHtml(user.bio)}</div>` : ''}
        <div class="profile-meta">
          ${location}${company}${blog}${twitter}
        </div>
        <div class="profile-actions">
          <a href="${escHtml(user.html_url)}" target="_blank" rel="noopener" class="gh-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View on GitHub
          </a>
        </div>
      </div>`;
  }

  // ── Stats Grid ────────────────────────────────────────────────
  function stats(statsData) {
    const el = document.getElementById('statsGrid');
    const items = [
      { label: 'Public Repos', value: GitHub.fmtNum(statsData.totalRepos), sub: 'repositories', color: '#0ff4c6' },
      { label: 'Total Stars',  value: GitHub.fmtNum(statsData.totalStars),  sub: 'across all repos', color: '#f1e05a' },
      { label: 'Total Forks',  value: GitHub.fmtNum(statsData.totalForks),  sub: 'by the community', color: '#7c6cfa' },
      { label: 'Followers',    value: GitHub.fmtNum(statsData.followers),   sub: `following ${GitHub.fmtNum(statsData.following)}`, color: '#ff5e7a' },
    ];
    el.innerHTML = items.map(item => `
      <div class="stat-card" style="--accent-color: ${item.color}">
        <div class="stat-label">${item.label}</div>
        <div class="stat-value">${item.value}</div>
        <div class="stat-sub">${item.sub}</div>
      </div>`).join('');
  }

  // ── Languages ─────────────────────────────────────────────────
  function languages(langs) {
    const el = document.getElementById('langList');
    const countEl = document.getElementById('langCount');
    countEl.textContent = langs.length + ' languages';

    if (langs.length === 0) {
      el.innerHTML = '<div style="color:var(--text3);font-size:13px;">No language data available.</div>';
      return;
    }

    const maxCount = langs[0][1];
    el.innerHTML = langs.map(([lang, count], i) => {
      const total = langs.reduce((s, [, c]) => s + c, 0);
      const pct = Math.round((count / total) * 100);
      const barW = Math.round((count / maxCount) * 100);
      const color = getLangColor(lang);
      return `
        <div class="lang-row" style="animation-delay:${i * 60}ms">
          <div class="lang-name">
            <span class="lang-dot" style="background:${color}"></span>
            ${escHtml(lang)}
          </div>
          <div class="lang-bar-bg">
            <div class="lang-bar" style="width:${barW}%;background:${color}"></div>
          </div>
          <div class="lang-pct">${pct}%</div>
          <div class="lang-repos">${count} repo${count !== 1 ? 's' : ''}</div>
        </div>`;
    }).join('');
  }

  // ── Top Repos ─────────────────────────────────────────────────
  function repos(topRepos) {
    const el = document.getElementById('repoList');
    const countEl = document.getElementById('repoCount');
    countEl.textContent = 'top ' + topRepos.length;

    if (topRepos.length === 0) {
      el.innerHTML = '<div style="color:var(--text3);font-size:13px;">No public repositories found.</div>';
      return;
    }

    el.innerHTML = topRepos.map(repo => {
      const langDot = repo.language
        ? `<span class="repo-stat"><span class="lang-dot" style="background:${getLangColor(repo.language)};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:3px"></span>${escHtml(repo.language)}</span>`
        : '';

      const issues = repo.open_issues_count
        ? `<span class="repo-stat">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
             ${repo.open_issues_count}
           </span>`
        : '';

      return `
        <div class="repo-item">
          <div class="repo-name">
            <a href="${escHtml(repo.html_url)}" target="_blank" rel="noopener">${escHtml(repo.name)}</a>
          </div>
          ${repo.description ? `<div class="repo-desc">${escHtml(repo.description)}</div>` : ''}
          <div class="repo-stats">
            <span class="repo-stat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${GitHub.fmtNum(repo.stargazers_count)}
            </span>
            <span class="repo-stat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>
              ${GitHub.fmtNum(repo.forks_count)}
            </span>
            ${langDot}
            ${issues}
          </div>
        </div>`;
    }).join('');
  }

  // ── Activity Chart ────────────────────────────────────────────
  function activity(months) {
    const el = document.getElementById('activityChart');
    const max = Math.max(...months.map(m => m.count), 1);

    el.innerHTML = months.map(m => {
      const h = Math.max(Math.round((m.count / max) * 100), 3);
      const opacity = 0.25 + (m.count / max) * 0.75;
      return `
        <div class="act-wrapper" title="${m.label}: ${m.count} repo${m.count !== 1 ? 's' : ''} updated">
          <div class="act-col" style="height:${h}%;background:var(--accent);opacity:${opacity.toFixed(2)};border-radius:3px 3px 0 0;"></div>
          <div style="font-size:9px;color:var(--text3);margin-top:4px;white-space:nowrap;">${m.label}</div>
        </div>`;
    }).join('');
  }

  // ── Helpers ───────────────────────────────────────────────────
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function ensureHttp(url) {
    if (!url) return '#';
    return url.startsWith('http') ? url : 'https://' + url;
  }

  return { profile, stats, languages, repos, activity };
})();
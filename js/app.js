// GitScope — main app controller
const GitScope = (() => {

  // ── UI helpers ────────────────────────────────────────────────
  function setStatus(msg, loading = true) {
    const bar  = document.getElementById('statusBar');
    const text = document.getElementById('statusText');
    const dots = document.getElementById('loaderDots');
    bar.classList.remove('hidden');
    text.textContent = msg;
    dots.style.display = loading ? 'flex' : 'none';
  }

  function clearStatus() {
    document.getElementById('statusBar').classList.add('hidden');
  }

  function showError(msg) {
    clearStatus();
    const box = document.getElementById('errorBox');
    document.getElementById('errorText').textContent = msg;
    box.classList.remove('hidden');
  }

  function clearError() {
    document.getElementById('errorBox').classList.add('hidden');
  }

  function setBtn(disabled) {
    document.getElementById('analyzeBtn').disabled = disabled;
  }

  function showResults() {
    document.getElementById('results').classList.remove('hidden');
    // Scroll to results smoothly
    setTimeout(() => {
      document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function hideResults() {
    document.getElementById('results').classList.add('hidden');
  }

  // ── Main analyze flow ─────────────────────────────────────────
  async function analyze() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) {
      document.getElementById('usernameInput').focus();
      return;
    }

    clearError();
    hideResults();
    setBtn(true);
    setStatus('Fetching profile…');

    try {
      // Step 1: Fetch user + repos in parallel
      const [user, repos] = await Promise.all([
        GitHub.getUser(username),
        GitHub.getRepos(username),
      ]);

      setStatus('Analyzing repositories…');

      // Step 2: Process data
      const { counts: langCounts } = GitHub.aggregateLangs(repos);
      const sortedLangs = Object.entries(langCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      const topRepos   = GitHub.getTopRepos(repos, 5);
      const statsData  = GitHub.computeStats(user, repos);
      const activity   = GitHub.buildActivityData(repos);

      setStatus('Rendering results…');

      // Step 3: Render everything
      Render.profile(user);
      Render.stats(statsData);
      Render.languages(sortedLangs);
      Render.repos(topRepos);
      Render.activity(activity);

      showResults();
      clearStatus();
      setBtn(false);

      // Update page title
      document.title = `${user.name || user.login} — GitScope`;

    } catch (err) {
      showError(err.message);
      clearStatus();
      setBtn(false);
    }
  }

  function loadSuggestion(username) {
    document.getElementById('usernameInput').value = username;
    analyze();
  }

  // ── Keyboard shortcut ─────────────────────────────────────────
  function init() {
    const input = document.getElementById('usernameInput');

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') analyze();
    });

    // Global: press '/' to focus search
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });

    // Auto-analyze if there's a ?user= query param
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      input.value = userParam;
      analyze();
    }
  }

  return { analyze, loadSuggestion, init };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => GitScope.init());
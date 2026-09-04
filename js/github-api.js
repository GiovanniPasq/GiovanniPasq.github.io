// Language color map
const LANG_COLORS = {
    Python: '#3572A5',
    JavaScript: '#f1e05a',
    Java: '#b07219',
    'C++': '#f34b7d',
    'C#': '#178600',
    TypeScript: '#2b7489',
    Jupyter: '#DA5B0B',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
};

async function loadAllRepos() {
    const username = "GiovanniPasq";
    const specialRepos = ["GiovanniPasq/DA-Faster-RCNN"];
    // Repos linked to publications are shown in the Publications section, not here
    const pubRepos = new Set(["stmda-retinanet", "da-retinanet", "mits-gan"]);
    const container = document.getElementById("repos");
    if (!container) return;

    let allProjectData = [];
    const addedRepos = new Set();

    try {
        // Load special/research repos first
        for (const repoPath of specialRepos) {
            const res = await fetch(`https://api.github.com/repos/${repoPath}`);
            if (res.ok) {
                const data = await res.json();
                data.isSpecial = true;
                allProjectData.push(data);
                addedRepos.add(data.name.toLowerCase());
            }
        }

        // Load personal repos
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=updated`);
        if (res.ok) {
            const personalRepos = await res.json();
            personalRepos.forEach(repo => {
                const repoNameLower = repo.name.toLowerCase();
                const isSiteRepo = repoNameLower === username.toLowerCase() || repoNameLower === `${username.toLowerCase()}.github.io`;
                if (!addedRepos.has(repoNameLower) && !isSiteRepo && !pubRepos.has(repoNameLower)) {
                    repo.isSpecial = false;
                    allProjectData.push(repo);
                }
            });
        }

        // Sort by stars descending
        allProjectData.sort((a, b) => b.stargazers_count - a.stargazers_count);

        container.innerHTML = "";
        allProjectData.forEach((repo, i) => {
            const card = createRepoCard(repo);
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            card.style.transition = `opacity 0.4s ease ${i * 50}ms, transform 0.4s ease ${i * 50}ms`;
            container.appendChild(card);
            // Trigger animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            });
        });

        if (allProjectData.length === 0) {
            container.innerHTML = '<p style="color:var(--muted); font-size:14px; padding:24px 0;">No repositories found.</p>';
        }

    } catch (e) {
        console.error("Error loading GitHub repositories:", e);
        container.innerHTML = '<p style="color:var(--muted); font-size:14px; padding:24px 0;">Unable to load projects at this time.</p>';
    }
}

function createRepoCard(repo) {
    const lang = repo.language || 'Python';
    const color = LANG_COLORS[lang] || '#888';

    const card = document.createElement("a");
    card.href = repo.html_url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.className = "repo-card";
    card.innerHTML = `
        <div>
            ${repo.isSpecial ? '<span class="badge">Research</span>' : ''}
            <h3>${repo.name.replace(/-/g, '&#8209;')}</h3>
            <p>${repo.description || "Deep learning research project."}</p>
        </div>
        <div class="repo-meta">
            <span>
                <span class="lang-dot" style="background:${color}"></span>
                ${lang}
            </span>
            <span>★ ${repo.stargazers_count}</span>
            <span>
                <svg style="width:10px;fill:currentColor;vertical-align:middle;margin-right:3px" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
                </svg>
                ${repo.forks_count}
            </span>
        </div>
    `;
    return card;
}

loadAllRepos();

async function loadPubRepoStats() {
    const repoLinks = document.querySelectorAll('.pub-link--repo[data-repo]');
    for (const link of repoLinks) {
        const repoPath = link.dataset.repo;
        try {
            const res = await fetch(`https://api.github.com/repos/${repoPath}`);
            if (res.ok) {
                const data = await res.json();
                link.href = data.html_url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                const starsEl = link.querySelector('.stat-stars');
                const forksEl = link.querySelector('.stat-forks');
                if (starsEl) starsEl.textContent = data.stargazers_count;
                if (forksEl) forksEl.textContent = data.forks_count;
            }
        } catch (e) {
            console.error('Failed to load stats for', repoPath, e);
        }
    }
}

async function loadLiveProjectStats() {
    const statElements = document.querySelectorAll('.repo-stat-live[data-repo]');
    for (const el of statElements) {
        const repoPath = el.dataset.repo;
        try {
            const res = await fetch(`https://api.github.com/repos/${repoPath}`);
            if (res.ok) {
                const data = await res.json();
                const stars = data.stargazers_count;
                el.textContent = stars >= 1000 ? `★ ${(stars / 1000).toFixed(1)}k` : `★ ${stars}`;
            }
        } catch (e) {
            console.error('Failed to load stats for', repoPath, e);
        }
    }
}

loadPubRepoStats();
loadLiveProjectStats();
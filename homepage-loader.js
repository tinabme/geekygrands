function escapeText(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderRecipeCard(entry) {
    const title = escapeText(entry.card?.title || entry.title || 'Untitled Recipe');
    const summary = escapeText(entry.card?.summary || '');
    const emoji = escapeText(entry.card?.emoji || '🍽️');
    const slug = encodeURIComponent(entry.slug);

    return `
        <article class="recipe-card">
            <div class="recipe-image">${emoji}</div>
            <h4>${title}</h4>
            <p>${summary}</p>
            <a href="recipe.html?slug=${slug}" class="recipe-link">View Recipe →</a>
        </article>
    `;
}

function renderTipCard(entry) {
    const title = escapeText(entry.card?.title || entry.title || 'Untitled Guide');
    const summary = escapeText(entry.card?.summary || '');
    const emoji = escapeText(entry.card?.emoji || '📚');
    const slug = encodeURIComponent(entry.slug);

    return `
        <article class="tech-card">
            <div class="tech-icon">${emoji}</div>
            <h4>${title}</h4>
            <p>${summary}</p>
            <a href="tip.html?slug=${slug}" class="tech-link">Learn More →</a>
        </article>
    `;
}

function renderPostCard(entry) {
    const title = escapeText(entry.card?.title || entry.title || 'Untitled Post');
    const summary = escapeText(entry.card?.summary || '');
    const dateLabel = escapeText(entry.meta?.find(item => item.label === 'Published')?.value || 'Recent Reflection');
    const slug = encodeURIComponent(entry.slug);

    return `
        <article class="blog-card">
            <div class="blog-date">${dateLabel}</div>
            <h4>${title}</h4>
            <p>${summary}</p>
            <a href="post.html?slug=${slug}" class="blog-link">Read Reflection →</a>
        </article>
    `;
}

async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}`);
    }
    return response.json();
}

async function loadHomepageCards() {
    const recipeRoot = document.getElementById('recipe-cards-root');
    const tipRoot = document.getElementById('tip-cards-root');
    const postRoot = document.getElementById('post-cards-root');

    if (!recipeRoot || !tipRoot) {
        return;
    }

    recipeRoot.setAttribute('aria-busy', 'true');
    tipRoot.setAttribute('aria-busy', 'true');
    if (postRoot) {
        postRoot.setAttribute('aria-busy', 'true');
    }

    try {
        const manifest = await loadJson('data/homepage.json');

        const recipeEntries = await Promise.all(
            (manifest.recipes || []).map(slug => loadJson(`data/recipes/${encodeURIComponent(slug)}.json`))
        );

        const tipEntries = await Promise.all(
            (manifest.tips || []).map(slug => loadJson(`data/tips/${encodeURIComponent(slug)}.json`))
        );

        const postEntries = await Promise.all(
            (manifest.posts || []).map(slug => loadJson(`data/posts/${encodeURIComponent(slug)}.json`))
        );

        recipeRoot.innerHTML = recipeEntries.map(renderRecipeCard).join('');
        tipRoot.innerHTML = tipEntries.map(renderTipCard).join('');
        if (postRoot) {
            postRoot.innerHTML = postEntries.length
                ? postEntries.map(renderPostCard).join('')
                : '<p class="home-data-error">Thought Shelf is waiting for its first post.</p>';
            postRoot.setAttribute('aria-busy', 'false');
        }
        recipeRoot.setAttribute('aria-busy', 'false');
        tipRoot.setAttribute('aria-busy', 'false');

        document.dispatchEvent(new CustomEvent('homepageCardsRendered'));
    } catch (error) {
        recipeRoot.innerHTML = '<p class="home-data-error">Recipe cards are temporarily unavailable right now.</p>';
        tipRoot.innerHTML = '<p class="home-data-error">Study cards are temporarily unavailable right now.</p>';
        if (postRoot) {
            postRoot.innerHTML = '<p class="home-data-error">Thought Shelf posts are temporarily unavailable right now.</p>';
            postRoot.setAttribute('aria-busy', 'false');
        }
        recipeRoot.setAttribute('aria-busy', 'false');
        tipRoot.setAttribute('aria-busy', 'false');
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', loadHomepageCards);
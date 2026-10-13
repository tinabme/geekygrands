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

function renderTipCard(entry, category = 'study') {
    const title = escapeText(entry.card?.title || entry.title || 'Untitled Guide');
    const summary = escapeText(entry.card?.summary || '');
    const emoji = escapeText(entry.card?.emoji || '📚');
    const query = new URLSearchParams({ slug: entry.slug, category });

    return `
        <article class="tech-card">
            <div class="tech-icon">${emoji}</div>
            <h4>${title}</h4>
            <p>${summary}</p>
            <a href="tip.html?${query}" class="tech-link">Learn More →</a>
        </article>
    `;
}

function renderPostCard(entry) {
    const title = escapeText(entry.card?.title || entry.title || 'Untitled Post');
    const summary = escapeText(entry.card?.summary || '');
    const meta = Array.isArray(entry.meta) ? entry.meta : [];
    const dateLabel = escapeText(meta.find(item => item.label === 'Published')?.value || '');
    const slug = encodeURIComponent(entry.slug);

    if (meta.some(item => item.label === 'Topic' && item.value === 'Faith & Devotion')) {
        const subtitle = escapeText(entry.subtitle || '');
        const paragraphs = (entry.intro?.paragraphs || [])
            .map(paragraph => `<p>${escapeText(paragraph)}</p>`)
            .join('');
        const devotionBlocks = (entry.blocks || []).map(block => {
            if (block.type === 'scripture') {
                const references = (block.verses || [])
                    .slice(0, 2)
                    .map(verse => escapeText(verse.reference))
                    .join(', ');
                return references ? `<p class="devotional-references">${references}</p>` : '';
            }
            if (block.type === 'callout') {
                return (block.paragraphs || []).map(paragraph => `
                    <p class="devotional-closing">${escapeText(paragraph)}</p>
                `).join('');
            }
            return '';
        }).join('');

        return `
            <article class="blog-card blog-card-devotional">
                ${dateLabel ? `<div class="blog-date">${dateLabel}</div>` : ''}
                <h4>${title}</h4>
                <p class="devotional-subtitle">${subtitle}</p>
                <div class="devotional-copy">${paragraphs}${devotionBlocks}</div>
            </article>
        `;
    }

    return `
        <article class="blog-card">
            ${dateLabel ? `<div class="blog-date">${dateLabel}</div>` : ''}
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
    const householdTipRoot = document.getElementById('household-tip-cards-root');
    const postRoot = document.getElementById('post-cards-root');
    const faithRoot = document.getElementById('faith-cards-root');

    if (!recipeRoot || !tipRoot) {
        return;
    }

    recipeRoot.setAttribute('aria-busy', 'true');
    tipRoot.setAttribute('aria-busy', 'true');
    [householdTipRoot, postRoot, faithRoot].forEach(root => root?.setAttribute('aria-busy', 'true'));

    try {
        const manifest = await loadJson('data/homepage.json');

        const recipeEntries = await Promise.all(
            (manifest.recipes || []).map(slug => loadJson(`data/recipes/${encodeURIComponent(slug)}.json`))
        );

        const tipEntries = await Promise.all(
            (manifest.tips || []).map(slug => loadJson(`data/tips/${encodeURIComponent(slug)}.json`))
        );
        const householdSlugs = new Set(manifest.householdTips || []);
        const technicalEntries = tipEntries.filter(entry => !householdSlugs.has(entry.slug));
        const householdEntries = tipEntries.filter(entry => householdSlugs.has(entry.slug));

        const postEntries = await Promise.all(
            (manifest.posts || []).map(slug => loadJson(`data/posts/${encodeURIComponent(slug)}.json`))
        );

        const faithEntries = postEntries.filter(entry =>
            entry.meta?.some(item => item.label === 'Topic' && item.value === 'Faith & Devotion')
        );
        const reflectionEntries = postEntries.filter(entry => !faithEntries.includes(entry));

        recipeRoot.innerHTML = recipeEntries.map(renderRecipeCard).join('');
        tipRoot.innerHTML = technicalEntries.map(renderTipCard).join('');
        if (householdTipRoot) {
            householdTipRoot.innerHTML = householdEntries.length
                ? householdEntries.map(entry => renderTipCard(entry, 'garden')).join('')
                : '<p class="home-data-error">Everyday guides are coming soon.</p>';
            householdTipRoot.setAttribute('aria-busy', 'false');
        }
        if (postRoot) {
            postRoot.innerHTML = reflectionEntries.length
                ? reflectionEntries.map(renderPostCard).join('')
                : '<p class="home-data-error">Thought Shelf is waiting for its first post.</p>';
            postRoot.setAttribute('aria-busy', 'false');
        }
        if (faithRoot) {
            faithRoot.innerHTML = faithEntries.length
                ? faithEntries.map(renderPostCard).join('')
                : '<p class="home-data-error">Faith reflections are coming soon.</p>';
            faithRoot.setAttribute('aria-busy', 'false');
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
        [householdTipRoot, faithRoot].forEach(root => {
            if (root) {
                root.innerHTML = '<p class="home-data-error">These cards are temporarily unavailable right now.</p>';
                root.setAttribute('aria-busy', 'false');
            }
        });
        recipeRoot.setAttribute('aria-busy', 'false');
        tipRoot.setAttribute('aria-busy', 'false');
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', loadHomepageCards);
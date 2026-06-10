function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderLinks(links, listClassName = '') {
    if (!links || !links.length) {
        return '';
    }

    const classAttr = listClassName ? ` class="${listClassName}"` : '';
    return `<ul${classAttr}>${links
        .map(link => `<li><a href="${escapeHtml(link.href)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a></li>`)
        .join('')}</ul>`;
}

function renderList(items, listClassName = '') {
    if (!items || !items.length) {
        return '';
    }

    const classAttr = listClassName ? ` class="${listClassName}"` : '';
    return `<ul${classAttr}>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderCodeBlock(code, variant = '') {
    if (!code || !code.content) {
        return '';
    }

    const sizeClass = variant === 'large' ? ' large' : '';
    return `<div class="code-block${sizeClass}"><pre><code>${escapeHtml(code.content)}</code></pre></div>`;
}

function renderInlineCallout(callout) {
    if (!callout || !callout.text) {
        return '';
    }

    const className = callout.variant === 'note' ? 'note' : 'tip';
    return `<div class="${className}"><strong>${escapeHtml(callout.variant === 'note' ? 'Note:' : 'Tip:')}</strong> ${escapeHtml(callout.text)}</div>`;
}

function renderParagraphGroup(paragraphs) {
    if (!paragraphs || !paragraphs.length) {
        return '';
    }

    return paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
}

function updateDocumentMeta(content) {
    if (content?.seo?.title) {
        document.title = content.seo.title;
    } else if (content?.title) {
        document.title = `${content.title} - Geeky Grands`;
    }
}

function renderRecipeHeader(content) {
    const header = document.getElementById('recipe-header');
    const meta = (content.meta || [])
        .map(item => `<span>${escapeHtml(item.icon || '')} ${escapeHtml(item.label)}: ${escapeHtml(item.value)}</span>`)
        .join('');
    const heroImage = content.hero?.image
        ? `<img src="${escapeHtml(content.hero.image)}" alt="${escapeHtml(content.hero.imageAlt || content.title)}" class="template-hero-image">`
        : '';

    header.innerHTML = `
        <h1 class="recipe-title">${escapeHtml(content.title)}</h1>
        <p class="recipe-subtitle">${escapeHtml(content.subtitle || '')}</p>
        <div class="recipe-meta">${meta}</div>
        ${heroImage}
    `;
}

function renderRecipeBody(content) {
    const root = document.getElementById('recipe-root');
    const story = content.story
        ? `
            <section class="recipe-story">
                <div class="story-card">
                    <h3>${escapeHtml(content.story.title)}</h3>
                    ${content.story.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')}
                </div>
            </section>
        `
        : '';

    const ingredientGroups = (content.ingredientGroups || [])
        .map(group => `
            <div class="ingredients-card">
                <h4>${escapeHtml(group.icon || '')} ${escapeHtml(group.title)}</h4>
                <ul class="ingredients-list">
                    ${(group.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
            </div>
        `)
        .join('');

    const steps = (content.steps || [])
        .map((step, index) => `
            <div class="instruction-step">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                    <h4>${escapeHtml(step.title)}</h4>
                    <p>${escapeHtml(step.body)}</p>
                </div>
            </div>
        `)
        .join('');

    const tips = (content.tips || [])
        .map(tip => `
            <div class="tip-card">
                <div class="tip-icon">${escapeHtml(tip.icon || '')}</div>
                <h4>${escapeHtml(tip.title)}</h4>
                <p>${escapeHtml(tip.body)}</p>
            </div>
        `)
        .join('');

    const variations = content.variations?.length
        ? `
            <section class="variations-section">
                <h3>Make It Your Own</h3>
                <div class="variations-list">
                    ${content.variations.map(variation => `
                        <div class="variation-item">
                            <h4>${escapeHtml(variation.icon || '')} ${escapeHtml(variation.title)}</h4>
                            <p>${escapeHtml(variation.body)}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        `
        : '';

    root.innerHTML = `
        ${story}
        <section class="ingredients-section">
            <h3>What You'll Need</h3>
            <div class="ingredients-grid">${ingredientGroups}</div>
        </section>
        <section class="instructions-section">
            <h3>Let's Make Magic Happen</h3>
            <div class="instructions-list">${steps}</div>
        </section>
        <section class="tips-section">
            <h3>Grandma's Secret Tips</h3>
            <div class="tips-grid">${tips}</div>
        </section>
        ${variations}
        <section class="back-link-section">
            <a href="index.html#kitchen" class="back-to-kitchen">🍳 Back to the Kitchen for More Recipes</a>
        </section>
    `;

    const footer = document.getElementById('recipe-footer-content');
    footer.innerHTML = `
        <h4>${escapeHtml(content.footer?.heading || 'Happy Baking!')}</h4>
        <p>${escapeHtml(content.footer?.text || '')}</p>
    `;
}

function renderCardsBlock(block) {
    const sectionClass = block.sectionClass || 'steps-section';
    const gridClass = block.gridClass || 'tips-grid';
    const cardClass = block.cardClass || 'tip-card';

    return `
        <section class="${sectionClass}">
            <h3>${escapeHtml(block.title || '')}</h3>
            <div class="${gridClass}">
                ${(block.items || []).map(item => `
                    <div class="${cardClass}">
                        ${item.icon ? `<div class="${cardClass === 'prereq-card' ? 'prereq-icon' : 'tip-icon'}">${escapeHtml(item.icon)}</div>` : ''}
                        <h4>${escapeHtml(item.title || '')}</h4>
                        ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ''}
                        ${renderParagraphGroup(item.paragraphs)}
                        ${item.list ? renderList(item.list) : ''}
                        ${item.links ? renderLinks(item.links, cardClass === 'related-card' ? '' : '') : ''}
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function renderStepsBlock(block) {
    const sectionClass = block.sectionClass || 'steps-section';
    const listClass = block.listClass || 'step-list';
    const itemClass = block.itemClass || 'step-item';

    return `
        <section class="${sectionClass}">
            <h3>${escapeHtml(block.title || '')}</h3>
            <div class="${listClass}">
                ${(block.items || []).map((item, index) => `
                    <div class="${itemClass}">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">
                            <h4>${escapeHtml(item.title || '')}</h4>
                            ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ''}
                            ${renderParagraphGroup(item.paragraphs)}
                            ${item.list ? renderList(item.list) : ''}
                            ${renderCodeBlock(item.code)}
                            ${renderInlineCallout(item.callout)}
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function renderCodeSection(block) {
    const sectionClass = block.sectionClass || 'complete-dockerfile-section';
    return `
        <section class="${sectionClass}">
            <h3>${escapeHtml(block.title || '')}</h3>
            ${block.body ? `<p>${escapeHtml(block.body)}</p>` : ''}
            ${renderCodeBlock(block.code, block.variant)}
            ${renderInlineCallout(block.callout)}
        </section>
    `;
}

function renderCalloutBlock(block) {
    const className = block.variant === 'warning' ? 'template-callout template-callout-warning' : 'template-callout template-callout-note';
    return `
        <section class="${className}">
            <h3>${escapeHtml(block.title || '')}</h3>
            ${(block.paragraphs || []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        </section>
    `;
}

function renderTipHeader(content) {
    const header = document.getElementById('tip-header');
    const meta = (content.meta || [])
        .map(item => `<span>${escapeHtml(item.icon || '')} ${escapeHtml(item.label)}: ${escapeHtml(item.value)}</span>`)
        .join('');
    const heroImage = content.hero?.image
        ? `<img src="${escapeHtml(content.hero.image)}" alt="${escapeHtml(content.hero.imageAlt || content.title)}" class="template-hero-image">`
        : '';

    header.innerHTML = `
        <h1 class="tech-title">${escapeHtml(content.title)}</h1>
        <p class="tech-subtitle">${escapeHtml(content.subtitle || '')}</p>
        <div class="tech-meta">${meta}</div>
        ${heroImage}
    `;
}

function renderTipBody(content, contentType = 'tip') {
    const root = document.getElementById('tip-root');
    const intro = content.intro
        ? `
            <section class="tech-intro">
                <div class="intro-card">
                    <h3>${escapeHtml(content.intro.title)}</h3>
                    ${content.intro.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')}
                </div>
            </section>
        `
        : '';

    const blocks = (content.blocks || []).map(block => {
        switch (block.type) {
            case 'cards':
                return renderCardsBlock(block);
            case 'steps':
                return renderStepsBlock(block);
            case 'code':
                return renderCodeSection(block);
            case 'callout':
                return renderCalloutBlock(block);
            default:
                return '';
        }
    }).join('');

    const backLinkHref = contentType === 'post' ? 'index.html#thought-shelf' : 'index.html#study';
    const backLinkClass = 'back-to-study';
    const backLinkText = contentType === 'post'
        ? '📝 Back to the Thought Shelf for More Reflections'
        : '📚 Back to the Study for More Topics';

    root.innerHTML = `
        ${intro}
        ${blocks}
        <section class="back-link-section">
            <a href="${backLinkHref}" class="${backLinkClass}">${backLinkText}</a>
        </section>
    `;

    const footer = document.getElementById('tip-footer-content');
    footer.innerHTML = `
        <h4>${escapeHtml(content.footer?.heading || 'Thanks for learning with Grandma!')}</h4>
        <p>${escapeHtml(content.footer?.text || '')}</p>
    `;
}

function renderError(message) {
    const recipeRoot = document.getElementById('recipe-root');
    const tipRoot = document.getElementById('tip-root');
    const target = recipeRoot || tipRoot;
    if (target) {
        target.innerHTML = `<div class="template-status template-status-error">${escapeHtml(message)}</div>`;
    }
}

async function loadContentPage() {
    const contentType = document.body.dataset.contentType;
    if (!contentType) {
        return;
    }

    const slug = new URLSearchParams(window.location.search).get('slug');
    if (!slug) {
        renderError('Missing slug in the page URL.');
        return;
    }

    let dataPath = '';
    if (contentType === 'recipe') {
        dataPath = `data/recipes/${encodeURIComponent(slug)}.json`;
    } else if (contentType === 'post') {
        dataPath = `data/posts/${encodeURIComponent(slug)}.json`;
    } else {
        dataPath = `data/tips/${encodeURIComponent(slug)}.json`;
    }

    try {
        const response = await fetch(dataPath);
        if (!response.ok) {
            throw new Error(`Unable to load ${contentType} data.`);
        }

        const content = await response.json();
        updateDocumentMeta(content);

        if (contentType === 'recipe') {
            renderRecipeHeader(content);
            renderRecipeBody(content);
            return;
        }

        renderTipHeader(content);
        renderTipBody(content, contentType);
    } catch (error) {
        renderError('This page could not be loaded. Use a local web server and verify the slug exists in the data folder.');
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', loadContentPage);
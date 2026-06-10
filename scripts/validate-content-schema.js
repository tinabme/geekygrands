#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const recipesDir = path.join(rootDir, 'data', 'recipes');
const tipsDir = path.join(rootDir, 'data', 'tips');
const postsDir = path.join(rootDir, 'data', 'posts');
const homepageManifestPath = path.join(rootDir, 'data', 'homepage.json');

const errors = [];

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function readJson(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

function validateCard(card, context) {
    if (!card || typeof card !== 'object') {
        errors.push(`${context}: missing card object`);
        return;
    }

    if (!isNonEmptyString(card.title)) {
        errors.push(`${context}: card.title must be a non-empty string`);
    }

    if (!isNonEmptyString(card.summary)) {
        errors.push(`${context}: card.summary must be a non-empty string`);
    }
}

function validateRecipe(entry, filename) {
    const context = `recipe ${filename}`;
    if (entry.type !== 'recipe') {
        errors.push(`${context}: type must be "recipe"`);
    }

    if (!isNonEmptyString(entry.slug)) {
        errors.push(`${context}: missing slug`);
    }

    if (!isNonEmptyString(entry.title)) {
        errors.push(`${context}: missing title`);
    }

    if (!isNonEmptyString(entry.subtitle)) {
        errors.push(`${context}: missing subtitle`);
    }

    if (!Array.isArray(entry.ingredientGroups) || entry.ingredientGroups.length === 0) {
        errors.push(`${context}: ingredientGroups must be a non-empty array`);
    }

    if (!Array.isArray(entry.steps) || entry.steps.length === 0) {
        errors.push(`${context}: steps must be a non-empty array`);
    }

    validateCard(entry.card, context);

    if (entry.slug && `${entry.slug}.json` !== filename) {
        errors.push(`${context}: slug does not match filename`);
    }
}

function validateTip(entry, filename) {
    const context = `tip ${filename}`;
    if (entry.type !== 'tip') {
        errors.push(`${context}: type must be "tip"`);
    }

    if (!isNonEmptyString(entry.slug)) {
        errors.push(`${context}: missing slug`);
    }

    if (!isNonEmptyString(entry.title)) {
        errors.push(`${context}: missing title`);
    }

    if (!isNonEmptyString(entry.subtitle)) {
        errors.push(`${context}: missing subtitle`);
    }

    if (!Array.isArray(entry.blocks) || entry.blocks.length === 0) {
        errors.push(`${context}: blocks must be a non-empty array`);
    }

    validateCard(entry.card, context);

    if (entry.slug && `${entry.slug}.json` !== filename) {
        errors.push(`${context}: slug does not match filename`);
    }
}

function validatePost(entry, filename) {
    const context = `post ${filename}`;
    if (entry.type !== 'post') {
        errors.push(`${context}: type must be "post"`);
    }

    if (!isNonEmptyString(entry.slug)) {
        errors.push(`${context}: missing slug`);
    }

    if (!isNonEmptyString(entry.title)) {
        errors.push(`${context}: missing title`);
    }

    if (!isNonEmptyString(entry.subtitle)) {
        errors.push(`${context}: missing subtitle`);
    }

    if (!Array.isArray(entry.blocks) || entry.blocks.length === 0) {
        errors.push(`${context}: blocks must be a non-empty array`);
    }

    validateCard(entry.card, context);

    if (entry.slug && `${entry.slug}.json` !== filename) {
        errors.push(`${context}: slug does not match filename`);
    }
}

function validateDirectory(dirPath, validator) {
    const files = fs.readdirSync(dirPath).filter(name => name.endsWith('.json'));
    const slugs = new Set();

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        let entry;
        try {
            entry = readJson(fullPath);
        } catch (error) {
            errors.push(`${file}: invalid JSON (${error.message})`);
            continue;
        }

        validator(entry, file);
        if (entry && isNonEmptyString(entry.slug)) {
            if (slugs.has(entry.slug)) {
                errors.push(`${file}: duplicate slug "${entry.slug}"`);
            }
            slugs.add(entry.slug);
        }
    }

    return slugs;
}

function validateHomepageManifest(recipeSlugs, tipSlugs, postSlugs) {
    let manifest;
    try {
        manifest = readJson(homepageManifestPath);
    } catch (error) {
        errors.push(`data/homepage.json: invalid JSON (${error.message})`);
        return;
    }

    if (!Array.isArray(manifest.recipes)) {
        errors.push('data/homepage.json: recipes must be an array');
    } else {
        manifest.recipes.forEach(slug => {
            if (!recipeSlugs.has(slug)) {
                errors.push(`data/homepage.json: recipes slug "${slug}" not found in data/recipes`);
            }
        });
    }

    if (!Array.isArray(manifest.tips)) {
        errors.push('data/homepage.json: tips must be an array');
    } else {
        manifest.tips.forEach(slug => {
            if (!tipSlugs.has(slug)) {
                errors.push(`data/homepage.json: tips slug "${slug}" not found in data/tips`);
            }
        });
    }

    if (manifest.posts !== undefined && !Array.isArray(manifest.posts)) {
        errors.push('data/homepage.json: posts must be an array when provided');
    } else if (Array.isArray(manifest.posts)) {
        manifest.posts.forEach(slug => {
            if (!postSlugs.has(slug)) {
                errors.push(`data/homepage.json: posts slug "${slug}" not found in data/posts`);
            }
        });
    }
}

function main() {
    const recipeSlugs = validateDirectory(recipesDir, validateRecipe);
    const tipSlugs = validateDirectory(tipsDir, validateTip);
    const postSlugs = fs.existsSync(postsDir)
        ? validateDirectory(postsDir, validatePost)
        : new Set();
    validateHomepageManifest(recipeSlugs, tipSlugs, postSlugs);

    if (errors.length > 0) {
        console.error('Schema validation failed:');
        errors.forEach(error => console.error(`- ${error}`));
        process.exit(1);
    }

    console.log('Content schema validation passed.');
}

main();
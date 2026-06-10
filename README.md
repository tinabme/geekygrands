# geekygrands
When the voices in your head go silent, do you wonder what they a planning? Just Grandma life :)

### Whats happening here?
Just migrating a **very old** personal website over to GitHub. Don't Judge me.

A place for like minded folks to pick up some bits and pieces. I hope to clean it up a bit and invite others to join in making it better.

### Data-driven proof of concept
Some pages now have a JSON-backed template path:

- `recipe.html?slug=apple-pie-recipe`
- `tip.html?slug=docker-nodejs-guide`
- `tip.html?slug=essential-oils-guide`
- `post.html?slug=managing-through-the-ai-shift`

The content for those pages lives in `data/recipes/`, `data/tips/`, and `data/posts/`.

Homepage cards are now also data-driven via `data/homepage.json` and loaded by `homepage-loader.js`.

### Content Schema Validation
Run this from the project root to validate all recipe/tip JSON files and homepage slug references:

`node scripts/validate-content-schema.js`

Because the templates load JSON with `fetch`, open the site through a local web server instead of double-clicking the HTML files from Finder.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pages = [
    "index.html",
    "guide.html",
    "service.html",
    "about.html",
    "login.html",
    "register.html",
    "profile.html"
];

function read(file) {
    return fs.readFileSync(path.join(root, file), "utf8");
}

test("every page exposes one accessible mobile navigation toggle", () => {
    for (const page of pages) {
        const html = read(page);
        assert.equal((html.match(/class="nav-toggle"/g) || []).length, 1, page);
        assert.match(html, /aria-expanded="false"/, page);
        assert.match(html, /aria-controls="primary-navigation"/, page);
        assert.match(html, /id="primary-navigation"/, page);
    }
});

test("shared script initializes and closes the mobile navigation", () => {
    const script = read("js/common.js");
    assert.match(script, /initMobileNavigation\(\)/);
    assert.match(script, /aria-expanded/);
    assert.match(script, /Escape/);
    assert.match(script, /is-nav-open/);
    assert.match(script, /mobile-nav-ready/);
});

test("portrait CSS shows the requested landscape guidance", () => {
    const css = read("css/style.css");
    assert.doesNotMatch(css, /@media \(max-width: 720px\) \{`r`n/);
    assert.match(css, /@media \(max-width: 920px\) and \(orientation: portrait\)[\s\S]*?body::before/);
    assert.match(css, /@media \(max-width: 920px\) and \(orientation: portrait\)[\s\S]*?body::after[\s\S]*?content:\s*"请将手机横屏浏览更舒适"/);
    assert.match(
        css,
        /@media \(max-width: 780px\) and \(orientation: portrait\)[\s\S]*?\.home-showcase-bg \.hero\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/
    );
    assert.match(css, /\.nav-toggle\s*\{/);
    assert.match(css, /\.navbar\.is-nav-open \.nav-links/);
});

test("phone landscape keeps the desktop canvas scaled fully into view", () => {
    const css = read("css/style.css");
    assert.match(css, /@media \(max-width: 920px\) and \(orientation: landscape\)[\s\S]*?html\s*\{[\s\S]*?overflow-x:\s*hidden/);
    assert.match(css, /@media \(max-width: 920px\) and \(orientation: landscape\)[\s\S]*?body\s*\{[\s\S]*?width:\s*1180px/);
    assert.match(css, /@media \(max-width: 920px\) and \(orientation: landscape\)[\s\S]*?body\s*\{[\s\S]*?zoom:\s*calc\(100vw\s*\/\s*1180\)/);
    assert.doesNotMatch(css, /@media \(max-width: 920px\) and \(orientation: landscape\)[\s\S]*?overflow-x:\s*auto/);
});

test("narrow CSS is portrait-only so phone landscape uses desktop layout", () => {
    const css = read("css/style.css");
    const bareNarrowQueries = [...css.matchAll(/@media \(max-width: (430|680|720|780|1180)px\)(?! and \(orientation: portrait\))/g)]
        .map((match) => match[0]);
    assert.deepEqual(bareNarrowQueries, []);

    const mobileOverrideStart = css.lastIndexOf("@media (max-width: 780px) and (orientation: portrait)");
    assert.notEqual(mobileOverrideStart, -1);

    for (const selector of [
        ".auth-page",
        ".profile-layout",
        ".profile-form-grid",
        ".guide-hero",
        ".service-page .service-layout",
        ".about-page .dashboard"
    ]) {
        assert.ok(css.lastIndexOf(selector) > mobileOverrideStart, selector);
    }
});

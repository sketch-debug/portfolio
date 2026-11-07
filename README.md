# My Portfolio Website: Beginner's Guide

This site has no installs and no database. You edit **one file** (`content.js`), and the site updates itself. There is no build step for the one-page site; `build.js` is an optional extra that adds a shareable page per system (see 3b).

## What is in this folder

| File or folder | What it is | Do I edit it? |
|---|---|---|
| `content.js` | All your text, links and systems | **Yes. This is the only one.** |
| `images/` | Your screenshots, photo and share image | Add pictures here |
| `files/` | Your resume (PDF) | Add your file here |
| `index.html`, `app.js`, `page.js`, `live.js`, `style.css`, `fonts.css` | The engine and the look | No |
| `fonts/` | The typefaces, stored in this folder (no Google Fonts) | No |
| `build.js` | Makes one shareable page per system (optional, see 3b) | No |
| `projects/`, `404.html` | Made by `build.js`. Delete a project folder if you delete that system | No |
| `sitemap.xml` | Made by `build.js` once the site address is known | No |
| `robots.txt` | Tells search engines they may index the site | Only if your address changes |
| `README.md` | This guide | No |

---

## 1. Open and preview it on your computer

1. Unzip the folder (**Windows:** right-click the zip, **Extract All**. **Mac:** double-click the zip).
2. Open the folder and **double-click `index.html`**. It opens in your browser. That is your site.

To edit, open `content.js` in a plain text editor:

- **Best (free):** [Visual Studio Code](https://code.visualstudio.com). Right-click `content.js`, **Open with**, **Code**.
- **Windows:** Notepad works. Right-click `content.js`, **Open with**, **Notepad**.
- **Mac:** TextEdit only works in plain-text mode (Format menu, **Make Plain Text**). VS Code is easier.
- **Do not use Word or Pages.** They change the quote marks and break the file.

After saving, go to your browser and press **F5** (Windows) or **Cmd + R** (Mac) to refresh.

> If double-click does not work for you, open a terminal in the folder and run:
> **Mac:** `python3 -m http.server 8000`  **Windows:** `py -m http.server 8000`
> then visit `http://localhost:8000`. Press Ctrl + C in the terminal to stop.

## 2. Fill in your details

Open `content.js`. Everything in **[SQUARE BRACKETS]** is a placeholder. Replace it with your own text. The file has five short rules at the top and a comment beside every field saying whether it is **REQUIRED** or **OPTIONAL**.

The most important rules:

- Keep the **quote marks** `"like this"` and the **comma** at the end of each line.
- To **hide** something, leave it empty: `""` for text, `[]` for lists. The site hides that part automatically, with no blank boxes.
- Do not use a double quote `"` inside your text. Use a single quote `'` instead.

Testimonials and credentials start empty. Only add **real** feedback from real people.

> **The grey "Preview mode" bar** appears at the top of the page only when you open the site on your own computer (a `file://` address or `localhost`). It counts how many `[PLACEHOLDER]` values are still in `content.js`. Visitors never see it. Once it says *no `[PLACEHOLDER]` values left*, you are ready to publish.

## 3. How to add a new system (under 5 minutes)

- [ ] **1.** Open `content.js` and scroll to `const PROJECTS = [`.
- [ ] **2.** Copy one whole block, from its opening `{` to its closing `},` (the comment says where).
- [ ] **3.** Paste it right below the last block, before the final `];`.
- [ ] **4.** Change `id` to something new: lowercase letters, numbers and dashes only (for example `"clinic-booking"`).
- [ ] **5.** Fill in `name`, `type`, `summary`. Those four (with `id`) are required. Then fill in whatever else you have and empty the rest (`""` or `[]`).
- [ ] **6.** Put your screenshots in `images/` named `clinic-booking-1.jpg`, `clinic-booking-2.jpg`, and so on, and list them in `screenshots`.
- [ ] **7.** Save, refresh the page, and click your new card to check it.
- [ ] **8.** Run `node build.js` to give it its own page, then publish (section 5).

If you forgot something required - or spelled a field name wrong (`screenshot` instead of `screenshots`), or wrote a list as a sentence (`stack: "Node, Python"` instead of `stack: ["Node", "Python"]`) - a yellow **Content check** box appears at the top of the page and tells you exactly what to fix. The filter buttons (Web, Mobile, and so on) are created automatically from the `type` you write.

### 3b. One shareable page per system (optional, 10 seconds)

Every system already has an address inside the one-page site (`#/project/<id>`), but search engines and link previews prefer a real page. To make them:

1. Open a terminal in this folder.
2. Run **`node build.js`** (nothing to install). If your address is not in `content.js` yet, run **`node build.js --site=https://your-name.github.io/portfolio/`** instead.
3. That writes `projects/<id>/index.html` for each system, `about/index.html`, `contact/index.html`, `404.html` and `sitemap.xml`.
4. Run it again **every time you add or change a system**, then redeploy.

The one-page site keeps working even if you never run it. To set the address once and for all, fill in `siteUrl` in `content.js`.

## 4. Images

- Put every picture in the **`images/`** folder.
- **Naming rule:** `<system id>-1.jpg`, `<system id>-2.jpg`, and so on. The first one is the cover.
- **Ideal size:** **1600 x 1000 pixels**, JPG or WebP, under 300 KB each. [squoosh.app](https://squoosh.app) shrinks images for free.
- If a picture is missing, the site shows a quiet placeholder frame (no broken image). While you are previewing on your own computer the frame is labelled `[ADD SCREENSHOT]`; visitors never see that label.
- **Your resume:** `files/Jeffrey-Valeros-Resume.pdf` is already wired up. The **Download resume** button appears in the hero and on the About page, and disappears by itself if you empty `resumeUrl`. To change the resume, edit `files/resume.html` and save it as a PDF over that file (Chrome: **Ctrl + P**, **Save as PDF**, A4) - the full steps are in `files/README.txt`.
- **About page details:** `location`, `phone`, `education`, `languages` and `certifications` in `content.js` fill the cards under **How I work** on the About page. Empty any of them (`""` or `[]`) and its card disappears. The phone number becomes a tap-to-call link automatically, and each `education` entry takes an optional `capstone` line. `phone`, `location` and `languages` also go into the search-engine summary (the `Person` structured data), so filling them in once covers both.

## 5. Publish it online (GitHub Pages)

This site is set up for **https://sketch-debug.github.io/portfolio/**. The folder is a small git repository, so publishing is one push.

**First time**

1. At github.com click **New repository**. Name it `portfolio`, choose **Public**, click **Create repository** — but do **not** add a README there, or the first push will be refused.
2. In this folder, run these **once**, in order (replace `YOUR-NAME`). `git init` is what turns this folder into a repository; the folder does not start as one.

```
git init
node build.js --site=https://YOUR-NAME.github.io/portfolio/
git add -A
git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/portfolio.git
git push -u origin main
```

3. Go to **Settings**, then **Pages**. Under **Branch** choose `main` and `/ (root)`, then **Save**. Your link appears after about a minute.
4. Open the live link and check the home page and one project page before you share it.

**How to redeploy (after any edit)**

```
node build.js        (only if you added or changed a system)
git add -A
git commit -m "Update content"
git push
```

Wait about a minute, then hard-refresh (**Ctrl + Shift + R** / **Cmd + Shift + R**).

*(Button names on websites change sometimes. If you cannot find one, search "GitHub Pages publish branch".)*

**Alternative: Netlify** (drag and drop, no git)

1. Go to **https://app.netlify.com/drop** and sign up (free).
2. **Drag your whole portfolio folder** onto the page. A few seconds later you get a live link like `random-name.netlify.app`.
3. In Netlify, open **Site configuration** and **Change site name** to pick a nicer address.
4. To update later, open **Deploys** and drag the folder onto the drop box again.

Whichever you choose, put the real address in `siteUrl` in `content.js` and run `node build.js`. That one command rewrites the home page's title, description, canonical and share tags (the block marked `build:meta` in `index.html`), writes each system's page and refreshes `sitemap.xml`. Only the `Sitemap:` line in `robots.txt` is still edited by hand.

## 6. Connect your own domain (for example `yourname.com`)

1. Buy a domain from any registrar (Namecheap, Cloudflare, Google/Squarespace Domains, and so on). Typical cost is about $10-15 a year.
2. In this repository: **Settings**, **Pages**, **Custom domain**, type your domain, **Save**. GitHub writes a file called `CNAME` into the branch; do not delete it.
3. At your registrar's DNS page, add **exactly** these records. `@` means the bare domain (`yourname.com`), and `www` means `www.yourname.com`.

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `sketch-debug.github.io` |

   The four AAAA rows are optional (IPv6). If your registrar offers **ALIAS** or **ANAME** instead of A records, one record pointing `@` at `sketch-debug.github.io` also works. Do not put the repository name in the CNAME value: it is `sketch-debug.github.io`, not `sketch-debug.github.io/portfolio`.
4. Wait for the DNS change (minutes to 24 hours), then in **Settings**, **Pages** tick **Enforce HTTPS**. GitHub issues the certificate itself, free, usually within an hour of the DNS being right.
5. Finally put the new address in `siteUrl` in `content.js`, run `node build.js`, update the `Sitemap:` line in `robots.txt`, and redeploy. Every canonical link, share tag and sitemap entry then points at the domain instead of `github.io`.

*Using Netlify instead?* Open your site, **Domain management**, **Add a domain**, and copy the records Netlify shows. Netlify adds HTTPS automatically.

## 7. If something breaks

**The page is blank or says "There is a typo in content.js".** You most likely broke a comma or a quote. Check, in this order:

1. A **missing comma** at the end of the line you last edited (every line inside `{ }` ends with a comma).
2. A **missing quote mark** at the start or end of your text.
3. A **double quote `"` inside your text.** Replace it with `'`.
4. A **missing `},`** or `]` when you copied a block. Each block must start with `{` and end with `},`.

**A picture does not show.** Check that the file name in `content.js` exactly matches the file in `images/`, including capital letters and `.jpg` vs `.jpeg`.

**A button looks greyed out with a dashed border.** The link is still a `[PLACEHOLDER]`. Put the real link in, or empty it with `""` to hide the button.

**A project page is out of date or missing.** Run `node build.js` again, then redeploy. If you deleted a system, delete its leftover folder inside `projects/` too.

**My change does not show on the live site.** Re-upload the folder (section 5) and hard-refresh the page (**Ctrl + Shift + R** on Windows, **Cmd + Shift + R** on Mac).

**A system has no page of its own after running the build.** The build skips any system missing `name`, `type` or `summary`, and prints why. It also skips duplicate or unusable ids. Fix the message it gives you and run it again.

**A mistyped project address shows GitHub's own error page.** If `404.html` is in the folder (the build writes it), GitHub Pages shows your page instead. Re-run `node build.js` after changing `content.js` so it stays current.

### How to undo a change

- **Before every edit:** copy `content.js` and paste it as `content-backup.js` (outside the folder is best). To undo, delete your edited file and rename the backup back to `content.js`.
- **Netlify:** open **Deploys**, click an older deploy in the list, then click **Publish deploy**. Your live site goes back to that version right away.
- **GitHub Pages:** open `content.js` in the repository, click **History**, find the earlier version, and restore it.

## 8. Optional extras

- **Live repository details:** any system with a `githubUrl` that points at a **public** repository shows a small line such as *Last commit 3 days ago · 12 stars · Python*. It is read from GitHub's public API when a visitor opens the page, so it is true without you editing anything. It is cached in the visitor's browser for an hour, the line stays invisible when the repository is private or gone, and it costs nothing. GitHub allows 60 lookups per hour per visitor; your site never needs a key. If you make a repository private again, the line disappears on its own within an hour of each visitor's last load.
- **A GitHub button that never leads to a dead page:** while GitHub reports a repository as private, deleted or blocked, the **Source on GitHub** button on that project's page hides itself, and it comes back by itself once the repository can be read again. Nothing is deleted from `content.js`, so you do not have to re-add the link. Only a definite answer from GitHub hides it: if you are offline, or GitHub is limiting requests, the button stays exactly as written.
- **Message form:** make a free form at [formspree.io](https://formspree.io), copy its link, and paste it into `contactFormUrl` in `content.js`. A form then appears in the Contact section: it sends in the background, shows "Message sent" inline, and carries a hidden spam trap. Leave it `""` and visitors just see your email and links.
- **Share image and link preview:** `images/share.png` (1200 x 630) already exists as a plain placeholder. Replace it with a real picture when you have one. If your address changes, put the new one in `siteUrl` in `content.js` and run `node build.js`, which rewrites the addresses in `index.html` and the pages under `projects/`; then update the `Sitemap:` line in `robots.txt` by hand.
- **The 404 page** (`404.html`) is what visitors see for a wrong address on the live site. Its stylesheet and its links point at your site address, because GitHub Pages shows that page at whatever address failed and a plain `style.css` would then be looked for in the wrong folder. One side effect: double-clicking `404.html` on your own computer shows it unstyled. Set `siteUrl` in `content.js` and rebuild so the address inside it is exact.
- **"What I would change":** fill in `change` on a system and a short honest paragraph appears after its results. Empty, the section is simply absent. This is the field a good interviewer reads first, so write the real answer.
- **Analytics, off by default:** put `"goatcounter"` in `analyticsProvider` and your site code in `analyticsSite` (for example `"jeffreyvaleros"`; GoatCounter is free and cookie-free), or `"plausible"` with your domain. Nothing is loaded until both lines are filled, and never on your own computer. Leave both empty and the site makes no third-party requests at all.
- **Dark mode** follows each visitor's device setting automatically.
- **Printing:** the site has print styles, so **Ctrl + P** gives a clean black-on-white page.
- **Accent color:** change `accentColor` in `content.js`. Pick a dark color so the white button text stays readable.
- **Fonts:** they live in `fonts/` and load from your own site, not from Google. `fonts.css` lists them.

## 9. Every three months (15 minutes)

- [ ] Open the live site on your phone and on a laptop. Click every project, About, Contact and the email button.
- [ ] Check that the email address and LinkedIn link still work, and that the availability line is still true.
- [ ] Update each system's `result` if you now have a real number, and add screenshots for anything still showing an empty frame.
- [ ] Run `node build.js`, then `git add -A`, `git commit -m "Quarterly refresh"`, `git push`.
- [ ] If a project repository is now public, put its link in `githubUrl` so the Source button and the live repository line appear.
- [ ] In the browser, run Lighthouse (**F12**, then **Lighthouse**, **Mobile**) on the home page and one project page. Performance, Accessibility, Best Practices and SEO should each still be 95 or more.
- [ ] Delete any project you would no longer defend in an interview. Three strong case studies beat eight thin ones.

## Honest content only

Use only things that are true: your real projects, real numbers and real feedback. Leave a field empty instead of guessing, and the site will simply hide it.

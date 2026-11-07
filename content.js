/* ======================================================================
   YOUR CONTENT FILE
   This is the ONLY file you need to edit to change what the site says.

   FIVE RULES (read once):
   1. Keep the quote marks "like this" around your text.
   2. Keep the comma at the end of each line.
   3. To HIDE something, leave it empty: "" for text, [] for lists.
      The site hides that part automatically, so you never get a blank box.
   4. Anything in [SQUARE BRACKETS] is a placeholder. Replace it with your own text.
      Links left in [BRACKETS] show as greyed-out buttons until you add the real link.
   5. If your text needs a quote mark inside it, use a single quote ' or an apostrophe,
      not a double quote ".

   REQUIRED means the site needs it. OPTIONAL means you can leave it "" or [].

   STILL MISSING: a photo, real result numbers, and one "What I would change"
   line per system. Empty fields hide themselves, so the
   site is complete and honest without them - fill them in when you have them.
   ====================================================================== */


const SITE = {

  /* ---------- REQUIRED ---------- */
  name: "Jeffrey Valeros",                // Top-left corner and footer.
  title: "IT Support Specialist",         // Small label above the headline. Also the job title in search results.
  headline: "I build operational systems where the rules are enforced by tests and build gates.", // The big sentence at the top.
  bio: "Three systems, one method: a clinic stock ledger that refuses silent edits, a read-only endpoint threat tracker that turns logs into incidents, and a CLI that normalises three security scanners into one report. In each one the rules are executable - a gate fails the build when they stop holding.", // Under the headline. 2-3 sentences.

  /* ---------- CONTACT ---------- */
  email: "Jeffreyvaleros12@gmail.com",    // The one action on this site.
  phone: "+63 909 3936 928",              // OPTIONAL. Shown on the About page as a tap-to-call link. "" = hide.
  location: "Daet 4600, Philippines",     // OPTIONAL. Shown on the About page. "" = hide.
  github: "https://github.com/sketch-debug", // OPTIONAL. Full link, starting with https://
  linkedin: "https://www.linkedin.com/in/jeffrey-valeros-bb90593a3", // OPTIONAL. Full link, starting with https://
  otherLinks: [                           // OPTIONAL. Any other links. Use [] to hide.
    // { label: "Portfolio on Behance", url: "https://example.com" },
  ],
  contactFormUrl: "",                     // OPTIONAL. Paste a Formspree form link to show a message form (see README). "" = no form.

  /* ---------- HOME PAGE EXTRAS (all OPTIONAL) ---------- */
  availability: "Open to full-time roles and contract work", // Small green-dot label in the top section. "" = hide.
  replyTime: "",                          // Shows "I reply within [N] days." "" = hide.
  resumeUrl: "files/Jeffrey-Valeros-Resume.pdf",  // The button hides itself when this is "". Generated from files/resume.html.
  photo: "",                              // [NEEDED] Your photo, for example "images/photo.jpg". "" = hide.
  accentColor: "#2438D9",                 // Main button color. Pick a DARK color so white text stays readable.
  siteUrl: "https://sketch-debug.github.io/portfolio/",  // Your live address. Used by build.js for share links and sitemap.xml.

  /* ---------- ANALYTICS (off until you fill this in) ---------- */
  analyticsProvider: "",                  // "" = no tracking at all. Or "goatcounter" or "plausible".
  analyticsSite: "",                      // The site code from your analytics account. Example: "jeffreyvaleros".

  about: [                                // One paragraph per line. [] = hide the About section.
    "I work on systems where a quiet mistake is expensive: stock a clinic bills against, endpoint logs a small team triages under time pressure, scanner findings a build gate acts on. The approach is the same each time - write the rule down once, then make it impossible to break silently.",
    "In practice that means one source of truth for a layout with the constants generated from it, an append-only ledger where a correction is a reversal row, a scanner that reports a missing tool as an error instead of a pass, and tests that drive the real macros rather than a mock.",
  ],

  skills: [                               // OPTIONAL. Groups of skills. [] = hide.
    { group: "Languages", items: ["Python", "PowerShell", "VBA", "SQL"] },
    { group: "Tooling",   items: ["FastAPI", "SQLite", "openpyxl", "pytest", "GitHub Actions"] },
    { group: "Security",  items: ["Checkov", "Trivy", "Bandit", "SARIF"] },
    { group: "Practice",  items: ["Append-only ledgers", "Drift gates", "Fixture tests", "Read-only by design"] },
  ],

  /* ABOUT PAGE EXTRAS: the details cards under "How I work" on the About page.
     One line per school or certificate. Empty ([]) = that card is hidden. */
  education: [
    { qualification: "Bachelor of Science in Information Technology",
      school: "University of Camarines Norte",
      year: "2022 - 2026",
      capstone: "Camarines Norte State College Vehicle Pass System" },
  ],
  languages: [
    { name: "English", level: "Highly proficient" },
    { name: "Filipino", level: "Native speaker" },
  ],
  certifications: [
    { name: "Certified IT Support Specialist", issuer: "Appdademiya", year: "Aug 2026" },
  ],

  /* TESTIMONIALS: ONLY add real feedback from real people. Empty = the section is hidden.
     To use one: delete the two slashes // at the start of the line and fill in the text. */
  testimonials: [
    // { quote: "One or two sentences about the result you delivered.", name: "Name", role: "Role, Organization" },
  ],

  /* CREDENTIALS: certifications, awards, publications, open-source work. Empty = hidden. */
  credentials: [
    // "Certification or award",
  ],
};


/* ======================================================================
   YOUR SYSTEMS
   Each system is one block between { and }. Blocks appear on the site in this order,
   so the strongest one goes first.

   TO ADD A NEW SYSTEM (under 5 minutes):
   1. Copy the whole TEMPLATE block below (from the line that says TEMPLATE
      down to its closing },).
   2. Paste it right below the template (before the closing ]; at the very bottom).
   3. Delete the two slashes // at the start of each pasted line.
   4. Change the id and fill in the fields. Empty what you do not need ("" or []).
   5. Save the file and refresh the page.
   ====================================================================== */

const PROJECTS = [

  /* ----- TEMPLATE: copy this block, paste it below, remove the slashes, fill it in ----- */
  // {
  //   /* REQUIRED */
  //   id: "",                       // Lowercase letters, numbers and dashes only. Must be different for every system. Used in the web address and image names.
  //   name: "",                     // The system's name.
  //   type: "Web",                   // Used for the filter buttons. Examples: Web, Mobile, Desktop, API. Spell it the same way each time.
  //   summary: "",                  // One-line description: what it does and who it is for.

  //   /* OPTIONAL: shown on the card and the project page */
  //   status: "",                   // Live, Prototype or In development.
  //   role: "",                     // Your part in it: Solo, Lead or Contributor.
  //   result: "",                   // One measurable outcome. Use real numbers only.
  //   timeline: "",                 // Example: "2024 - 2025"
  //   team: "",                     // Example: "3 people"

  //   /* OPTIONAL: the "At a glance" strip on the project page */
  //   problem: "",                  // One sentence: who struggled with what.
  //   built: "",                    // One sentence: the system and your part in it.
  //   change: "",                   // One sentence: what you would do differently next time.

  //   /* OPTIONAL: lists. Use [] to hide a list. */
  //   features: [
  //     { title: "", text: "" },
  //     { title: "", text: "" },
  //   ],
  //   stack: [],                    // Technologies used. The first three also show on the card.
  //   challenges: [                 // The decisions and trade-offs section.
  //     { challenge: "", solution: "" },
  //   ],
  //   results: [
  //     { value: "", label: "" },
  //   ],

  //   /* OPTIONAL: images. Put the files in the images folder.
  //      Naming rule: <id>-1.jpg, <id>-2.jpg, <id>-3.jpg ...
  //      The first image is the cover (card and top of the page). Ideal size: 1600 x 1000 pixels. */
  //   screenshots: [],

  //   /* OPTIONAL: links. "" = the button is hidden. */
  //   demoUrl: "",
  //   githubUrl: "",
  //   videoUrl: "",
  // },

  {
    id: "endpoint-threat-tracker",
    name: "Endpoint Threat Tracker",
    type: "Web",
    summary: "A defensive, read-only threat detection and incident tracker for Windows endpoints, with a local dashboard.",

    status: "",
    role: "Solo",    // Solo, Lead or Contributor
    result: "",      // [NEEDED] one real number, if you have one
    timeline: "Oct 23 - 29, 2026", // from the first to the last commit
    team: "",

    problem: "A small team has endpoint logs and indicator lists, but nothing that turns them into incidents someone can work through.",
    built: "Export scripts drop metadata-only logs into an inbox; the tracker parses them, scores machines against editable indicators, correlates signals into incidents, and tracks response to a 14-day re-check.",
    change: "",      // [NEEDED] what you would do differently next time

    features: [
      { title: "Read-only by construction", text: "It only reads files dropped into an inbox folder: it never scans, probes, blocks or deletes on any machine." },
      { title: "Detection families", text: "Cryptomining, ransomware, remote access and suspicious-execution rules, all editable as indicator lists." },
      { title: "Incidents with checklists", text: "Correlated signals become incidents with per-type response checklists, per-PC workflow states and a post-cleanup re-check." },
      { title: "Config, not code", text: "Every path, threshold, weight and indicator list is a config file, so tuning needs no code change." },
      { title: "Hardened parsing", text: "Event logs arrive as CSV with a JSON column, so XML-based parser attacks have no surface." },
      { title: "Audit and alerts", text: "Parameterised SQLite storage with schema tracking, PBKDF2 sessions, and alerts to log, email or Teams." },
    ],
    stack: ["Python", "FastAPI", "SQLite", "PowerShell"],
    challenges: [
      { challenge: "Security tooling that scans endpoints is itself a risk: a bug becomes an outage on someone else's machine.", solution: "Constrained it to read-only ingest from a drop folder, and wrote that boundary down as the first design rule rather than a feature." },
      { challenge: "The parser was the soft spot. XML-based event logs open the door to entity-expansion attacks.", solution: "Removed XML entirely: logs are exported as CSV with a JSON column, which closes that class of attack instead of filtering it." },
      { challenge: "Scoring rules change every week, and a code change per rule means a deploy per rule.", solution: "Every path, threshold, weight and indicator list lives in config, so tuning happens without touching the tracker." },
    ],
    results: [],     // [NEEDED] real numbers only: incidents triaged, time saved, false positives cut.

    screenshots: [], // [NEEDED] images/endpoint-threat-tracker-1.png, 1600 x 1000

    demoUrl: "",
    githubUrl: "https://github.com/sketch-debug/endpoint-threat-tracker",
    videoUrl: "",
  },

  {
    id: "clinic-inventory",
    name: "Clinic Stock Ledger",
    type: "Desktop",
    summary: "An append-only stock ledger for a clinic, built as a macro-enabled Excel workbook that staff already know how to use.",

    status: "",
    role: "Solo",    // Solo, Lead or Contributor
    result: "",      // [NEEDED] one real number, if you have one
    timeline: "Oct 2026",          // every commit landed on Oct 15, 2026 - widen if the build ran longer
    team: "",

    problem: "Stock disappears into edited spreadsheets: there is no audit trail, and a wrong cell is impossible to trace.",
    built: "A workbook where stock is never typed. Every movement is a new row in a Log, and the Items sheet derives current stock with SUMIFS.",
    change: "",      // [NEEDED]

    features: [
      { title: "Append-only log", text: "Mistakes are fixed with a reversal row, never by editing or deleting history." },
      { title: "Guards before writing", text: "A reversal must name the row it undoes, cannot exceed it, and cannot take an item below zero." },
      { title: "One source of truth for the layout", text: "Sheet names, columns and anchors live in one Python file; the VBA constants are generated from it." },
      { title: "Drift check", text: "A script fails the build if the workbook, the VBA and the layout disagree." },
      { title: "Tests against the real macros", text: "The test script drives the actual macros on a scratch copy and asserts zero formula errors." },
    ],
    stack: ["Python", "openpyxl", "Excel VBA"],
    challenges: [
      { challenge: "Two copies of the truth: the workbook builder and the VBA both described the layout.", solution: "Moved the layout into one Python module and generated the VBA constants from it, with a check that fails on drift." },
      { challenge: "A spreadsheet invites silent edits to past numbers.", solution: "Made the ledger append-only, with reversal rows and validation that refuses a bad movement before anything is written." },
    ],
    results: [],     // [NEEDED]

    screenshots: [], // [NEEDED]

    demoUrl: "",
    githubUrl: "https://github.com/sketch-debug/clinic-inventory",
    videoUrl: "",
  },

  {
    id: "secure-review",
    name: "Secure Review",
    type: "Desktop",
    summary: "A command-line tool that runs Checkov, Trivy and Bandit over a codebase and returns one normalized, prioritized SARIF report.",

    status: "",
    role: "Solo",    // Solo, Lead or Contributor
    result: "",      // [NEEDED]
    timeline: "Sep 27 - 30, 2026", // from the first to the last commit
    team: "",

    problem: "Three scanners each answer in their own shape, with their own severities, so nobody can tell what actually needs fixing first.",
    built: "A CLI that runs Checkov, Trivy config and Bandit, normalizes their findings into one severity order, and writes SARIF for code scanning.",
    change: "",      // [NEEDED]

    features: [
      { title: "One report, one severity order", text: "Findings from three scanners are normalized and ranked together." },
      { title: "SARIF output", text: "The result drops straight into a code-scanning view." },
      { title: "Honest failure states", text: "A scanner that never ran is reported as a tool error, not as a clean pass." },
      { title: "Reproducible fixtures", text: "Real Checkov and Trivy output is committed and asserted, so an upgrade cannot quietly produce a false green." },
      { title: "Pinned upgrades", text: "Scanner versions are pinned in six places; one script moves the mechanical pins and refuses to guess the rest." },
    ],
    stack: ["Python", "Checkov", "Trivy", "Bandit", "SARIF", "GitHub Actions"],
    challenges: [
      { challenge: "An old scanner reading new fixtures, or the reverse, gives a green build that means nothing.", solution: "Committed verbatim scanner output as fixtures, with provenance assertions on the embedded version." },
      { challenge: "Silent severity mismatches between tools.", solution: "Normalized every finding into a single ordering before reporting." },
      { challenge: "A scanner that crashes is easy to mistake for a scanner that found nothing.", solution: "Reported a tool that never ran as an error state, so a broken run can never be read as a pass." },
    ],
    results: [],     // [NEEDED]

    screenshots: [], // [NEEDED]

    demoUrl: "",
    githubUrl: "https://github.com/sketch-debug/secure-review",
    videoUrl: "",
  },

];

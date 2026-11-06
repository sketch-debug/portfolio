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

   STATUS: this file ships EMPTY of placeholders, ready for your real content.
   Fill the four REQUIRED fields below (name, title, headline, bio) and the
   yellow "Content check" banner at the top of the site disappears.
   ====================================================================== */


const SITE = {

  /* ---------- REQUIRED ---------- */
  name: "",                               // Top-left corner and footer.
  title: "",                              // Small label above the headline. Example: "Full-Stack Developer"
  headline: "",                           // The big sentence at the top. Example: "I build booking systems for clinics."
  bio: "",                                // Under the headline. 2-3 sentences.

  /* ---------- CONTACT ---------- */
  email: "",                              // REQUIRED for the Contact section. Example: "you@example.com"
  github: "https://github.com/sketch-debug", // OPTIONAL. Full link, starting with https://
  linkedin: "",                           // OPTIONAL. Full link, starting with https://
  otherLinks: [                           // OPTIONAL. Any other links. Use [] to hide.
    // { label: "Portfolio on Behance", url: "https://example.com" },
  ],
  contactFormUrl: "",                     // OPTIONAL. Paste a Formspree form link to show a message form (see README). "" = no form.

  /* ---------- HOME PAGE EXTRAS (all OPTIONAL) ---------- */
  availability: "",                       // Small green-dot label in the top section. Example: "Open to roles and freelance". "" = hide.
  replyTime: "",                          // Shows "I reply within [N] days." Example: "2 days". "" = hide.
  resumeUrl: "",                          // Download resume button. Put your file in the files folder, then use "files/resume.pdf". "" = hide.
  photo: "",                              // Your photo or logo, for example "images/photo.jpg". "" = hide.
  accentColor: "#2438D9",                 // Main button color. Pick a DARK color so white text stays readable.
  siteUrl: "https://sketch-debug.github.io/portfolio/",  // OPTIONAL. Your live address, like "https://your-name.github.io/portfolio". Used by build.js for share links and sitemap.xml.

  about: [                                // OPTIONAL. One paragraph per line. [] = hide the About section.
    // "Who you are and how you got into building systems.",
    // "How you work, what you care about, what you are looking for next.",
  ],

  skills: [                               // OPTIONAL. Groups of skills. [] = hide.
    { group: "Languages", items: ["Python", "PowerShell", "VBA", "SQL"] },
    { group: "Tooling",   items: ["FastAPI", "SQLite", "openpyxl", "pytest", "GitHub Actions"] },
    { group: "Security",  items: ["Checkov", "Trivy", "Bandit", "SARIF"] },
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
   Each system is one block between { and }. Blocks appear on the site in this order.

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

  //   /* OPTIONAL: lists. Use [] to hide a list. */
  //   features: [
  //     { title: "", text: "" },
  //     { title: "", text: "" },
  //   ],
  //   stack: [],                    // Technologies used. The first three also show on the card.
  //   challenges: [
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
    id: "clinic-inventory",
    name: "Clinic Stock Ledger",
    type: "Desktop",
    summary: "An append-only stock ledger for a clinic, built as a macro-enabled Excel workbook that staff already know how to use.",

    status: "",
    role: "",
    result: "",
    timeline: "",
    team: "",

    problem: "Stock disappears into edited spreadsheets: there is no audit trail, and a wrong cell is impossible to trace.",
    built: "A workbook where stock is never typed. Every movement is a new row in a Log, and the Items sheet derives current stock with SUMIFS.",

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
    results: [],

    screenshots: [],

    demoUrl: "",
    githubUrl: "",
    videoUrl: "",
  },

  {
    id: "endpoint-threat-tracker",
    name: "Endpoint Threat Tracker",
    type: "Web",
    summary: "A defensive, read-only threat detection and incident tracker for Windows endpoints, with a local dashboard.",

    status: "",
    role: "",
    result: "",
    timeline: "",
    team: "",

    problem: "A small team has endpoint logs and indicator lists, but nothing that turns them into incidents someone can work through.",
    built: "Export scripts drop metadata-only logs into an inbox; the tracker parses them, scores machines against editable indicators, correlates signals into incidents, and tracks response to a 14-day re-check.",

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
      { challenge: "Security tooling that scans endpoints is itself a risk.", solution: "Constrained it to read-only ingest from a drop folder, and documented that boundary as the core design rule." },
      { challenge: "The parser was the soft spot.", solution: "Removed XML entirely: logs are exported as CSV with a JSON column, which closes off XXE-style attacks." },
    ],
    results: [],

    screenshots: [],

    demoUrl: "",
    githubUrl: "https://github.com/sketch-debug/endpoint-threat-tracker",
    videoUrl: "",
  },

  {
    id: "secure-review",
    name: "Secure Review",
    type: "Desktop",
    summary: "A command-line tool that runs Checkov, Trivy and Bandit over a codebase and returns one normalized, prioritized SARIF report.",

    status: "",
    role: "",
    result: "",
    timeline: "",
    team: "",

    problem: "Three scanners each answer in their own shape, with their own severities, so nobody can tell what actually needs fixing first.",
    built: "A CLI that runs Checkov, Trivy config and Bandit, normalizes their findings into one severity order, and writes SARIF for code scanning.",

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
    ],
    results: [],

    screenshots: [],

    demoUrl: "",
    githubUrl: "",
    videoUrl: "",
  },

];

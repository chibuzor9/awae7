import type { WcagCard } from "@/types";

export const wcagCards: WcagCard[] = [
  // ===== Principle 1: Perceivable =====
  {
    criterionId: "1.1.1",
    criterionNumber: "1.1.1",
    title: "Non-text Content",
    principle: "Perceivable",
    level: "A",
    description:
      "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.",
    explanation:
      "Images, icons, charts, and other non-text elements must include descriptive text alternatives so screen readers and assistive technologies can convey their meaning. Decorative images should be marked so they are ignored by assistive technology.",
    implementationExamples: {
      good: `<!-- Informative image with alt text -->
<img src="chart.png" alt="Bar chart showing 40% increase in sales from Q1 to Q2 2024" />

<!-- Decorative image hidden from assistive tech -->
<img src="decorative-border.png" alt="" role="presentation" />

<!-- Icon button with accessible name -->
<button aria-label="Search">
  <svg aria-hidden="true">...</svg>
</button>`,
      bad: `<!-- Missing alt attribute -->
<img src="chart.png" />

<!-- Non-descriptive alt text -->
<img src="chart.png" alt="image" />

<!-- Icon button without label -->
<button>
  <svg>...</svg>
</button>`,
    },
    commonViolations: [
      "Images missing alt attributes entirely",
      "Generic alt text like 'image', 'photo', or 'icon'",
      "Decorative images not marked with empty alt or role='presentation'",
      "Complex charts or infographics without detailed text descriptions",
      "CAPTCHAs without audio or other accessible alternatives",
    ],
    remediationStrategies: [
      "Add descriptive alt text to all informative images",
      "Use empty alt attributes (alt='') for purely decorative images",
      "Provide long descriptions for complex images using aria-describedby or figure/figcaption",
      "Ensure all icon buttons have aria-label or visually hidden text",
      "Use SVG title elements or aria-label for inline SVG graphics",
    ],
  },
  {
    criterionId: "1.2.1",
    criterionNumber: "1.2.1",
    title: "Audio-only and Video-only (Prerecorded)",
    principle: "Perceivable",
    level: "A",
    description:
      "For prerecorded audio-only and prerecorded video-only media, an alternative is provided.",
    explanation:
      "Prerecorded audio content needs a transcript, and prerecorded video-only content (no audio track) needs either a transcript or an audio description. This ensures deaf and hard-of-hearing users can access audio content, and blind users can access visual-only content.",
    implementationExamples: {
      good: `<!-- Audio with transcript link -->
<audio controls src="podcast.mp3"></audio>
<a href="podcast-transcript.html">Read the full transcript</a>

<!-- Video-only with description -->
<video controls src="animation.mp4"></video>
<p>Description: The animation shows the step-by-step process of...</p>`,
      bad: `<!-- Audio without transcript -->
<audio controls src="podcast.mp3"></audio>

<!-- Video without description -->
<video controls src="animation.mp4"></video>`,
    },
    commonViolations: [
      "Podcast or audio recordings without transcripts",
      "Animated tutorials without text descriptions",
      "Background music players without content descriptions",
    ],
    remediationStrategies: [
      "Provide text transcripts for all prerecorded audio content",
      "Include descriptive text or audio tracks for video-only content",
      "Link transcripts directly adjacent to the media player",
    ],
  },
  {
    criterionId: "1.2.2",
    criterionNumber: "1.2.2",
    title: "Captions (Prerecorded)",
    principle: "Perceivable",
    level: "A",
    description:
      "Captions are provided for all prerecorded audio content in synchronized media.",
    explanation:
      "Videos with audio must have synchronized captions so deaf and hard-of-hearing users can follow the dialogue, sound effects, and other meaningful audio content. Auto-generated captions must be reviewed for accuracy.",
    implementationExamples: {
      good: `<!-- Video with captions track -->
<video controls>
  <source src="presentation.mp4" type="video/mp4" />
  <track kind="captions" src="captions-en.vtt" srclang="en" label="English" default />
</video>`,
      bad: `<!-- Video without captions -->
<video controls>
  <source src="presentation.mp4" type="video/mp4" />
</video>`,
    },
    commonViolations: [
      "Videos without any captions",
      "Auto-generated captions that have not been reviewed for accuracy",
      "Captions that do not include sound effects or speaker identification",
      "Captions with poor timing or synchronization",
    ],
    remediationStrategies: [
      "Add WebVTT caption tracks to all video content",
      "Review and correct auto-generated captions",
      "Include non-speech sounds like [applause] or [music] in captions",
      "Identify speakers in multi-person content",
    ],
  },
  {
    criterionId: "1.2.3",
    criterionNumber: "1.2.3",
    title: "Audio Description or Media Alternative (Prerecorded)",
    principle: "Perceivable",
    level: "A",
    description:
      "An alternative for time-based media or audio description of the prerecorded video content is provided.",
    explanation:
      "When important visual information is not conveyed through the audio track alone, an audio description or full text alternative must be provided so blind users understand the visual content.",
    implementationExamples: {
      good: `<!-- Video with audio description track -->
<video controls>
  <source src="tutorial.mp4" type="video/mp4" />
  <track kind="descriptions" src="descriptions-en.vtt" srclang="en" label="English Audio Descriptions" />
</video>
<a href="tutorial-transcript.html">Full transcript with visual descriptions</a>`,
      bad: `<!-- Video relying only on visuals with no description -->
<video controls src="tutorial.mp4"></video>`,
    },
    commonViolations: [
      "Videos where visual-only information is critical but undescribed",
      "Tutorials that say 'click here' without describing what 'here' looks like",
      "Presentations where slide content is not read aloud",
    ],
    remediationStrategies: [
      "Create audio description tracks for videos with important visual content",
      "Provide full text transcripts that include visual descriptions",
      "Narrate important visual information during natural pauses in dialogue",
    ],
  },
  {
    criterionId: "1.2.5",
    criterionNumber: "1.2.5",
    title: "Audio Description (Prerecorded)",
    principle: "Perceivable",
    level: "AA",
    description:
      "Audio description is provided for all prerecorded video content in synchronized media.",
    explanation:
      "This extends 1.2.3 by requiring a dedicated audio description track (not just a text alternative) for all prerecorded video content with important visual information not conveyed in the existing audio.",
    implementationExamples: {
      good: `<!-- Video with dedicated audio description -->
<video controls>
  <source src="documentary.mp4" type="video/mp4" />
  <track kind="descriptions" src="ad-en.vtt" srclang="en" label="Audio Descriptions" />
</video>`,
      bad: `<!-- No audio description provided -->
<video controls src="documentary.mp4"></video>`,
    },
    commonViolations: [
      "Training videos without audio descriptions",
      "Product demos that only show visual changes without narration",
    ],
    remediationStrategies: [
      "Produce professional audio description tracks",
      "Use extended audio descriptions when natural pauses are too short",
      "Integrate visual descriptions into the main narration where possible",
    ],
  },
  {
    criterionId: "1.3.1",
    criterionNumber: "1.3.1",
    title: "Info and Relationships",
    principle: "Perceivable",
    level: "A",
    description:
      "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.",
    explanation:
      "Use proper semantic HTML elements so screen readers and assistive technologies can understand the structure. Headings, lists, tables, form labels, and landmarks must be marked up correctly rather than styled visually with CSS alone.",
    implementationExamples: {
      good: `<!-- Proper heading hierarchy -->
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection</h3>

<!-- Proper form labeling -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" />

<!-- Semantic table -->
<table>
  <thead><tr><th scope="col">Name</th><th scope="col">Role</th></tr></thead>
  <tbody><tr><td>Alice</td><td>Developer</td></tr></tbody>
</table>`,
      bad: `<!-- Fake heading using CSS only -->
<div class="big-bold-text">Page Title</div>

<!-- Input without label -->
<input type="email" placeholder="Enter email" />

<!-- Table using divs -->
<div class="table-row">
  <div class="table-cell">Name</div>
  <div class="table-cell">Role</div>
</div>`,
    },
    commonViolations: [
      "Using div/span styled to look like headings instead of h1-h6",
      "Form inputs without associated labels",
      "Tables used for layout instead of data",
      "Data tables missing thead/th/scope attributes",
      "Lists styled as plain divs without ul/ol/li",
    ],
    remediationStrategies: [
      "Use correct heading levels in order (h1 through h6)",
      "Associate every form input with a label element or aria-label",
      "Use semantic HTML5 landmarks (nav, main, aside, footer)",
      "Mark up data tables with thead, th, and scope attributes",
      "Use lists (ul/ol) for groups of related items",
    ],
  },
  {
    criterionId: "1.3.2",
    criterionNumber: "1.3.2",
    title: "Meaningful Sequence",
    principle: "Perceivable",
    level: "A",
    description:
      "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.",
    explanation:
      "The DOM order of content should match the visual order so screen readers read content in a logical sequence. CSS should not reorder content in a way that changes meaning without updating the source order.",
    implementationExamples: {
      good: `<!-- DOM order matches visual reading order -->
<article>
  <h2>Article Title</h2>
  <p>First paragraph...</p>
  <p>Second paragraph...</p>
</article>`,
      bad: `<!-- CSS reorders content differently from DOM -->
<div style="display: flex; flex-direction: column-reverse;">
  <p>This should be read first but appears last in DOM</p>
  <p>This appears first but should be read last</p>
</div>`,
    },
    commonViolations: [
      "CSS flexbox/grid reordering that changes reading sequence",
      "Content that makes sense visually but not when linearized",
      "Floating elements that interrupt the reading flow",
    ],
    remediationStrategies: [
      "Ensure DOM order matches the intended visual reading order",
      "Avoid using CSS order property to change meaningful content sequence",
      "Test content with CSS disabled to verify reading order",
    ],
  },
  {
    criterionId: "1.3.3",
    criterionNumber: "1.3.3",
    title: "Sensory Characteristics",
    principle: "Perceivable",
    level: "A",
    description:
      "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, color, size, visual location, orientation, or sound.",
    explanation:
      "Instructions must not depend only on visual or auditory cues. For example, 'click the round button' or 'the items in red are required' are not sufficient alone. Combine visual cues with text labels.",
    implementationExamples: {
      good: `<!-- Instruction uses both text and visual cue -->
<p>Click the <strong>Submit</strong> button (green, on the right) to continue.</p>

<!-- Error state uses text and color -->
<label>
  Email <span class="text-red-500">*</span>
  <span class="sr-only">(required)</span>
</label>`,
      bad: `<!-- Instruction relies solely on position -->
<p>Click the button on the right to continue.</p>

<!-- Error indicated only by color -->
<input style="border-color: red;" />`,
    },
    commonViolations: [
      "Instructions that reference only shape, color, or location",
      "Error messages indicated only by color change",
      "Required fields marked only with a colored asterisk",
    ],
    remediationStrategies: [
      "Provide text labels alongside visual indicators",
      "Use multiple cues (text, icon, color) together",
      "Add aria-required='true' and visible text for required fields",
    ],
  },
  {
    criterionId: "1.3.4",
    criterionNumber: "1.3.4",
    title: "Orientation",
    principle: "Perceivable",
    level: "AA",
    description:
      "Content does not restrict its view and operation to a single display orientation, unless a specific orientation is essential.",
    explanation:
      "Users must be able to use the content in both portrait and landscape orientations. Some users mount devices in a fixed orientation, so the content must adapt unless a specific orientation is truly essential (e.g., a piano app).",
    implementationExamples: {
      good: `/* Responsive design that works in both orientations */
.container {
  display: flex;
  flex-wrap: wrap;
}

@media (orientation: portrait) {
  .sidebar { width: 100%; }
}
@media (orientation: landscape) {
  .sidebar { width: 25%; }
}`,
      bad: `/* Forces landscape only */
@media (orientation: portrait) {
  body {
    transform: rotate(90deg);
    transform-origin: top left;
  }
}`,
    },
    commonViolations: [
      "Pages that only work in landscape mode",
      "CSS that forces rotation in portrait orientation",
      "Content that becomes unusable in one orientation",
    ],
    remediationStrategies: [
      "Design responsive layouts that adapt to both orientations",
      "Remove CSS or JS that forces a specific orientation",
      "Test in both portrait and landscape modes",
    ],
  },
  {
    criterionId: "1.3.5",
    criterionNumber: "1.3.5",
    title: "Identify Input Purpose",
    principle: "Perceivable",
    level: "AA",
    description:
      "The purpose of each input field collecting information about the user can be programmatically determined when the input field serves a known purpose.",
    explanation:
      "Input fields for common data like name, email, address, etc. should use the HTML autocomplete attribute so browsers and assistive technologies can autofill and present the purpose of the field to users.",
    implementationExamples: {
      good: `<!-- Inputs with autocomplete for autofill -->
<label for="name">Full Name</label>
<input type="text" id="name" autocomplete="name" />

<label for="email">Email</label>
<input type="email" id="email" autocomplete="email" />

<label for="tel">Phone</label>
<input type="tel" id="tel" autocomplete="tel" />`,
      bad: `<!-- Missing autocomplete attributes -->
<input type="text" placeholder="Name" />
<input type="text" placeholder="Email" />
<input type="text" placeholder="Phone" />`,
    },
    commonViolations: [
      "Form fields without autocomplete attributes",
      "Wrong autocomplete values (e.g., autocomplete='off' on name fields)",
      "Custom input components that don't pass through autocomplete",
    ],
    remediationStrategies: [
      "Add appropriate autocomplete attributes to personal data inputs",
      "Use standard HTML input types (email, tel, url)",
      "Map custom components to proper autocomplete tokens",
    ],
  },
  {
    criterionId: "1.4.1",
    criterionNumber: "1.4.1",
    title: "Use of Color",
    principle: "Perceivable",
    level: "A",
    description:
      "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.",
    explanation:
      "Information conveyed with color must also be conveyed in another way (text, patterns, icons). This ensures users who are colorblind or cannot see colors can still understand the content.",
    implementationExamples: {
      good: `<!-- Link distinguishable by underline + color -->
<a href="/about" class="text-blue-600 underline">About Us</a>

<!-- Status uses icon + color + text -->
<span class="text-green-600">
  <CheckIcon aria-hidden="true" /> Approved
</span>
<span class="text-red-600">
  <XIcon aria-hidden="true" /> Rejected
</span>`,
      bad: `<!-- Link only distinguished by color -->
<a href="/about" class="text-blue-600">About Us</a>

<!-- Status only indicated by color -->
<span class="text-green-600">Approved</span>
<span class="text-red-600">Rejected</span>`,
    },
    commonViolations: [
      "Links distinguished only by color within text",
      "Form errors shown only as red borders",
      "Charts using only color to differentiate data series",
      "Required fields marked only with a red asterisk",
    ],
    remediationStrategies: [
      "Add underlines or other visual styling to links",
      "Use icons, patterns, or text alongside color indicators",
      "Provide text labels for status indicators",
      "Use patterns or labels in addition to color in charts",
    ],
  },
  {
    criterionId: "1.4.2",
    criterionNumber: "1.4.2",
    title: "Audio Control",
    principle: "Perceivable",
    level: "A",
    description:
      "If any audio plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the system volume.",
    explanation:
      "Auto-playing audio can interfere with screen reader output and be disorienting for users. Provide controls to stop, pause, or adjust the volume of any audio that plays automatically.",
    implementationExamples: {
      good: `<!-- Audio with controls, not autoplay -->
<audio controls>
  <source src="background.mp3" type="audio/mpeg" />
</audio>

<!-- If autoplay is needed, provide stop button -->
<button onclick="stopAudio()" aria-label="Stop background music">
  Stop Music
</button>`,
      bad: `<!-- Auto-playing audio with no controls -->
<audio autoplay loop>
  <source src="background.mp3" type="audio/mpeg" />
</audio>`,
    },
    commonViolations: [
      "Background music that auto-plays with no pause control",
      "Video ads that auto-play audio",
      "Audio that cannot be independently volume-controlled",
    ],
    remediationStrategies: [
      "Avoid auto-playing audio content",
      "Provide visible pause/stop controls for any audio",
      "Allow independent volume control separate from system volume",
    ],
  },
  {
    criterionId: "1.4.3",
    criterionNumber: "1.4.3",
    title: "Contrast (Minimum)",
    principle: "Perceivable",
    level: "AA",
    description:
      "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for large text (3:1), incidental text, or logotypes.",
    explanation:
      "Sufficient contrast between text and its background ensures readability for users with low vision or color deficiencies. Large text (18pt or 14pt bold) requires a minimum ratio of 3:1; all other text requires 4.5:1.",
    implementationExamples: {
      good: `/* Good contrast ratios */
.body-text {
  color: #1f2937;          /* gray-800 */
  background-color: #ffffff; /* white */
  /* Contrast ratio: 14.7:1 */
}

.large-heading {
  color: #4b5563;          /* gray-600 */
  font-size: 24px;
  /* Contrast ratio: 5.9:1 (meets 3:1 for large text) */
}`,
      bad: `/* Poor contrast ratios */
.body-text {
  color: #9ca3af;          /* gray-400 */
  background-color: #ffffff; /* white */
  /* Contrast ratio: 2.9:1 - FAILS */
}

.placeholder-text {
  color: #d1d5db;          /* gray-300 */
  /* Contrast ratio: 1.7:1 - FAILS */
}`,
    },
    commonViolations: [
      "Light gray text on white backgrounds",
      "Low contrast placeholder text in inputs",
      "Text over images without sufficient contrast overlay",
      "Disabled state text that is still expected to be readable",
    ],
    remediationStrategies: [
      "Use a contrast checker tool to verify all text combinations",
      "Ensure body text has at least 4.5:1 contrast ratio",
      "Add background overlays for text on images",
      "Choose darker text colors or lighter backgrounds as needed",
    ],
  },
  {
    criterionId: "1.4.4",
    criterionNumber: "1.4.4",
    title: "Resize Text",
    principle: "Perceivable",
    level: "AA",
    description:
      "Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality.",
    explanation:
      "Users with low vision need to enlarge text. The page should remain usable and readable when text is zoomed to 200%. Content must not be cut off, overlapping, or lost.",
    implementationExamples: {
      good: `/* Use relative units for text sizing */
body { font-size: 1rem; }
h1 { font-size: 2em; }
p { font-size: 1rem; line-height: 1.5; }

/* Containers adapt to text size */
.card { padding: 1em; max-width: 40rem; }`,
      bad: `/* Fixed pixel sizes prevent proper resizing */
body { font-size: 12px; }
.card { width: 400px; height: 200px; overflow: hidden; }`,
    },
    commonViolations: [
      "Fixed-height containers that clip enlarged text",
      "Text in pixel units that does not scale with browser zoom",
      "Overlapping elements at 200% zoom",
    ],
    remediationStrategies: [
      "Use relative units (rem, em) instead of pixels for font sizes",
      "Avoid fixed-height containers for text content",
      "Test the page at 200% browser zoom",
      "Use CSS that allows text containers to grow",
    ],
  },
  {
    criterionId: "1.4.5",
    criterionNumber: "1.4.5",
    title: "Images of Text",
    principle: "Perceivable",
    level: "AA",
    description:
      "If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.",
    explanation:
      "Avoid using images to display text content. Real text can be resized, styled, and read by assistive technologies. Images of text become pixelated when zoomed and cannot be reflowed.",
    implementationExamples: {
      good: `<!-- Real text with CSS styling -->
<h1 class="text-4xl font-bold text-blue-900">Welcome to Our Site</h1>

<!-- Styled button with real text -->
<button class="bg-blue-600 text-white rounded-lg px-6 py-3">Get Started</button>`,
      bad: `<!-- Image used instead of text -->
<img src="welcome-heading.png" alt="Welcome to Our Site" />

<!-- Image used for a button -->
<img src="get-started-button.png" alt="Get Started" onclick="start()" />`,
    },
    commonViolations: [
      "Headers or logos that are images of text",
      "Navigation items rendered as images",
      "Buttons that are images of text instead of styled HTML buttons",
    ],
    remediationStrategies: [
      "Replace images of text with styled HTML text",
      "Use web fonts to achieve desired typography",
      "Only use images of text for logos or when customization is allowed",
    ],
  },
  {
    criterionId: "1.4.10",
    criterionNumber: "1.4.10",
    title: "Reflow",
    principle: "Perceivable",
    level: "AA",
    description:
      "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions, at a width of 320 CSS pixels and height of 256 CSS pixels.",
    explanation:
      "Users who zoom in on the page or use small screens should not have to scroll both horizontally and vertically. Content must reflow into a single column at 320px width (equivalent to 400% zoom on a 1280px screen).",
    implementationExamples: {
      good: `/* Responsive layout that reflows */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.content {
  max-width: 100%;
  overflow-wrap: break-word;
}`,
      bad: `/* Fixed-width layout that requires horizontal scroll */
.container {
  width: 1200px;
  overflow-x: auto;
}

.columns {
  display: flex;
  flex-wrap: nowrap;
}`,
    },
    commonViolations: [
      "Fixed-width layouts that do not adapt to narrow viewports",
      "Horizontal scrolling required to read content",
      "Data tables that do not adapt at all to small screens",
    ],
    remediationStrategies: [
      "Use responsive design with CSS Grid or Flexbox",
      "Set max-width: 100% on images and containers",
      "Test at 320px viewport width",
      "Consider responsive table patterns for data tables",
    ],
  },
  {
    criterionId: "1.4.11",
    criterionNumber: "1.4.11",
    title: "Non-text Contrast",
    principle: "Perceivable",
    level: "AA",
    description:
      "The visual presentation of UI components and graphical objects has a contrast ratio of at least 3:1 against adjacent colors.",
    explanation:
      "Interactive elements (buttons, inputs, checkboxes) and meaningful graphics must have sufficient contrast so they are perceivable. This includes focus indicators, form field borders, and icons that convey information.",
    implementationExamples: {
      good: `/* Input with visible border */
input {
  border: 2px solid #6b7280; /* gray-500 on white = 5.0:1 */
  border-radius: 0.375rem;
}

/* Focus ring with sufficient contrast */
input:focus {
  outline: 2px solid #2563eb; /* blue-600 on white = 5.2:1 */
  outline-offset: 2px;
}`,
      bad: `/* Input border too light */
input {
  border: 1px solid #e5e7eb; /* gray-200 on white = 1.4:1 - FAILS */
}

/* Focus indicator with poor contrast */
input:focus {
  outline: 1px solid #93c5fd; /* blue-300 on white = 2.1:1 - FAILS */
}`,
    },
    commonViolations: [
      "Form input borders with insufficient contrast",
      "Custom checkboxes or radio buttons with low contrast",
      "Focus indicators that are barely visible",
      "Chart elements without sufficient contrast between data and background",
    ],
    remediationStrategies: [
      "Ensure form control borders have at least 3:1 contrast",
      "Use visible, high-contrast focus indicators",
      "Test custom UI components with a contrast checker",
      "Increase border width or use darker border colors",
    ],
  },
  {
    criterionId: "1.4.12",
    criterionNumber: "1.4.12",
    title: "Text Spacing",
    principle: "Perceivable",
    level: "AA",
    description:
      "No loss of content or functionality occurs when users override text spacing: line height to 1.5, paragraph spacing to 2em, letter spacing to 0.12em, and word spacing to 0.16em.",
    explanation:
      "Users with dyslexia or low vision may need to customize text spacing for readability. The design must accommodate these overrides without clipping, overlapping, or hiding content.",
    implementationExamples: {
      good: `/* Flexible containers that adapt to text spacing changes */
.card {
  padding: 1em;
  min-height: auto; /* allows growth */
  overflow: visible;
}

/* Avoid fixed heights on text containers */
.text-content {
  height: auto;
}`,
      bad: `/* Fixed height clips text when spacing is increased */
.card {
  height: 200px;
  overflow: hidden;
}

.text-content {
  max-height: 100px;
  overflow: hidden;
}`,
    },
    commonViolations: [
      "Fixed-height containers that clip text when spacing increases",
      "Overlapping text when line-height is overridden",
      "Buttons or links that become unusable with increased spacing",
    ],
    remediationStrategies: [
      "Use min-height instead of fixed height for text containers",
      "Test with text spacing override bookmarklet",
      "Avoid overflow: hidden on text-containing elements",
      "Let containers grow naturally with their content",
    ],
  },
  {
    criterionId: "1.4.13",
    criterionNumber: "1.4.13",
    title: "Content on Hover or Focus",
    principle: "Perceivable",
    level: "AA",
    description:
      "Where receiving and then removing hover or focus triggers additional content to become visible and then hidden, the additional content is dismissible, hoverable, and persistent.",
    explanation:
      "Tooltips, dropdowns, and other content that appears on hover/focus must: (1) be dismissible with Escape without moving focus, (2) allow the pointer to move to the new content without it disappearing, and (3) remain visible until dismissed or focus/hover is removed.",
    implementationExamples: {
      good: `/* Tooltip that is hoverable and dismissible */
<div class="relative group">
  <button aria-describedby="tooltip-1">Hover me</button>
  <div
    id="tooltip-1"
    role="tooltip"
    class="hidden group-hover:block group-focus-within:block absolute z-10 p-2 bg-gray-900 text-white rounded"
  >
    Tooltip content that can be hovered over
  </div>
</div>`,
      bad: `/* Tooltip that disappears immediately when moving mouse */
<span title="This tooltip cannot be hovered over or dismissed">
  Hover me
</span>`,
    },
    commonViolations: [
      "Tooltips that disappear when moving the pointer to them",
      "Hover content that cannot be dismissed with Escape",
      "Dropdown menus that close when moving between trigger and menu",
    ],
    remediationStrategies: [
      "Make tooltip/hover content hoverable with pointer",
      "Allow Escape key to dismiss hover content",
      "Ensure hover content remains until explicitly dismissed",
      "Use sufficient delays before hiding hover content",
    ],
  },
  // ===== Principle 2: Operable =====
  {
    criterionId: "2.1.1",
    criterionNumber: "2.1.1",
    title: "Keyboard",
    principle: "Operable",
    level: "A",
    description:
      "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.",
    explanation:
      "Every interactive element must be usable with a keyboard alone. This includes links, buttons, form controls, drag-and-drop interfaces, and custom widgets. Users who cannot use a mouse rely entirely on keyboard navigation.",
    implementationExamples: {
      good: `<!-- Proper keyboard-accessible button -->
<button onclick="submitForm()">Submit</button>

<!-- Custom widget with keyboard support -->
<div
  role="button"
  tabindex="0"
  onkeydown="if(event.key==='Enter'||event.key===' ') activate()"
  onclick="activate()"
>
  Custom Action
</div>`,
      bad: `<!-- Click-only handler on a div -->
<div onclick="submitForm()">Submit</div>

<!-- Mouse-only drag interaction -->
<div onmousedown="startDrag()" onmousemove="drag()" onmouseup="endDrag()">
  Drag me
</div>`,
    },
    commonViolations: [
      "Click handlers on divs without keyboard event handlers",
      "Custom dropdowns that only work with mouse",
      "Drag-and-drop without keyboard alternative",
      "Interactive elements without tabindex or proper roles",
    ],
    remediationStrategies: [
      "Use native HTML elements (button, a, input) whenever possible",
      "Add tabindex='0' and keyboard event handlers to custom interactive elements",
      "Provide keyboard alternatives for drag-and-drop",
      "Test all interactions with keyboard only (Tab, Enter, Space, Arrow keys)",
    ],
  },
  {
    criterionId: "2.1.2",
    criterionNumber: "2.1.2",
    title: "No Keyboard Trap",
    principle: "Operable",
    level: "A",
    description:
      "If keyboard focus can be moved to a component using a keyboard interface, then focus can be moved away from that component using only a keyboard interface.",
    explanation:
      "Users must never get stuck in a component where they cannot Tab or Escape out. This commonly occurs with modal dialogs, embedded media players, or custom widgets that capture keyboard events.",
    implementationExamples: {
      good: `<!-- Modal with proper focus trapping and Escape to close -->
<div role="dialog" aria-modal="true" aria-label="Settings">
  <button onclick="closeModal()">Close</button>
  <!-- Focus trapped within modal but Escape key closes it -->
  <!-- Focus returns to trigger element on close -->
</div>`,
      bad: `<!-- Widget that captures all keyboard events -->
<div onkeydown="event.preventDefault()">
  <input type="text" />
  <!-- User cannot Tab out of this container -->
</div>`,
    },
    commonViolations: [
      "Modal dialogs that do not close with Escape key",
      "Third-party embedded widgets that trap focus",
      "Custom rich text editors that capture Tab key",
      "Iframe content that traps keyboard focus",
    ],
    remediationStrategies: [
      "Ensure Escape key closes modal dialogs and returns focus",
      "Provide clear instructions if non-standard keys are needed to exit",
      "Test all interactive components with Tab and Shift+Tab navigation",
      "Add skip links to bypass embedded widgets",
    ],
  },
  {
    criterionId: "2.1.4",
    criterionNumber: "2.1.4",
    title: "Character Key Shortcuts",
    principle: "Operable",
    level: "A",
    description:
      "If a keyboard shortcut is implemented using only letter, punctuation, number, or symbol characters, then the shortcut can be turned off, remapped, or is only active when the relevant component has focus.",
    explanation:
      "Single character keyboard shortcuts can interfere with speech input users who may accidentally trigger actions by speaking. Shortcuts should either use modifier keys (Ctrl, Alt) or be configurable.",
    implementationExamples: {
      good: `// Shortcut uses modifier key
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    saveDocument();
  }
});

// Single key shortcut only active when widget focused
searchInput.addEventListener('keydown', (e) => {
  if (e.key === '/') { /* activate search */ }
});`,
      bad: `// Global single-character shortcut
document.addEventListener('keydown', (e) => {
  if (e.key === 's') { saveDocument(); }
  if (e.key === 'd') { deleteItem(); }
});`,
    },
    commonViolations: [
      "Global single-letter keyboard shortcuts",
      "Shortcuts that cannot be disabled or remapped",
      "Single-key shortcuts that conflict with speech input",
    ],
    remediationStrategies: [
      "Use modifier keys (Ctrl, Alt, Shift) for global shortcuts",
      "Limit single-key shortcuts to focused components only",
      "Provide a way to disable or remap shortcuts in settings",
    ],
  },
  {
    criterionId: "2.2.1",
    criterionNumber: "2.2.1",
    title: "Timing Adjustable",
    principle: "Operable",
    level: "A",
    description:
      "For each time limit that is set by the content, the user can turn off, adjust, or extend the time limit.",
    explanation:
      "Users with disabilities may need more time to complete tasks. Session timeouts, auto-advancing carousels, and timed assessments must provide options to extend, adjust, or turn off time limits.",
    implementationExamples: {
      good: `<!-- Warning before session timeout -->
<div role="alertdialog" aria-label="Session timeout warning">
  <p>Your session will expire in 2 minutes.</p>
  <button onclick="extendSession()">Extend Session</button>
  <button onclick="logout()">Log Out</button>
</div>`,
      bad: `<!-- Session expires without warning -->
<script>
  setTimeout(() => { window.location = '/login'; }, 300000);
</script>`,
    },
    commonViolations: [
      "Session timeouts without warning or extension option",
      "Auto-advancing carousels without pause controls",
      "Timed quizzes without time extension accommodations",
    ],
    remediationStrategies: [
      "Warn users at least 20 seconds before timeout",
      "Allow users to extend time limits with a simple action",
      "Provide option to disable auto-advancing content",
      "Set generous default time limits",
    ],
  },
  {
    criterionId: "2.2.2",
    criterionNumber: "2.2.2",
    title: "Pause, Stop, Hide",
    principle: "Operable",
    level: "A",
    description:
      "For moving, blinking, scrolling, or auto-updating information, there is a mechanism for the user to pause, stop, or hide it.",
    explanation:
      "Animated content, auto-scrolling feeds, and blinking elements can be distracting or cause seizures. Users must be able to pause or stop such content, especially if it starts automatically and lasts more than 5 seconds.",
    implementationExamples: {
      good: `<!-- Carousel with pause control -->
<div role="region" aria-label="Featured stories carousel">
  <button onclick="pauseCarousel()" aria-label="Pause carousel">
    Pause
  </button>
  <!-- carousel slides -->
</div>

<!-- Respects reduced motion preference -->
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}`,
      bad: `<!-- Auto-scrolling ticker with no stop control -->
<div class="ticker" style="animation: scroll 10s linear infinite;">
  Breaking news content scrolling endlessly...
</div>`,
    },
    commonViolations: [
      "Auto-playing carousels without pause buttons",
      "Scrolling news tickers that cannot be stopped",
      "Animated backgrounds with no way to disable them",
      "Auto-refreshing content that interrupts reading",
    ],
    remediationStrategies: [
      "Add pause/stop controls for all auto-animating content",
      "Respect prefers-reduced-motion media query",
      "Provide user preference to disable animations",
      "Stop auto-updating when user is interacting with content",
    ],
  },
  {
    criterionId: "2.3.1",
    criterionNumber: "2.3.1",
    title: "Three Flashes or Below Threshold",
    principle: "Operable",
    level: "A",
    description:
      "Web pages do not contain anything that flashes more than three times in any one second period.",
    explanation:
      "Rapidly flashing content can trigger seizures in people with photosensitive epilepsy. Content must not flash more than 3 times per second unless the flash is small enough and low enough in contrast to be below the general flash threshold.",
    implementationExamples: {
      good: `/* Gentle, slow animation */
.pulse {
  animation: gentle-pulse 3s ease-in-out infinite;
}
@keyframes gentle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}`,
      bad: `/* Rapid flashing animation */
.flash {
  animation: flash 0.2s infinite;
}
@keyframes flash {
  0%, 100% { background: white; }
  50% { background: red; }
}`,
    },
    commonViolations: [
      "Rapidly strobing or flashing animations",
      "Video content with flash effects not preceded by a warning",
      "Blinking text or elements that flash rapidly",
    ],
    remediationStrategies: [
      "Avoid content that flashes more than 3 times per second",
      "Use the Photosensitive Epilepsy Analysis Tool (PEAT) to test",
      "Add seizure warnings before potentially problematic video content",
      "Respect prefers-reduced-motion settings",
    ],
  },
  {
    criterionId: "2.4.1",
    criterionNumber: "2.4.1",
    title: "Bypass Blocks",
    principle: "Operable",
    level: "A",
    description:
      "A mechanism is available to bypass blocks of content that are repeated on multiple web pages.",
    explanation:
      "Screen reader and keyboard users need a way to skip repetitive navigation and jump straight to the main content. Skip links and proper landmark regions provide this capability.",
    implementationExamples: {
      good: `<!-- Skip navigation link -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2">
  Skip to main content
</a>

<nav aria-label="Main navigation">...</nav>

<main id="main-content">
  <!-- Page content -->
</main>`,
      bad: `<!-- No skip link and no landmarks -->
<div class="nav">...</div>
<div class="content">...</div>`,
    },
    commonViolations: [
      "No skip navigation link on the page",
      "Skip link that is present but does not work",
      "No landmark regions (main, nav, footer)",
      "Skip link target is missing or incorrect",
    ],
    remediationStrategies: [
      "Add a skip-to-content link as the first focusable element",
      "Use HTML5 landmark elements (main, nav, aside, footer)",
      "Ensure the skip link target has the matching id",
      "Make the skip link visible on focus for sighted keyboard users",
    ],
  },
  {
    criterionId: "2.4.2",
    criterionNumber: "2.4.2",
    title: "Page Titled",
    principle: "Operable",
    level: "A",
    description:
      "Web pages have titles that describe topic or purpose.",
    explanation:
      "Each page should have a unique, descriptive title in the <title> element. This helps users identify the page in browser tabs, bookmarks, and screen reader navigation. Titles should be specific and concise.",
    implementationExamples: {
      good: `<!-- Descriptive page title -->
<head>
  <title>Shopping Cart - 3 Items | My Store</title>
</head>

<!-- In Next.js App Router -->
export const metadata = {
  title: "WCAG 2.2 Card Deck - AWAE",
};`,
      bad: `<!-- Generic or missing title -->
<head>
  <title>Page</title>
</head>

<!-- Same title on every page -->
<head>
  <title>My Website</title>
</head>`,
    },
    commonViolations: [
      "Generic titles like 'Home' or 'Page' without context",
      "Same title used on every page of the site",
      "Missing title element entirely",
      "Title that does not describe the page content",
    ],
    remediationStrategies: [
      "Give each page a unique, descriptive title",
      "Follow a consistent pattern: 'Page Name - Site Name'",
      "Include relevant context in the title",
      "Update titles dynamically for single-page applications",
    ],
  },
  {
    criterionId: "2.4.3",
    criterionNumber: "2.4.3",
    title: "Focus Order",
    principle: "Operable",
    level: "A",
    description:
      "If a web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.",
    explanation:
      "The tab order must follow a logical, predictable sequence that matches the visual layout. This means interactive elements should receive focus in the order users expect when pressing Tab.",
    implementationExamples: {
      good: `<!-- Natural focus order matches visual layout -->
<form>
  <label for="first">First Name</label>
  <input id="first" />
  <label for="last">Last Name</label>
  <input id="last" />
  <button type="submit">Submit</button>
</form>`,
      bad: `<!-- Positive tabindex disrupts natural order -->
<input tabindex="3" />
<input tabindex="1" />
<input tabindex="2" />

<!-- CSS visually reorders but DOM order is different -->
<div style="display: flex; flex-direction: row-reverse;">
  <button>First visually but last in DOM</button>
  <button>Last visually but first in DOM</button>
</div>`,
    },
    commonViolations: [
      "Positive tabindex values that disrupt natural focus order",
      "CSS layout that visually reorders content differently from DOM",
      "Modal focus not managed when opened or closed",
      "Dynamic content inserted in unexpected tab order position",
    ],
    remediationStrategies: [
      "Use tabindex='0' instead of positive values",
      "Match DOM order to visual order",
      "Manage focus when opening/closing modals and dialogs",
      "Place dynamically added content in logical DOM positions",
    ],
  },
  {
    criterionId: "2.4.4",
    criterionNumber: "2.4.4",
    title: "Link Purpose (In Context)",
    principle: "Operable",
    level: "A",
    description:
      "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context.",
    explanation:
      "Link text should clearly describe where the link goes. Avoid vague text like 'click here' or 'read more' without context. Screen reader users often navigate by listing all links, so each link must make sense on its own or with its surrounding context.",
    implementationExamples: {
      good: `<!-- Descriptive link text -->
<a href="/report">View your accessibility report</a>

<!-- Link with context from heading -->
<h3>Web Accessibility</h3>
<p>Learn the fundamentals. <a href="/guide">Read the complete guide</a></p>

<!-- Visually hidden text for screen readers -->
<a href="/report">
  Read more <span class="sr-only">about WCAG 2.2 compliance</span>
</a>`,
      bad: `<!-- Vague link text -->
<a href="/report">Click here</a>
<a href="/guide">Read more</a>
<a href="/docs">Link</a>`,
    },
    commonViolations: [
      "Links with text 'click here', 'read more', or 'learn more' without context",
      "Multiple links with the same text going to different destinations",
      "Links with no text content (empty links)",
      "Image links without alt text",
    ],
    remediationStrategies: [
      "Write descriptive link text that explains the destination",
      "Add visually hidden text for context when short link text is necessary",
      "Ensure image links have meaningful alt text",
      "Use aria-label for links where visible text is insufficient",
    ],
  },
  {
    criterionId: "2.4.5",
    criterionNumber: "2.4.5",
    title: "Multiple Ways",
    principle: "Operable",
    level: "AA",
    description:
      "More than one way is available to locate a web page within a set of web pages.",
    explanation:
      "Provide multiple methods for users to find content, such as a navigation menu, search function, sitemap, or breadcrumbs. Different users prefer different ways to navigate.",
    implementationExamples: {
      good: `<!-- Multiple navigation methods -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/docs">Documentation</a></li>
    <li aria-current="page">Getting Started</li>
  </ol>
</nav>
<form role="search" aria-label="Site search">
  <input type="search" aria-label="Search" />
</form>
<a href="/sitemap">Sitemap</a>`,
      bad: `<!-- Only one way to navigate -->
<nav>
  <a href="/page1">Page 1</a>
  <a href="/page2">Page 2</a>
</nav>
<!-- No search, no sitemap, no breadcrumbs -->`,
    },
    commonViolations: [
      "Only a single navigation menu with no search or sitemap",
      "No breadcrumb trail on content-heavy sites",
      "Search function missing on large sites",
    ],
    remediationStrategies: [
      "Implement a site search feature",
      "Add breadcrumb navigation for hierarchical content",
      "Provide a sitemap page",
      "Include related links or table of contents",
    ],
  },
  {
    criterionId: "2.4.6",
    criterionNumber: "2.4.6",
    title: "Headings and Labels",
    principle: "Operable",
    level: "AA",
    description:
      "Headings and labels describe topic or purpose.",
    explanation:
      "Headings and form labels must clearly describe the content they introduce. Descriptive headings help users scan the page and find content quickly. Labels must clearly identify what input is expected.",
    implementationExamples: {
      good: `<!-- Descriptive headings -->
<h1>Accessibility Evaluation Results</h1>
<h2>Critical Violations (3 found)</h2>
<h2>Recommendations for Improvement</h2>

<!-- Descriptive labels -->
<label for="url">Website URL to evaluate</label>
<input type="url" id="url" />`,
      bad: `<!-- Vague headings -->
<h1>Results</h1>
<h2>Section 1</h2>
<h2>More Info</h2>

<!-- Unclear labels -->
<label for="input1">Input</label>
<input id="input1" />`,
    },
    commonViolations: [
      "Generic headings like 'Section 1' or 'Details'",
      "Form labels that do not describe the expected input",
      "Headings used for styling rather than structure",
    ],
    remediationStrategies: [
      "Write headings that summarize the section content",
      "Use descriptive labels that explain what information is needed",
      "Ensure headings form a logical outline of the page",
    ],
  },
  {
    criterionId: "2.4.7",
    criterionNumber: "2.4.7",
    title: "Focus Visible",
    principle: "Operable",
    level: "AA",
    description:
      "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
    explanation:
      "Keyboard users must always be able to see which element has focus. The browser provides a default focus outline, which should not be removed without providing an equally visible alternative.",
    implementationExamples: {
      good: `/* Clear focus indicator */
:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Custom focus style */
button:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  outline: none;
}`,
      bad: `/* Removing focus outline entirely */
*:focus {
  outline: none;
}

/* No alternative focus indicator */
button:focus {
  outline: 0;
}`,
    },
    commonViolations: [
      "Global CSS rule removing all focus outlines",
      "Focus indicators with insufficient contrast",
      "Custom components without visible focus states",
      "Focus outline removed for aesthetics with no replacement",
    ],
    remediationStrategies: [
      "Never remove focus outlines without providing an alternative",
      "Use :focus-visible for modern, user-friendly focus styles",
      "Ensure focus indicators have at least 3:1 contrast ratio",
      "Test keyboard navigation to verify all elements show focus",
    ],
  },
  {
    criterionId: "2.4.11",
    criterionNumber: "2.4.11",
    title: "Focus Not Obscured (Minimum)",
    principle: "Operable",
    level: "AA",
    description:
      "When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.",
    explanation:
      "Sticky headers, cookie banners, chat widgets, and other fixed-position elements must not completely cover the focused element. At least part of the focused element must remain visible when it receives focus.",
    implementationExamples: {
      good: `/* Sticky header with scroll padding */
html {
  scroll-padding-top: 80px; /* Height of sticky header */
}

/* Ensure focused elements scroll into view */
:focus {
  scroll-margin-top: 80px;
  scroll-margin-bottom: 80px;
}`,
      bad: `/* Sticky footer that covers focused elements */
.cookie-banner {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 200px;
  z-index: 9999;
  /* Elements behind this cannot be seen when focused */
}`,
    },
    commonViolations: [
      "Sticky headers that cover focused elements when scrolling",
      "Cookie consent banners covering page content",
      "Chat widgets overlapping interactive elements",
      "Fixed-position toolbars obscuring focus",
    ],
    remediationStrategies: [
      "Use scroll-padding and scroll-margin to account for fixed elements",
      "Ensure sticky elements do not fully obscure focused content",
      "Consider dismissible overlays that do not permanently block content",
      "Test keyboard navigation through all page areas",
    ],
  },
  {
    criterionId: "2.5.1",
    criterionNumber: "2.5.1",
    title: "Pointer Gestures",
    principle: "Operable",
    level: "A",
    description:
      "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture.",
    explanation:
      "Actions that require multi-finger gestures (pinch to zoom) or path-based gestures (swiping) must also have single-pointer alternatives (buttons). Not all users can perform complex gestures.",
    implementationExamples: {
      good: `<!-- Map with zoom buttons AND pinch-to-zoom -->
<div id="map">
  <button aria-label="Zoom in" onclick="zoomIn()">+</button>
  <button aria-label="Zoom out" onclick="zoomOut()">-</button>
</div>

<!-- Carousel with previous/next buttons AND swipe -->
<button aria-label="Previous slide" onclick="prev()">Previous</button>
<button aria-label="Next slide" onclick="next()">Next</button>`,
      bad: `<!-- Map that only supports pinch-to-zoom -->
<div id="map" ongesturechange="handlePinch()"></div>

<!-- Carousel that only works with swipe -->
<div ontouchstart="startSwipe()" ontouchmove="handleSwipe()"></div>`,
    },
    commonViolations: [
      "Maps or images that only support pinch-to-zoom",
      "Carousels that require swiping with no buttons",
      "Drawing tools that require path-based gestures",
    ],
    remediationStrategies: [
      "Provide button controls for zoom, rotate, and navigate actions",
      "Add previous/next buttons alongside swipe gestures",
      "Ensure all gesture-based actions have single-click alternatives",
    ],
  },
  {
    criterionId: "2.5.2",
    criterionNumber: "2.5.2",
    title: "Pointer Cancellation",
    principle: "Operable",
    level: "A",
    description:
      "For functionality that can be operated using a single pointer, at least one of the following is true: no down-event, can abort or undo, up reversal, or essential.",
    explanation:
      "Actions should activate on pointer up (mouseup, touchend), not on pointer down. This gives users the ability to cancel an action by moving the pointer away before releasing. This helps users with motor impairments who may accidentally press targets.",
    implementationExamples: {
      good: `<!-- Action fires on click (which is pointer up) -->
<button onclick="deleteItem()">Delete</button>

<!-- Custom control that fires on pointerup -->
<div role="button" onpointerup="performAction()">
  Custom Action
</div>`,
      bad: `<!-- Action fires on mouse down, cannot be cancelled -->
<div onmousedown="deleteItem()">Delete</div>

<!-- Action fires on touch start -->
<div ontouchstart="navigate()">Go</div>`,
    },
    commonViolations: [
      "Actions triggered on mousedown or touchstart without cancellation",
      "Drag operations that trigger actions on pointer down",
      "Custom buttons that use onmousedown instead of onclick",
    ],
    remediationStrategies: [
      "Use click events instead of mousedown for actions",
      "Fire actions on pointerup/mouseup rather than down events",
      "Allow users to cancel by moving pointer away before release",
      "Provide undo for irreversible actions",
    ],
  },
  {
    criterionId: "2.5.3",
    criterionNumber: "2.5.3",
    title: "Label in Name",
    principle: "Operable",
    level: "A",
    description:
      "For user interface components with labels that include text or images of text, the name contains the text that is presented visually.",
    explanation:
      "The accessible name of an element must contain the visible text label. This ensures that voice control users can activate elements by speaking the visible label. If a button displays 'Search', its accessible name should include 'Search'.",
    implementationExamples: {
      good: `<!-- Accessible name matches visible label -->
<button>Search</button>

<!-- aria-label contains the visible text -->
<button aria-label="Search products">
  <SearchIcon aria-hidden="true" /> Search
</button>`,
      bad: `<!-- Accessible name doesn't match visible text -->
<button aria-label="Find items">Search</button>

<!-- aria-label completely different from visible text -->
<button aria-label="Submit query">
  <SearchIcon aria-hidden="true" /> Search
</button>`,
    },
    commonViolations: [
      "aria-label that does not include the visible button text",
      "Accessible name set differently from the visible label",
      "Image buttons where alt text differs from visible text overlay",
    ],
    remediationStrategies: [
      "Ensure aria-label starts with or includes the visible text",
      "Use aria-labelledby to reference the visible label element",
      "Keep accessible names consistent with visual presentation",
    ],
  },
  {
    criterionId: "2.5.4",
    criterionNumber: "2.5.4",
    title: "Motion Actuation",
    principle: "Operable",
    level: "A",
    description:
      "Functionality that can be operated by device motion or user motion can also be operated by user interface components and responding to the motion can be disabled.",
    explanation:
      "If shaking or tilting the device triggers an action (like undo), there must also be a button or UI control that performs the same action. Motion-based actions must be disableable since some users have tremors or use mounted devices.",
    implementationExamples: {
      good: `<!-- Both motion and button available -->
<button onclick="undo()">Undo</button>
<p class="text-sm text-gray-500">You can also shake your device to undo.</p>

<!-- Setting to disable motion -->
<label>
  <input type="checkbox" onchange="toggleMotion()" />
  Enable shake to undo
</label>`,
      bad: `<!-- Only shake to undo, no button alternative -->
<script>
  window.addEventListener('devicemotion', (e) => {
    if (isShake(e)) undo();
  });
</script>`,
    },
    commonViolations: [
      "Shake-to-undo with no button alternative",
      "Tilt-to-scroll without manual controls",
      "Motion-based interactions that cannot be disabled",
    ],
    remediationStrategies: [
      "Provide UI button alternatives for all motion-based actions",
      "Allow users to disable motion-based interactions in settings",
      "Never make motion the only way to perform an action",
    ],
  },
  {
    criterionId: "2.5.7",
    criterionNumber: "2.5.7",
    title: "Dragging Movements",
    principle: "Operable",
    level: "AA",
    description:
      "All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential.",
    explanation:
      "Drag-and-drop interfaces must provide an alternative that does not require dragging. Users with motor impairments may not be able to perform drag operations. Provide buttons, arrow controls, or other single-click alternatives.",
    implementationExamples: {
      good: `<!-- Sortable list with drag AND button controls -->
<li>
  <span>Item 1</span>
  <button aria-label="Move Item 1 up" onclick="moveUp(0)">Up</button>
  <button aria-label="Move Item 1 down" onclick="moveDown(0)">Down</button>
</li>`,
      bad: `<!-- Sortable list only supports drag -->
<li draggable="true" ondragstart="drag(event)">
  Item 1
</li>`,
    },
    commonViolations: [
      "Sortable lists that only work with drag-and-drop",
      "Kanban boards without keyboard reordering",
      "Sliders that can only be operated by dragging",
    ],
    remediationStrategies: [
      "Add move up/down buttons for sortable items",
      "Provide keyboard-accessible alternatives for drag operations",
      "Use native range inputs instead of custom drag sliders",
    ],
  },
  {
    criterionId: "2.5.8",
    criterionNumber: "2.5.8",
    title: "Target Size (Minimum)",
    principle: "Operable",
    level: "AA",
    description:
      "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when an equivalent link or control with sufficient size is available, the target is inline, the user agent determines the size, or the size is essential.",
    explanation:
      "Interactive targets (buttons, links, form controls) must be large enough to be easily activated, especially by users with motor impairments. The minimum target size is 24x24 CSS pixels, with adequate spacing if smaller.",
    implementationExamples: {
      good: `/* Sufficient target size */
button {
  min-width: 44px;
  min-height: 44px;
  padding: 8px 16px;
}

/* Icon button with adequate size */
.icon-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}`,
      bad: `/* Tiny target */
.small-button {
  width: 16px;
  height: 16px;
  padding: 0;
}

/* Dense icon row with no spacing */
.icon-row a {
  display: inline;
  font-size: 12px;
}`,
    },
    commonViolations: [
      "Small icon buttons under 24x24 pixels",
      "Dense navigation links packed too tightly",
      "Close buttons that are too small to easily tap",
      "Tiny checkbox or radio button controls",
    ],
    remediationStrategies: [
      "Set minimum target size to at least 24x24px (preferably 44x44px)",
      "Add padding to increase the clickable area of small elements",
      "Space out tightly packed interactive elements",
      "Use larger touch targets for mobile interfaces",
    ],
  },
  // ===== Principle 3: Understandable =====
  {
    criterionId: "3.1.1",
    criterionNumber: "3.1.1",
    title: "Language of Page",
    principle: "Understandable",
    level: "A",
    description:
      "The default human language of each web page can be programmatically determined.",
    explanation:
      "The lang attribute on the <html> element tells screen readers which language to use for pronunciation. Without it, screen readers may mispronounce content by using the wrong language rules.",
    implementationExamples: {
      good: `<!-- Correct language declaration -->
<html lang="en">
  <head>...</head>
  <body>...</body>
</html>

<!-- Next.js layout -->
export default function RootLayout({ children }) {
  return <html lang="en">...</html>;
}`,
      bad: `<!-- Missing lang attribute -->
<html>
  <head>...</head>
  <body>...</body>
</html>`,
    },
    commonViolations: [
      "Missing lang attribute on the html element",
      "Incorrect language code (e.g., 'us' instead of 'en')",
      "Lang attribute not matching the actual page language",
    ],
    remediationStrategies: [
      "Add lang attribute to the html element with correct BCP 47 code",
      "Verify the language code matches the content language",
      "Use specific subtags when needed (e.g., 'en-GB' for British English)",
    ],
  },
  {
    criterionId: "3.1.2",
    criterionNumber: "3.1.2",
    title: "Language of Parts",
    principle: "Understandable",
    level: "AA",
    description:
      "The human language of each passage or phrase in the content can be programmatically determined.",
    explanation:
      "When content includes text in a different language from the page default, those sections should have a lang attribute so screen readers can switch pronunciation.",
    implementationExamples: {
      good: `<!-- Language marked on foreign text -->
<p>The French word <span lang="fr">bonjour</span> means hello.</p>

<blockquote lang="de">
  Alle Menschen sind frei und gleich an Wurde und Rechten geboren.
</blockquote>`,
      bad: `<!-- Foreign text without lang attribute -->
<p>The French word bonjour means hello.</p>`,
    },
    commonViolations: [
      "Foreign language phrases without lang attributes",
      "Translated content sections without language identification",
      "Technical terms in other languages not marked up",
    ],
    remediationStrategies: [
      "Add lang attributes to elements containing foreign language text",
      "Use correct BCP 47 language tags",
      "Mark up substantial passages of foreign text at minimum",
    ],
  },
  {
    criterionId: "3.2.1",
    criterionNumber: "3.2.1",
    title: "On Focus",
    principle: "Understandable",
    level: "A",
    description:
      "When any user interface component receives focus, it does not initiate a change of context.",
    explanation:
      "Receiving focus alone should never cause unexpected changes like navigating to a new page, submitting a form, or opening a dialog. Changes of context should only happen in response to explicit user actions like clicking or pressing Enter.",
    implementationExamples: {
      good: `<!-- Focus does not cause navigation -->
<select id="language" onchange="changeLanguage()">
  <option>English</option>
  <option>Spanish</option>
</select>
<button type="button" onclick="applyLanguage()">Apply</button>`,
      bad: `<!-- Tab focus causes page navigation -->
<a href="/other-page" onfocus="window.location=this.href">
  Link that navigates on focus
</a>

<!-- Select navigates on focus -->
<select onfocus="this.onchange=function(){navigate(this.value)}">
  <option value="/page1">Page 1</option>
</select>`,
    },
    commonViolations: [
      "Links or buttons that navigate on focus instead of activation",
      "Form controls that submit on focus",
      "Modals that open when an element receives focus",
    ],
    remediationStrategies: [
      "Use onclick/onchange instead of onfocus for actions",
      "Ensure focus only moves the visual focus indicator",
      "Require explicit user action (click, Enter) for context changes",
    ],
  },
  {
    criterionId: "3.2.2",
    criterionNumber: "3.2.2",
    title: "On Input",
    principle: "Understandable",
    level: "A",
    description:
      "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.",
    explanation:
      "Changing a form value should not automatically trigger unexpected actions like form submission or page navigation. If such behavior is needed, the user must be warned in advance.",
    implementationExamples: {
      good: `<!-- Select with explicit submit button -->
<label for="sort">Sort by:</label>
<select id="sort">
  <option>Date</option>
  <option>Name</option>
</select>
<button type="submit">Apply Sort</button>

<!-- Or, clearly warn about auto-behavior -->
<label for="lang">Language (page will reload):</label>
<select id="lang" onchange="changeLang()">
  <option>English</option>
  <option>Spanish</option>
</select>`,
      bad: `<!-- Select auto-navigates without warning -->
<select onchange="window.location=this.value">
  <option value="/en">English</option>
  <option value="/es">Spanish</option>
</select>`,
    },
    commonViolations: [
      "Dropdown menus that navigate without a submit button",
      "Radio buttons that auto-submit forms",
      "Checkbox that triggers immediate page change",
    ],
    remediationStrategies: [
      "Add a submit/apply button for form controls that change context",
      "Provide advance notice if auto-submission is used",
      "Use ARIA live regions to announce dynamic changes",
    ],
  },
  {
    criterionId: "3.2.3",
    criterionNumber: "3.2.3",
    title: "Consistent Navigation",
    principle: "Understandable",
    level: "AA",
    description:
      "Navigational mechanisms that are repeated on multiple web pages within a set of web pages occur in the same relative order each time they are repeated.",
    explanation:
      "Navigation menus and other repeated elements should appear in the same order across pages. This predictability helps users learn the site structure and navigate efficiently.",
    implementationExamples: {
      good: `<!-- Same nav order on every page -->
<nav>
  <a href="/">Home</a>
  <a href="/evaluate">Evaluate</a>
  <a href="/wcag-cards">WCAG Cards</a>
  <a href="/settings">Settings</a>
</nav>`,
      bad: `<!-- Nav order changes between pages -->
<!-- Page 1: Home, Evaluate, Cards, Settings -->
<!-- Page 2: Home, Settings, Cards, Evaluate -->`,
    },
    commonViolations: [
      "Navigation menu order changes between pages",
      "Footer links rearranged on different pages",
      "Sidebar navigation inconsistent across sections",
    ],
    remediationStrategies: [
      "Use shared navigation components across all pages",
      "Maintain consistent ordering of navigation items",
      "Add new items at consistent positions (e.g., always at the end)",
    ],
  },
  {
    criterionId: "3.2.4",
    criterionNumber: "3.2.4",
    title: "Consistent Identification",
    principle: "Understandable",
    level: "AA",
    description:
      "Components that have the same functionality within a set of web pages are identified consistently.",
    explanation:
      "The same functionality should have the same label and icon everywhere. If a search function is labeled 'Search' on one page, it should not be labeled 'Find' on another. Consistency reduces cognitive load.",
    implementationExamples: {
      good: `<!-- Consistent search across pages -->
<!-- Every page uses the same label -->
<label for="search">Search</label>
<input type="search" id="search" />

<!-- Consistent icon + label for action -->
<button><PrintIcon /> Print Report</button>`,
      bad: `<!-- Inconsistent naming -->
<!-- Page 1: -->
<button>Search</button>
<!-- Page 2: -->
<button>Find</button>
<!-- Page 3: -->
<button>Look up</button>`,
    },
    commonViolations: [
      "Search function labeled differently across pages",
      "Print button using different text or icons on different pages",
      "Same action with different accessible names",
    ],
    remediationStrategies: [
      "Create a design system with consistent component names",
      "Use shared components for repeated functionality",
      "Document naming conventions in a style guide",
    ],
  },
  {
    criterionId: "3.2.6",
    criterionNumber: "3.2.6",
    title: "Consistent Help",
    principle: "Understandable",
    level: "A",
    description:
      "If a web page contains help mechanisms (contact info, self-help options, human contact), they are placed in the same relative order on each page.",
    explanation:
      "Help mechanisms like contact links, FAQ links, or chatbot widgets should be in a consistent location across the site. This new WCAG 2.2 criterion ensures users can reliably find help.",
    implementationExamples: {
      good: `<!-- Help always in footer in same order across pages -->
<footer>
  <a href="/faq">FAQ</a>
  <a href="/contact">Contact Us</a>
  <a href="/chat">Live Chat</a>
</footer>`,
      bad: `<!-- Help link in different positions on different pages -->
<!-- Page 1: FAQ in header -->
<!-- Page 2: FAQ in footer -->
<!-- Page 3: No FAQ link -->`,
    },
    commonViolations: [
      "Help link present on some pages but not others",
      "Help mechanisms in different positions across pages",
      "Contact information that moves around the layout",
    ],
    remediationStrategies: [
      "Place help mechanisms in a consistent location (e.g., footer or header)",
      "Use a shared layout component for help links",
      "Maintain the same order of help options across all pages",
    ],
  },
  {
    criterionId: "3.3.1",
    criterionNumber: "3.3.1",
    title: "Error Identification",
    principle: "Understandable",
    level: "A",
    description:
      "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
    explanation:
      "When a form validation error occurs, the specific field in error must be identified and a text description of the error must be provided. Do not rely solely on color or icons to indicate errors.",
    implementationExamples: {
      good: `<!-- Error message identifies the field and describes the error -->
<label for="email">Email address</label>
<input
  type="email"
  id="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" class="text-red-600" role="alert">
  Please enter a valid email address (e.g., name@example.com).
</p>`,
      bad: `<!-- Error indicated only by red border -->
<input type="email" style="border-color: red;" />

<!-- Generic error message -->
<p class="error">There was an error.</p>`,
    },
    commonViolations: [
      "Error indicated only by color change on the input",
      "Generic error messages that do not identify the field",
      "Error messages that do not describe what is wrong",
      "Errors not programmatically associated with the input",
    ],
    remediationStrategies: [
      "Use aria-invalid='true' on fields with errors",
      "Connect error messages with aria-describedby",
      "Write specific error text explaining what is wrong and how to fix it",
      "Use role='alert' for error messages that appear dynamically",
    ],
  },
  {
    criterionId: "3.3.2",
    criterionNumber: "3.3.2",
    title: "Labels or Instructions",
    principle: "Understandable",
    level: "A",
    description:
      "Labels or instructions are provided when content requires user input.",
    explanation:
      "Every form input should have a visible label and, when needed, additional instructions about the expected format or constraints. Placeholder text alone is not a sufficient label.",
    implementationExamples: {
      good: `<!-- Input with label and format instructions -->
<label for="dob">Date of Birth</label>
<input type="text" id="dob" aria-describedby="dob-hint" />
<p id="dob-hint" class="text-sm text-gray-500">Format: DD/MM/YYYY</p>

<!-- Required field with indication -->
<label for="name">
  Full Name <span aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>
<input type="text" id="name" required />`,
      bad: `<!-- Input with only placeholder -->
<input type="text" placeholder="Enter your name" />

<!-- No format hint for ambiguous input -->
<label for="date">Date</label>
<input type="text" id="date" />`,
    },
    commonViolations: [
      "Inputs with placeholder text but no visible label",
      "Missing format instructions for date, phone, or other specific formats",
      "Required fields not indicated to the user",
      "Complex forms without instructions or help text",
    ],
    remediationStrategies: [
      "Add visible labels to all form inputs",
      "Provide format hints using aria-describedby",
      "Indicate required fields with text (not just an asterisk)",
      "Include form-level instructions before complex forms",
    ],
  },
  {
    criterionId: "3.3.3",
    criterionNumber: "3.3.3",
    title: "Error Suggestion",
    principle: "Understandable",
    level: "AA",
    description:
      "If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user.",
    explanation:
      "When a field has an error and the system knows what the correct format or value should be, it should suggest the correction. This helps all users fix errors quickly.",
    implementationExamples: {
      good: `<!-- Error with suggestion -->
<input type="email" aria-invalid="true" aria-describedby="email-err" value="john@" />
<p id="email-err" role="alert">
  Email address is incomplete. Did you mean john@example.com?
</p>

<!-- Date error with format suggestion -->
<input type="text" aria-invalid="true" aria-describedby="date-err" value="2024-13-01" />
<p id="date-err" role="alert">
  Invalid month. Please enter a date in DD/MM/YYYY format (e.g., 01/12/2024).
</p>`,
      bad: `<!-- Error without helpful suggestion -->
<input type="email" aria-invalid="true" />
<p>Invalid email.</p>

<!-- Generic error -->
<p>Please fix the errors above.</p>`,
    },
    commonViolations: [
      "Error messages that say 'invalid input' without explaining what is expected",
      "Missing suggestions when the system knows the correct format",
      "Error messages that do not explain how to fix the issue",
    ],
    remediationStrategies: [
      "Include the expected format in error messages",
      "Provide specific suggestions when possible",
      "Show examples of valid input alongside error messages",
      "Use inline validation to give immediate feedback",
    ],
  },
  {
    criterionId: "3.3.4",
    criterionNumber: "3.3.4",
    title: "Error Prevention (Legal, Financial, Data)",
    principle: "Understandable",
    level: "AA",
    description:
      "For web pages that cause legal commitments or financial transactions for the user, that modify or delete user-controllable data, or that submit test responses, submissions are reversible, checked, or confirmed.",
    explanation:
      "Important actions must be reversible, include confirmation steps, or allow review before final submission. This prevents costly mistakes from accidental submissions.",
    implementationExamples: {
      good: `<!-- Confirmation dialog before delete -->
<button onclick="showConfirmDialog()">Delete Account</button>

<dialog>
  <h2>Confirm Account Deletion</h2>
  <p>This will permanently delete your account and all data.</p>
  <button onclick="confirmDelete()">Yes, Delete</button>
  <button onclick="cancelDelete()">Cancel</button>
</dialog>

<!-- Review step before purchase -->
<h2>Review Your Order</h2>
<p>Total: $49.99</p>
<button onclick="goBack()">Edit Order</button>
<button onclick="submitOrder()">Confirm Purchase</button>`,
      bad: `<!-- Immediate deletion without confirmation -->
<button onclick="deleteAccount()">Delete Account</button>

<!-- No review step before payment -->
<button onclick="chargeCard()">Pay Now</button>`,
    },
    commonViolations: [
      "Destructive actions without confirmation dialogs",
      "Financial transactions without review steps",
      "No undo option for data modifications",
      "Test submissions that cannot be reviewed or changed",
    ],
    remediationStrategies: [
      "Add confirmation dialogs for destructive actions",
      "Provide review pages before final submission",
      "Allow users to undo recent actions within a time window",
      "Enable editing of submitted data within a reasonable period",
    ],
  },
  {
    criterionId: "3.3.7",
    criterionNumber: "3.3.7",
    title: "Redundant Entry",
    principle: "Understandable",
    level: "A",
    description:
      "Information previously entered by or provided to the user that is required to be entered again in the same process is either auto-populated or available for the user to select.",
    explanation:
      "Users should not have to re-enter the same information within a multi-step process. If they entered their address on step 1, it should be pre-filled or selectable on step 3 if needed again. This new WCAG 2.2 criterion reduces cognitive burden and errors.",
    implementationExamples: {
      good: `<!-- Shipping address pre-fills billing -->
<label>
  <input type="checkbox" onchange="copyAddress()" />
  Billing address same as shipping
</label>

<!-- Previously entered data auto-populated -->
<label for="confirm-email">Confirm Email</label>
<input type="email" id="confirm-email" value="user@example.com" />`,
      bad: `<!-- User must retype the same address -->
<h2>Step 1: Shipping Address</h2>
<input name="ship-address" />

<h2>Step 2: Billing Address</h2>
<input name="bill-address" /> <!-- Must type again -->`,
    },
    commonViolations: [
      "Multi-step forms requiring re-entry of previously provided data",
      "No option to copy shipping address to billing",
      "Confirmation fields that do not auto-populate",
    ],
    remediationStrategies: [
      "Auto-populate fields with previously entered data",
      "Provide checkboxes to copy data between form sections",
      "Store and recall data within multi-step processes",
    ],
  },
  {
    criterionId: "3.3.8",
    criterionNumber: "3.3.8",
    title: "Accessible Authentication (Minimum)",
    principle: "Understandable",
    level: "AA",
    description:
      "A cognitive function test is not required for any step in an authentication process unless an alternative or mechanism is available.",
    explanation:
      "Authentication should not require users to memorize passwords, solve puzzles, or perform cognitive tests as the only option. Provide alternatives like password managers support, passkeys, email links, or biometric authentication.",
    implementationExamples: {
      good: `<!-- Login supports paste for password managers -->
<label for="password">Password</label>
<input type="password" id="password" autocomplete="current-password" />
<!-- Do NOT block paste -->

<!-- Alternative: magic link login -->
<label for="email">Email</label>
<input type="email" id="email" autocomplete="email" />
<button>Send login link</button>`,
      bad: `<!-- Blocks paste, preventing password managers -->
<input type="password" onpaste="return false" />

<!-- CAPTCHA as only authentication step -->
<div class="captcha">Type the characters you see...</div>`,
    },
    commonViolations: [
      "Password fields that block paste functionality",
      "CAPTCHAs without accessible alternatives",
      "Custom PIN entry that prevents autofill",
      "Security questions as the only recovery method",
    ],
    remediationStrategies: [
      "Allow paste in password fields for password manager support",
      "Support autocomplete='current-password' for autofill",
      "Provide alternative authentication methods (email links, SSO, biometrics)",
      "Use accessible CAPTCHA alternatives or eliminate CAPTCHAs",
    ],
  },
  // ===== Principle 4: Robust =====
  {
    criterionId: "4.1.2",
    criterionNumber: "4.1.2",
    title: "Name, Role, Value",
    principle: "Robust",
    level: "A",
    description:
      "For all user interface components, the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.",
    explanation:
      "Custom interactive components must expose their name, role, and state to assistive technologies using ARIA attributes. Native HTML elements do this automatically, but custom widgets need explicit ARIA markup.",
    implementationExamples: {
      good: `<!-- Custom toggle with proper ARIA -->
<button
  role="switch"
  aria-checked="true"
  aria-label="Dark mode"
  onclick="toggle()"
>
  <span aria-hidden="true">On</span>
</button>

<!-- Custom tab interface -->
<div role="tablist" aria-label="Settings tabs">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
    General
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">
    Privacy
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">...</div>`,
      bad: `<!-- Custom toggle without ARIA -->
<div class="toggle" onclick="toggle()">
  <div class="toggle-switch"></div>
</div>

<!-- Custom tabs without roles -->
<div class="tabs">
  <span class="tab active" onclick="showTab(1)">General</span>
  <span class="tab" onclick="showTab(2)">Privacy</span>
</div>`,
    },
    commonViolations: [
      "Custom components without ARIA roles",
      "Missing aria-label or aria-labelledby on interactive elements",
      "Toggle buttons without aria-checked or aria-pressed",
      "Dynamic state changes not reflected in ARIA attributes",
    ],
    remediationStrategies: [
      "Use native HTML elements whenever possible",
      "Add appropriate ARIA roles to custom components",
      "Keep ARIA states updated when component state changes",
      "Test with screen readers to verify announcements",
    ],
  },
  {
    criterionId: "4.1.3",
    criterionNumber: "4.1.3",
    title: "Status Messages",
    principle: "Robust",
    level: "AA",
    description:
      "In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.",
    explanation:
      "Status messages (success alerts, error counts, loading indicators, search results counts) must be announced by screen readers without moving focus. Use ARIA live regions (role='status', role='alert', aria-live) to achieve this.",
    implementationExamples: {
      good: `<!-- Status message announced without focus change -->
<div role="status" aria-live="polite">
  3 search results found.
</div>

<!-- Error alert announced immediately -->
<div role="alert">
  Form submission failed. Please check the errors above.
</div>

<!-- Loading state -->
<div role="status" aria-live="polite">
  <span class="sr-only">Loading results...</span>
  <Spinner aria-hidden="true" />
</div>`,
      bad: `<!-- Status update not announced -->
<div class="results-count">3 results found</div>

<!-- Toast notification not in live region -->
<div class="toast">Saved successfully!</div>`,
    },
    commonViolations: [
      "Search result counts not in a live region",
      "Toast notifications not announced to screen readers",
      "Form submission success not communicated to assistive tech",
      "Loading/progress states not announced",
    ],
    remediationStrategies: [
      "Use role='status' for non-urgent status updates",
      "Use role='alert' for important, time-sensitive messages",
      "Add aria-live='polite' for informational updates",
      "Test with screen readers to verify announcements",
    ],
  },
];

export const wcagCardsByPrinciple = wcagCards.reduce(
  (acc, card) => {
    if (!acc[card.principle]) acc[card.principle] = [];
    acc[card.principle].push(card);
    return acc;
  },
  {} as Record<string, WcagCard[]>
);

export const wcagCardsByLevel = wcagCards.reduce(
  (acc, card) => {
    if (!acc[card.level]) acc[card.level] = [];
    acc[card.level].push(card);
    return acc;
  },
  {} as Record<string, WcagCard[]>
);

export function getWcagCardByCriterion(
  criterion: string
): WcagCard | undefined {
  return wcagCards.find(
    (card) =>
      card.criterionNumber === criterion || card.criterionId === criterion
  );
}

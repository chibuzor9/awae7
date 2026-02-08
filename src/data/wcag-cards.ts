import type { WcagCard } from '@/types'

export const wcagCards: WcagCard[] = [
	{
		criterionId: '1.1.1',
		criterionNumber: '1.1.1',
		title: 'Non-text content',
		principle: 'Perceivable',
		level: 'A',
		description: `All images and other non-text content (like icons, charts, audio, CAPTCHAs, or controls) must have a descriptive text alternative that conveys their meaning. Purely decorative content can be hidden from assistive technologies (e.g. using an empty **_alt_** attribute).`,
		url: 'https://a11y.fans/111-en/',
		explanation: `All non-text content needs text alternatives so screen readers and assistive technologies can convey their meaning. This includes images, icons, charts, form controls, and audio CAPTCHAs. Decorative images should be marked so they're ignored by assistive technology.`,
		implementationExamples: {
			good: `<!-- Informative image with descriptive alt text -->
<img src="chart.png" alt="Bar chart showing 40% increase in sales from Q1 to Q2 2024" />

<!-- Decorative image properly hidden -->
<img src="decorative-border.png" alt="" role="presentation" />

<!-- Icon button with accessible name -->
<button aria-label="Search">
  <svg aria-hidden="true"><path d="..."/></svg>
</button>

<!-- Complex image with detailed description -->
<figure>
  <img src="process-diagram.png" alt="Product development workflow" />
  <figcaption>
    The diagram shows 5 stages: Research, Design, Development, Testing, and Launch.
  </figcaption>
</figure>`,
			bad: `<!-- Missing alt attribute -->
<img src="important-chart.png" />

<!-- Non-descriptive alt text -->
<img src="sales-data.png" alt="image" />

<!-- Icon button without accessible name -->
<button><svg><path d="..."/></svg></button>

<!-- Decorative image not hidden -->
<img src="decorative-border.png" alt="decorative border" />`,
		},
		commonViolations: [
			'Images missing alt attributes entirely',
			"Generic alt text like 'image', 'photo', or 'icon'",
			"Decorative images not marked with empty alt or role='presentation'",
			'Complex charts or infographics without detailed text descriptions',
			'CAPTCHAs without audio or text alternatives',
			'Icon buttons without aria-label or visible text',
		],
		remediationStrategies: [
			'Add descriptive alt text to all informative images',
			"Use empty alt='' for purely decorative images",
			'Provide detailed descriptions for complex images using aria-describedby or figcaption',
			'Ensure all icon buttons have aria-label or visually hidden text',
			'Use SVG title elements or aria-label for inline SVG graphics',
			'Test with a screen reader to verify alt text quality',
		],
	},
	{
		criterionId: '1.2.1',
		criterionNumber: '1.2.1',
		title: 'Audio-only and video-only (prerecorded)',
		principle: 'Perceivable',
		level: 'A',
		description: `Prerecorded audio-only content must have a text transcript.
Prerecorded video-only content must have a text or audio description.`,
		url: 'https://a11y.fans/121-en/',
	},
	{
		criterionId: '1.2.2',
		criterionNumber: '1.2.2',
		title: 'Captions (prerecorded)',
		principle: 'Perceivable',
		level: 'A',
		description: `Prerecorded videos with audio must have synchronized captions that include
* all speech
* relevant sound effects (like music, alarms, or laughter).`,
		url: 'https://a11y.fans/122-en/',
	},
	{
		criterionId: '1.2.3',
		criterionNumber: '1.2.3',
		title: 'Audio description or media alternative (prerecorded)',
		principle: 'Perceivable',
		level: 'A',
		description: `Important visual content in prerecorded videos must be described using
* an audio description or
* a text-based alternative.`,
		url: 'https://a11y.fans/123-en/',
	},
	{
		criterionId: '1.2.4',
		criterionNumber: '1.2.4',
		title: 'Captions (live)',
		principle: 'Perceivable',
		level: 'AA',
		description: `Live video with audio must include real-time captions that cover
* speech and
* important sound effects (like music, alarms, or laughter).`,
		url: 'https://a11y.fans/124-en/',
	},
	{
		criterionId: '1.2.5',
		criterionNumber: '1.2.5',
		title: 'Audio description (prerecorded)',
		principle: 'Perceivable',
		level: 'AA',
		description: `Important visual content in prerecorded videos with audio must be described using
* an audio description,
unless it is already explained in the main audio track.`,
		url: 'https://a11y.fans/125-en/',
	},
	{
		criterionId: '1.2.6',
		criterionNumber: '1.2.6',
		title: 'Sign language (prerecorded)',
		principle: 'Perceivable',
        level: 'AAA',
		description: `All prerecorded videos with audio must include a sign language interpretation.`,
		url: 'https://a11y.fans/126-en/',
	},
	{
		criterionId: '1.2.7',
		criterionNumber: '1.2.7',
		title: 'Extended audio description (prerecorded)',
		principle: 'Perceivable',
        level: 'AAA',
		description: `Prerecorded videos must include extended audio descriptions if important visual content like
* important visual details,
* on-screen text not spoken aloud, or
* scenes without natural audio breaks
can't be described during normal playback.`,
		url: 'https://a11y.fans/127-en/',
	},
	{
		criterionId: '1.2.8',
		criterionNumber: '1.2.8',
		title: 'Media alternative (prerecorded)',
		principle: 'Perceivable',
        level: 'AAA',
		description: `Prerecorded videos must have a full text alternative that includes:
* all speech,
* relevant sound effects (like music, alarms, or laughter), and
* important visual content,
even if captions and audio descriptions are already available.`,
		url: 'https://a11y.fans/128-en/',
	},
	{
		criterionId: '1.2.9',
		criterionNumber: '1.2.9',
		title: 'Audio-only (live)',
		principle: 'Perceivable',
        level: 'AAA',
		description: `Live audio-only content must include a real-time text alternative, such as
* captions, or
* live transcripts.`,
		url: 'https://a11y.fans/129-en/',
	},
	{
		criterionId: '1.3.1',
		criterionNumber: '1.3.1',
		title: 'Info and relationships',
		principle: 'Perceivable',
		level: 'A',
		description: `Visual information and relationships (like labels, headings, or groupings) must also be conveyed in the code using:
* semantic HTML (e.g. **_<label for="">_**, **_<ul>_**, **_<h1>_**), or
* ARIA attributes (e.g. **_aria-describedby_**, **_role="group"_**),
so that assistive technologies can understand the structure.`,
		url: 'https://a11y.fans/131-en/',
	},
	{
		criterionId: '1.3.2',
		criterionNumber: '1.3.2',
		title: 'Meaningful sequence',
		principle: 'Perceivable',
		level: 'A',
		description: `Content must follow a logical and meaningful order in the code so it can be understood correctly by assistive technologies even if the visual layout differs.`,
		url: 'https://a11y.fans/132-en/',
	},
	{
		criterionId: '1.3.3',
		criterionNumber: '1.3.3',
		title: 'Sensory characteristics',
		principle: 'Perceivable',
		level: 'A',
		description: `Instructions and descriptions must not rely on sensory features alone, like color, shape, size, visual location, or sound.
Always provide additional text to clarify meaning.`,
		url: 'https://a11y.fans/133-en/',
	},
	{
		criterionId: '1.3.4',
		criterionNumber: '1.3.4',
		title: 'Orientation',
		principle: 'Perceivable',
		level: 'AA',
		description: `Content must remain readable and usable in both portrait and landscape orientation, unless a specific one is essential (e.g. in a piano app that requires landscape to show the full keyboard).`,
		url: 'https://a11y.fans/134-en/',
	},
	{
		criterionId: '1.3.5',
		criterionNumber: '1.3.5',
		title: 'Identify input purpose',
		principle: 'Perceivable',
		level: 'AA',
		description: `The purpose of common form fields (like name, email, or address) must be defined in the code so that browsers and assistive technologies can offer input support, such as autocomplete.`,
		url: 'https://a11y.fans/135-en/',
	},
	{
		criterionId: '1.3.6',
		criterionNumber: '1.3.6',
		title: 'Identify purpose',
		principle: 'Perceivable',
        level: 'AAA',
		description: `The purpose of regions and common elements must be defined in the code using semantic HTML or ARIA attributes, so that
* assistive technologies can communicate their meaning, and
* browsers can adapt or simplify the interface (e.g. hide non-essential content).`,
		url: 'https://a11y.fans/136-en/',
	},
	{
		criterionId: '1.4.1',
		criterionNumber: '1.4.1',
		title: 'Use of color',
		principle: 'Perceivable',
		level: 'A',
		description: `Color must not be the only way to convey information.
Always provide an additional visual cue, like icon, text label, underline, shape, or pattern (e.g. striped, solid).`,
		url: 'https://a11y.fans/141-en/',
	},
	{
		criterionId: '1.4.2',
		criterionNumber: '1.4.2',
		title: 'Audio control',
		principle: 'Perceivable',
		level: 'A',
		description: `If audio plays automatically for more than 3 seconds, it must be possible to
* pause the audio,
* stop the audio, or
* adjust the volume,
without using system-wide controls.`,
		url: 'https://a11y.fans/142-en/',
	},
	{
		criterionId: '1.4.3',
		criterionNumber: '1.4.3',
		title: 'Contrast (minimum)',
		principle: 'Perceivable',
		level: 'AA',
		description: `Text contrast against its background must be at least
* 4.5:1 for normal text, or
* 3:1 for large text (over 24px, or bold and over 19px).`,
		url: 'https://a11y.fans/143-en/',
		explanation: `Sufficient color contrast ensures text is readable for users with low vision, color blindness, or viewing in bright conditions. The contrast ratio is calculated based on the relative luminance of text and background colors.`,
		implementationExamples: {
			good: `/* High contrast text */
.text {
  color: #333333; /* Dark gray */
  background: #FFFFFF; /* White */
  /* Contrast ratio: 12.6:1 ✓ */
}

/* Large text with sufficient contrast */
.heading {
  color: #595959; /* Medium gray */
  background: #FFFFFF;
  font-size: 24px;
  /* Contrast ratio: 7:1 ✓ */
}

/* Dark mode with good contrast */
.dark-text {
  color: #E0E0E0; /* Light gray */
  background: #1A1A1A; /* Near black */
  /* Contrast ratio: 10.8:1 ✓ */
}`,
			bad: `/* Insufficient contrast */
.text {
  color: #999999; /* Light gray */
  background: #FFFFFF; /* White */
  /* Contrast ratio: 2.8:1 ✗ FAILS */
}

/* Light text on light background */
.button {
  color: #CCCCCC;
  background: #EEEEEE;
  /* Contrast ratio: 1.3:1 ✗ FAILS */
}

/* Placeholder text too light */
input::placeholder {
  color: #BBBBBB;
  /* Often fails contrast requirements */
}`,
		},
		commonViolations: [
			'Light gray text (#999 or lighter) on white backgrounds',
			'Placeholder text with insufficient contrast',
			'Disabled form controls that are hard to read',
			'Link text that blends with surrounding text',
			'Text overlaid on images without sufficient background',
			'Success/error messages with only color indicators',
		],
		remediationStrategies: [
			'Use contrast checking tools (WebAIM, Chrome DevTools) to verify ratios',
			'Aim for 4.5:1 for normal text (under 24px), 3:1 for large text',
			'Test designs with color blindness simulators',
			'Ensure focus indicators have at least 3:1 contrast against background',
			'Consider using WCAG AAA standards (7:1) for better accessibility',
			'Add text shadows or backgrounds when overlaying text on images',
		],
	},
	{
		criterionId: '1.4.4',
		criterionNumber: '1.4.4',
		title: 'Resize text',
		principle: 'Perceivable',
		level: 'AA',
		description: `Text remains readable and usable when
* zoomed to 200%.`,
		url: 'https://a11y.fans/144-en/',
	},
	{
		criterionId: '1.4.5',
		criterionNumber: '1.4.5',
		title: 'Images of text',
		principle: 'Perceivable',
		level: 'AA',
		description: `Text must be actual text, not images of text, unless a specific visual presentation is absolutely necessary (e.g. logo).`,
		url: 'https://a11y.fans/145-en/',
	},
	{
		criterionId: '1.4.6',
		criterionNumber: '1.4.6',
		title: 'Contrast (enhanced)',
		principle: 'Perceivable',
        level: 'AAA',
		description: `Text contrast against its background must be at least
* 7:1 for normal text, or
* 4.5:1 for large text (over 24px, or bold and over 19px).`,
		url: 'https://a11y.fans/146-en/',
	},
	{
		criterionId: '1.4.7',
		criterionNumber: '1.4.7',
		title: 'Low or no background audio',
		principle: 'Perceivable',
        level: 'AAA',
		description: `For prerecorded audio with speech, any background sound must be
* at least 20dB lower than the speech, or
* there must be a way to turn it off.`,
		url: 'https://a11y.fans/147-en/',
	},
	{
		criterionId: '1.4.8',
		criterionNumber: '1.4.8',
		title: 'Visual presentation',
		principle: 'Perceivable',
        level: 'AAA',
		description: `Blocks of text (like paragraphs) must
* have a line height of at least 1.5,
* not be justified, and
* stay within 80 characters (or 40 for CJK scripts).
* allow users to adjust spacing and colors using custom styles.`,
		url: 'https://a11y.fans/148-en/',
	},
	{
		criterionId: '1.4.9',
		criterionNumber: '1.4.9',
		title: 'Images of text (no exception)',
		principle: 'Perceivable',
        level: 'AAA',
		description: `Text must be actual text, not images of text (no exception, not even for design or aesthetic reasons).`,
		url: 'https://a11y.fans/149-en/',
	},
	{
		criterionId: '1.4.10',
		criterionNumber: '1.4.10',
		title: 'Reflow',
		principle: 'Perceivable',
		level: 'AA',
		description: `Content remains functional and easy to read when
* zoomed to 400% or
* viewed at 320px width,
without needing to scroll in two directions (except for tables, maps, and similar content).`,
		url: 'https://a11y.fans/1410-en/',
	},
	{
		criterionId: '1.4.11',
		criterionNumber: '1.4.11',
		title: 'Non-text contrast',
		principle: 'Perceivable',
		level: 'AA',
		description: `Interactive controls (e.g. buttons, form fields, focus indicators) and graphics that convey meaning (e.g. icons, charts, graph lines) must have a contrast ratio of at least 3:1 against adjacent colors.`,
		url: 'https://a11y.fans/1411-en/',
	},
	{
		criterionId: '1.4.12',
		criterionNumber: '1.4.12',
		title: 'Text spacing',
		principle: 'Perceivable',
		level: 'AA',
		description: `Text remains readable and usable when spacing is changed using custom styles to at least
* 1.5× line height,
* 2× spacing after paragraphs,
* 0.12× letter spacing,
* 0.16× word spacing,
without content being hidden, cut off, or broken.`,
		url: 'https://a11y.fans/1412-en/',
	},
	{
		criterionId: '1.4.13',
		criterionNumber: '1.4.13',
		title: 'Content on hover or focus',
		principle: 'Perceivable',
		level: 'AA',
		description: `When additional content appears on hover or keyboard focus (including long press on touch), it must
* stay visible until dismissed or no longer valid,
* be dismissible (e.g. using the **[esc]** key), and
* remain visible when hovered or focused.`,
		url: 'https://a11y.fans/1413-en/',
	},
	{
		criterionId: '2.1.1',
		criterionNumber: '2.1.1',
		title: 'Keyboard',
		principle: 'Operable',
		level: 'A',
		description: `All functionality must be operable using a keyboard alone, unless the task requires freehand input (e.g. drawing).`,
		url: 'https://a11y.fans/211-en/',
		explanation: `Users who cannot use a mouse—including those with motor disabilities, blind users with screen readers, and power users—must be able to operate all functionality with a keyboard. This includes navigation, form controls, custom widgets, and interactive elements.`,
		implementationExamples: {
			good: `<!-- Native button is keyboard accessible -->
<button onclick="submitForm()">Submit</button>

<!-- Custom widget with proper keyboard support -->
<div 
  role="button" 
  tabindex="0"
  onkeydown="if(event.key==='Enter'||event.key===' ') handleClick()"
  onclick="handleClick()">
  Custom Button
</div>

<!-- Dropdown with keyboard navigation -->
<select name="options">
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>

<!-- Modal with focus management -->
<dialog open>
  <button onclick="closeModal()">Close</button>
</dialog>`,
			bad: `<!-- Click-only div without keyboard support -->
<div onclick="handleClick()">
  Clickable Item
</div>

<!-- Missing tabindex and keyboard handlers -->
<div class="button" onclick="submit()">
  Submit
</div>

<!-- Mouse-only interactions -->
<div onmouseover="showTooltip()" onmouseout="hideTooltip()">
  Hover for info
</div>

<!-- Custom select without keyboard support -->
<div class="dropdown" onclick="toggle()">
  <span>Select option</span>
</div>`,
		},
		commonViolations: [
			'Using div or span elements with onclick without keyboard handlers',
			'Custom dropdowns/menus without arrow key navigation',
			"Interactive elements missing tabindex='0'",
			'Modal dialogs that trap focus incorrectly',
			'Drag-and-drop interfaces without keyboard alternatives',
			'Hover-only tooltips and menus without keyboard triggers',
		],
		remediationStrategies: [
			'Use native HTML elements (button, a, input) whenever possible',
			"Add tabindex='0' to make custom elements focusable",
			'Implement keyboard event handlers (keydown, keyup) for Enter and Space',
			'Provide arrow key navigation for complex widgets (menus, tabs, grids)',
			'Manage focus properly in modals and dynamic content',
			'Test all functionality using only Tab, Shift+Tab, Enter, Space, and arrow keys',
		],
	},
	{
		criterionId: '2.1.2',
		criterionNumber: '2.1.2',
		title: 'No keyboard trap',
		principle: 'Operable',
		level: 'A',
		description: `It must always be possible to move focus into and out of any component using a keyboard alone (e.g. **[tab]**, **[shift]**+**[tab]**, **[enter]**, **[esc]**), without getting stuck.`,
		url: 'https://a11y.fans/212-en/',
	},
	{
		criterionId: '2.1.3',
		criterionNumber: '2.1.3',
		title: 'Keyboard (no exception)',
		principle: 'Operable',
        level: 'AAA',
		description: `All functionality must be operable using a keyboard alone (no exception, not even for tasks involving gestures like drag-and-drop or pointer-based interaction).`,
		url: 'https://a11y.fans/213-en/',
	},
	{
		criterionId: '2.1.4',
		criterionNumber: '2.1.4',
		title: 'Character key shortcuts',
		principle: 'Operable',
		level: 'A',
		description: `Keyboard shortcuts should use modifier keys like **[ctrl]**, **[cmd]**, or **[alt/option]**. If single-key shortcuts are used (e.g. 'S' for save), it must be possible to
* turn them off,
* remap them with a modifier key, or
* restrict them to when the relevant element is focused.`,
		url: 'https://a11y.fans/214-en/',
	},
	{
		criterionId: '2.2.1',
		criterionNumber: '2.2.1',
		title: 'Timing adjustable',
		principle: 'Operable',
		level: 'A',
		description: `Time limits must be avoided unless essential for the task (e.g. exams, auctions). If time limits are used, it must be possible to
* turn them off,
* adjust them to at least 10× the default, or
* extend them by at least 10×.`,
		url: 'https://a11y.fans/221-en/',
	},
	{
		criterionId: '2.2.2',
		criterionNumber: '2.2.2',
		title: 'Pause, stop, hide',
		principle: 'Operable',
		level: 'A',
		description: `If content moves, scrolls, blinks, or updates automatically for more than 5 seconds, it must be possible to
* pause it,
* stop it, or
* hide it.`,
		url: 'https://a11y.fans/222-en/',
	},
	{
		criterionId: '2.2.3',
		criterionNumber: '2.2.3',
		title: 'No timing',
		principle: 'Operable',
        level: 'AAA',
		description: `Content must not include time limits for reading or interaction, unless it's part of a live event or time-based activity (e.g. auctions, broadcasts).`,
		url: 'https://a11y.fans/223-en/',
	},
	{
		criterionId: '2.2.4',
		criterionNumber: '2.2.4',
		title: 'Interruptions',
		principle: 'Operable',
        level: 'AAA',
		description: `Interruptions (like pop-ups, alerts, or notifications) must be able to be
* delayed or suppressed, and
* controlled,
except in emergencies (e.g. critical system warnings).`,
		url: 'https://a11y.fans/224-en/',
	},
	{
		criterionId: '2.2.5',
		criterionNumber: '2.2.5',
		title: 'Re-authenticating',
		principle: 'Operable',
        level: 'AAA',
		description: `When (re-)authentication is required (e.g. after session timeout), all previously entered data must be preserved so the task can continue without starting over.`,
		url: 'https://a11y.fans/225-en/',
	},
	{
		criterionId: '2.2.6',
		criterionNumber: '2.2.6',
		title: 'Timeouts',
		principle: 'Operable',
        level: 'AAA',
		description: `If inactivity could lead to data loss, a clear warning must be shown
* before the timeout,
* with enough time to react, and
* including an option to extend the session.`,
		url: 'https://a11y.fans/226-en/',
	},
	{
		criterionId: '2.3.1',
		criterionNumber: '2.3.1',
		title: 'Three flashes or below threshold',
		principle: 'Operable',
		level: 'A',
		description: `Content must not flash, blink, or flicker more than three times per second, unless it stays within safety limits designed to avoid visual overload and reduce the risk of seizures.`,
		url: 'https://a11y.fans/231-en/',
	},
	{
		criterionId: '2.3.2',
		criterionNumber: '2.3.2',
		title: 'Three flashes',
		principle: 'Operable',
        level: 'AAA',
		description: `Content must not flash, blink, or flicker more than three times per second (no exception, not even if it meets safety thresholds).`,
		url: 'https://a11y.fans/232-en/',
	},
	{
		criterionId: '2.3.3',
		criterionNumber: '2.3.3',
		title: 'Animation from interactions',
		principle: 'Operable',
        level: 'AAA',
		description: `Animations triggered by interaction (e.g. on click, hover, tap) must be able to be
* disable through system settings (e.g. "reduce motion"), or
* turn off using a site-level option.`,
		url: 'https://a11y.fans/233-en/',
	},
	{
		criterionId: '2.4.1',
		criterionNumber: '2.4.1',
		title: 'Bypass blocks',
		principle: 'Operable',
		level: 'A',
		description: `It must be possible to skip repeated blocks of content (e.g. navigation, header) and jump directly to the main part of the page.`,
		url: 'https://a11y.fans/241-en/',
	},
	{
		criterionId: '2.4.2',
		criterionNumber: '2.4.2',
		title: 'Page titled',
		principle: 'Operable',
		level: 'A',
		description: `Each page must have a unique and descriptive **_<title>_** that reflects its topic or purpose.`,
		url: 'https://a11y.fans/242-en/',
	},
	{
		criterionId: '2.4.3',
		criterionNumber: '2.4.3',
		title: 'Focus order',
		principle: 'Operable',
		level: 'A',
		description: `Focus must follow a logical and meaningful order that preserves relationships and matches how the page is naturally read, regardless of layout or language direction.`,
		url: 'https://a11y.fans/243-en/',
	},
	{
		criterionId: '2.4.4',
		criterionNumber: '2.4.4',
		title: 'Link purpose (in context)',
		principle: 'Operable',
		level: 'A',
		description: `The purpose of each link must be clear from
* the link text itself, or
* the surrounding context.`,
		url: 'https://a11y.fans/244-en/',
	},
	{
		criterionId: '2.4.5',
		criterionNumber: '2.4.5',
		title: 'Multiple ways',
		principle: 'Operable',
		level: 'AA',
		description: `At least two different ways must be available to find pages or content (e.g. navigation menus, on-page links, site search, or a sitemap).`,
		url: 'https://a11y.fans/245-en/',
	},
	{
		criterionId: '2.4.6',
		criterionNumber: '2.4.6',
		title: 'Headings and labels',
		principle: 'Operable',
		level: 'AA',
		description: `Headings must describe what follows.
Labels and buttons must clearly communicate what information is needed or what action will happen.`,
		url: 'https://a11y.fans/246-en/',
	},
	{
		criterionId: '2.4.7',
		criterionNumber: '2.4.7',
		title: 'Focus visible',
		principle: 'Operable',
		level: 'AA',
		description: `A visible indicator must show which element is currently focused when navigating with a keyboard.`,
		url: 'https://a11y.fans/247-en/',
	},
	{
		criterionId: '2.4.8',
		criterionNumber: '2.4.8',
		title: 'Location',
		principle: 'Operable',
        level: 'AAA',
		description: `It must be clear where you are within a set of pages (e.g. using breadcrumbs, highlighted menu items, or headings).`,
		url: 'https://a11y.fans/248-en/',
	},
	{
		criterionId: '2.4.9',
		criterionNumber: '2.4.9',
		title: 'Link purpose (link only)',
		principle: 'Operable',
        level: 'AAA',
		description: `The purpose of each link must be clear
* from the link text alone
* without relying on surrounding context.`,
		url: 'https://a11y.fans/249-en/',
	},
	{
		criterionId: '2.4.10',
		criterionNumber: '2.4.10',
		title: 'Section headings',
		principle: 'Operable',
        level: 'AAA',
		description: `Related content must be organized into clear sections using headings.`,
		url: 'https://a11y.fans/2410-en/',
	},
	{
		criterionId: '2.4.11',
		criterionNumber: '2.4.11',
		title: 'Focus not obscured (minimum)',
		principle: 'Operable',
		level: 'AA',
		description: `When an element receives focus, it must be at least partially visible.`,
		url: 'https://a11y.fans/2411-en/',
	},
	{
		criterionId: '2.4.12',
		criterionNumber: '2.4.12',
		title: 'Focus not obscured (enhanced)',
		principle: 'Operable',
        level: 'AAA',
		description: `When an element receives focus, it must be fully visible and not covered by other content.`,
		url: 'https://a11y.fans/2412-en/',
	},
	{
		criterionId: '2.4.13',
		criterionNumber: '2.4.13',
		title: 'Focus appearance',
		principle: 'Operable',
		level: 'AA',
		description: `The visible focus indicator must
* be at least 2px thick,
* have a contrast ratio of 3:1 compared to the unfocused state, and
* be clearly connected to the focused element.`,
		url: 'https://a11y.fans/2413-en/',
	},
	{
		criterionId: '2.5.1',
		criterionNumber: '2.5.1',
		title: 'Pointer gestures',
		principle: 'Operable',
		level: 'A',
		description: `Actions that rely on gestures (like swiping or pinching) must also be possible using a single tap, click, or button.`,
		url: 'https://a11y.fans/251-en/',
	},
	{
		criterionId: '2.5.2',
		criterionNumber: '2.5.2',
		title: 'Pointer cancellation',
		principle: 'Operable',
		level: 'A',
		description: `Actions must not trigger on press or touch down. They must only trigger on release (like mouse-up or finger lift).`,
		url: 'https://a11y.fans/252-en/',
	},
	{
		criterionId: '2.5.3',
		criterionNumber: '2.5.3',
		title: 'Label in Name',
		principle: 'Operable',
		level: 'A',
		description: `The visible text of a button, link, or form field must also be part of its accessible (programmatic) name.`,
		url: 'https://a11y.fans/253-en/',
	},
	{
		criterionId: '2.5.4',
		criterionNumber: '2.5.4',
		title: 'Motion actuation',
		principle: 'Operable',
		level: 'A',
		description: `If an action can be triggered by motion (like shaking or tilting the device), it must also
* work without motion, and
* be possible to turn off motion-based input.`,
		url: 'https://a11y.fans/254-en/',
	},
	{
		criterionId: '2.5.5',
		criterionNumber: '2.5.5',
		title: 'Target size',
		principle: 'Operable',
        level: 'AAA',
		description: `Targets for touch or mouse must be at least 44×44px, unless they are
* part of a sentence or block of text,
* near another target with the same function that meets the size, or
* in a context where size can't be increased.`,
		url: 'https://a11y.fans/255-en/',
	},
	{
		criterionId: '2.5.6',
		criterionNumber: '2.5.6',
		title: 'Concurrent input mechanisms',
		principle: 'Operable',
        level: 'AAA',
		description: `It must be possible to switch between input types (mouse, keyboard, touch, voice) without losing access to any functionality.`,
		url: 'https://a11y.fans/256-en/',
	},
	{
		criterionId: '2.5.7',
		criterionNumber: '2.5.7',
		title: 'Dragging movements',
		principle: 'Operable',
		level: 'AA',
		description: `Actions that require dragging (like reordering) must also be possible using buttons or another method that does not require dragging.`,
		url: 'https://a11y.fans/257-en/',
	},
	{
		criterionId: '2.5.8',
		criterionNumber: '2.5.8',
		title: 'Target size (minimum)',
		principle: 'Operable',
		level: 'AA',
		description: `Targets must be at least 24×24px, unless they are
* part of a sentence or block of text,
* surrounded by enough space, or
* near another target with the same function that meets the size.`,
		url: 'https://a11y.fans/258-en/',
	},
	{
		criterionId: '3.1.1',
		criterionNumber: '3.1.1',
		title: 'Language of page',
		principle: 'Understandable',
		level: 'A',
		description: `Each page must have a **_<html lang="">_** attribute that matches the main language of the page.`,
		url: 'https://a11y.fans/311-en/',
	},
	{
		criterionId: '3.1.2',
		criterionNumber: '3.1.2',
		title: 'Language of parts',
		principle: 'Understandable',
		level: 'AA',
		description: `Any parts of the content in a different language must be marked with the correct lang attribute.
Expressions borrowed from another language (like "déjà vu" in English) do not need this, unless pronunciation or understanding would be affected.`,
		url: 'https://a11y.fans/312-en/',
	},
	{
		criterionId: '3.1.3',
		criterionNumber: '3.1.3',
		title: 'Unusual words',
		principle: 'Understandable',
        level: 'AAA',
		description: `Unusual terms, jargon, or figurative language should be
* avoided when possible, or
* explained the first time they appear.`,
		url: 'https://a11y.fans/313-en/',
	},
	{
		criterionId: '3.1.4',
		criterionNumber: '3.1.4',
		title: 'Abbreviations',
		principle: 'Understandable',
        level: 'AAA',
		description: `Abbreviations and acronyms should be
* avoided when possible, or
* explained the first time they appear.`,
		url: 'https://a11y.fans/314-en/',
	},
	{
		criterionId: '3.1.5',
		criterionNumber: '3.1.5',
		title: 'Reading level',
		principle: 'Understandable',
        level: 'AAA',
		description: `If content requires reading skills above lower secondary education (around 9th grade), provide
* a simpler version,
* a summary,
* a visual aid, or
* a spoken version
to help with understanding.`,
		url: 'https://a11y.fans/315-en/',
	},
	{
		criterionId: '3.1.6',
		criterionNumber: '3.1.6',
		title: 'Pronunciation',
		principle: 'Understandable',
        level: 'AAA',
		description: `If a word can be pronounced in different ways with different meanings, the intended meaning must be clarified to avoid confusion or ambiguity.`,
		url: 'https://a11y.fans/316-en/',
	},
	{
		criterionId: '3.2.1',
		criterionNumber: '3.2.1',
		title: 'On focus',
		principle: 'Understandable',
		level: 'A',
		description: `No unexpected changes must happen when an element receives focus (like open a popup, move focus, submit a form).`,
		url: 'https://a11y.fans/321-en/',
	},
	{
		criterionId: '3.2.2',
		criterionNumber: '3.2.2',
		title: 'On input',
		principle: 'Understandable',
		level: 'A',
		description: `No unexpected changes must happen when a field value changes (like auto-submit, reload, open new page).`,
		url: 'https://a11y.fans/322-en/',
	},
	{
		criterionId: '3.2.3',
		criterionNumber: '3.2.3',
		title: 'Consistent navigation',
		principle: 'Understandable',
		level: 'AA',
		description: `Navigation elements (like menus, links, search) must appear in the same place and order across pages.`,
		url: 'https://a11y.fans/323-en/',
	},
	{
		criterionId: '3.2.4',
		criterionNumber: '3.2.4',
		title: 'Consistent identification',
		principle: 'Understandable',
		level: 'AA',
		description: `Elements with the same function must look, behave, and be labeled the same way across pages.`,
		url: 'https://a11y.fans/324-en/',
	},
	{
		criterionId: '3.2.5',
		criterionNumber: '3.2.5',
		title: 'Change on request',
		principle: 'Understandable',
        level: 'AAA',
		description: `Major changes (like open dialog, navigate, submit) must only happen when explicitly requested.`,
		url: 'https://a11y.fans/325-en/',
	},
	{
		criterionId: '3.2.6',
		criterionNumber: '3.2.6',
		title: 'Consistent help',
		principle: 'Understandable',
		level: 'AA',
		description: `Help options (like contact link, support widget) must appear in the same place across pages.`,
		url: 'https://a11y.fans/326-en/',
	},
	{
		criterionId: '3.3.1',
		criterionNumber: '3.3.1',
		title: 'Error identification',
		principle: 'Understandable',
		level: 'A',
		description: `Errors and validation must be clearly identified and described in text, not just visually (like color or highlighting).`,
		url: 'https://a11y.fans/331-en/',
	},
	{
		criterionId: '3.3.2',
		criterionNumber: '3.3.2',
		title: 'Labels or instructions',
		principle: 'Understandable',
		level: 'A',
		description: `Form fields must have clear labels or instructions to avoid confusion and help complete the input correctly.`,
		url: 'https://a11y.fans/332-en/',
	},
	{
		criterionId: '3.3.3',
		criterionNumber: '3.3.3',
		title: 'Error suggestion',
		principle: 'Understandable',
		level: 'AA',
		description: `Errors and validation messages must show text that
* explains the problem and
* gives suggestions for how to fix it (like "enter at least 8 characters").`,
		url: 'https://a11y.fans/333-en/',
	},
	{
		criterionId: '3.3.4',
		criterionNumber: '3.3.4',
		title: 'Error prevention (legal, financial, data)',
		principle: 'Understandable',
		level: 'AA',
		description: `Before submitting important actions (like payments or legal forms), the form must allow
* reviewing the input,
* correcting mistakes, or
* confirming.`,
		url: 'https://a11y.fans/334-en/',
	},
	{
		criterionId: '3.3.5',
		criterionNumber: '3.3.5',
		title: 'Help',
		principle: 'Understandable',
        level: 'AAA',
		description: `Provide additional help (like text instructions, help links, or tooltips) when label alone might be ambiguous or confusing.`,
		url: 'https://a11y.fans/335-en/',
	},
	{
		criterionId: '3.3.6',
		criterionNumber: '3.3.6',
		title: 'Error prevention (all)',
		principle: 'Understandable',
        level: 'AAA',
		description: `Before submitting, all forms must allow
* reviewing the input,
* correcting mistakes, or
* confirming.`,
		url: 'https://a11y.fans/336-en/',
	},
	{
		criterionId: '3.3.7',
		criterionNumber: '3.3.7',
		title: 'Redundant entry',
		principle: 'Understandable',
		level: 'AA',
		description: `Don't ask for the same information twice in the same process.
Provide pre-filled fields or selection options if the information was already given.`,
		url: 'https://a11y.fans/337-en/',
	},
	{
		criterionId: '3.3.8',
		criterionNumber: '3.3.8',
		title: 'Accessible authentication (minimum)',
		principle: 'Understandable',
		level: 'AA',
		description: `Authentication must not rely on memory alone.
Allow copy-paste, password managers, or other options (like email verification).`,
		url: 'https://a11y.fans/338-en/',
	},
	{
		criterionId: '3.3.9',
		criterionNumber: '3.3.9',
		title: 'Accessible authentication (enhanced)',
		principle: 'Understandable',
        level: 'AAA',
		description: `Authentication must not rely on memory or recognition (like solving puzzles, remembering images, or using CAPTCHAs).`,
		url: 'https://a11y.fans/339-en/',
	},
	{
		criterionId: '4.1.1',
		criterionNumber: '4.1.1',
		title: 'Parsing (obsolete and removed)',
		principle: 'Robust',
        level: 'A',
		description: `This used to require HTML with proper structure and no critical markup errors (like missing tags or duplicate IDs).
The requirement is removed but still helps with compatibility.`,
		url: 'https://a11y.fans/411-en/',
	},
	{
		criterionId: '4.1.2',
		criterionNumber: '4.1.2',
		title: 'Name, role, value',
		principle: 'Robust',
		level: 'A',
		description: `Interactive elements must have
* a clear name (what it is),
* the correct role (what it does), and
* any current value or state,
so that assistive technologies can interpret and interact with them correctly.`,
		url: 'https://a11y.fans/412-en/',
	},
	{
		criterionId: '4.1.3',
		criterionNumber: '4.1.3',
		title: 'Status messages',
		principle: 'Robust',
		level: 'A',
		description: `Status updates (like "form sent" or "5 items in cart") must
* coded using proper roles (like **_role="status"_** or **_role="alert"_**),
* be detectable by assistive technologies, and
* not require moving focus.`,
		url: 'https://a11y.fans/413-en/',
	},
]

const output = document.getElementById('output');
const input = document.getElementById('command-input');

// Haptic feedback - uses iOS 18+ checkbox switch hack, falls back to Vibration API
const haptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(1);
  } else {
    triggerIOSHaptic();
  }
};

haptic.confirm = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([1, 50, 1]);
  } else {
    triggerIOSHaptic();
    setTimeout(triggerIOSHaptic, 80);
  }
};

haptic.error = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([1, 50, 1, 50, 1]);
  } else {
    triggerIOSHaptic();
    setTimeout(triggerIOSHaptic, 80);
    setTimeout(triggerIOSHaptic, 160);
  }
};

function triggerIOSHaptic() {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.setAttribute('switch', '');
  checkbox.style.cssText = 'position:fixed;top:-100px;opacity:0;pointer-events:none;';

  const label = document.createElement('label');
  label.appendChild(checkbox);
  document.body.appendChild(label);

  label.click();

  requestAnimationFrame(() => label.remove());
}

const commands = {
  help: `Available commands:
  <span class="highlight clickable-cmd" data-cmd="about">about</span>     - who is patrick?
  <span class="highlight clickable-cmd" data-cmd="work">work</span>      - what do I do
  <span class="highlight clickable-cmd" data-cmd="contact">contact</span>   - get in touch
  <span class="highlight clickable-cmd" data-cmd="links">links</span>     - find me elsewhere
  <span class="highlight clickable-cmd" data-cmd="clear">clear</span>     - clear the terminal`,

  about: `Hey, I'm Patrick Sullivan.

Co-founder & CTO at Linq. I build startups—the tech, the product, the teams.

Previously a founding team member at Shipt—built the apps that launched the company, spent 5 years scaling the tech and leading half the engineering org.

Outside of work: daily workouts, scuba, skiing, good food, good wine, and mass GeoGuessr.`,

  work: `<span class="highlight">Co-Founder & CTO at Linq</span> (2020-present)
Building a communications API platform for iMessage, RCS, SMS & voice.

<span class="muted">Previously:</span> Founding Team & Head of Frontend at Shipt (2015-2020)

<span class="muted">Based in:</span> Birmingham, AL & San Francisco, CA`,

  contact: `Available contacts:
  <span class="highlight clickable-cmd" data-cmd="workemail">work</span>     - patrick@linqapp.com
  <span class="highlight clickable-cmd" data-cmd="personalemail">personal</span> - patrick@pdsullivan.com`,

  links: `Available links:
  <span class="highlight clickable-cmd" data-cmd="x">x</span>         - x.com/patsullyyy
  <span class="highlight clickable-cmd" data-cmd="instagram">instagram</span> - instagram.com/patsullyyy
  <span class="highlight clickable-cmd" data-cmd="linkedin">linkedin</span>  - linkedin.com/in/pdsullivan
  <span class="highlight clickable-cmd" data-cmd="strava">strava</span>    - strava.com/athletes/patsullyyy
  <span class="highlight clickable-cmd" data-cmd="geoguessr">geoguessr</span> - geoguessr.com/user/...
  <span class="highlight clickable-cmd" data-cmd="thoughts">thoughts</span>  - accordingto.pdsullivan.com
  <span class="highlight clickable-cmd" data-cmd="linq">linq</span>      - linqapp.com`,

  clear: 'CLEAR',
};

// Link data for link commands
const linkData = {
  x: { url: 'https://x.com/patsullyyy', display: 'x.com/patsullyyy' },
  instagram: { url: 'https://instagram.com/patsullyyy', display: 'instagram.com/patsullyyy' },
  linkedin: { url: 'https://linkedin.com/in/pdsullivan', display: 'linkedin.com/in/pdsullivan' },
  strava: { url: 'https://strava.com/athletes/patsullyyy', display: 'strava.com/athletes/patsullyyy' },
  geoguessr: { url: 'https://www.geoguessr.com/user/66b2a465885031ef8888abab', display: 'geoguessr.com/user/patsullyyy' },
  thoughts: { url: 'https://accordingto.pdsullivan.com', display: 'accordingto.pdsullivan.com' },
  linq: { url: 'https://linqapp.com', display: 'linqapp.com' },
};

// Email data for contact commands
const emailData = {
  workemail: { email: 'patrick@linqapp.com', display: 'patrick@linqapp.com' },
  personalemail: { email: 'patrick@pdsullivan.com', display: 'patrick@pdsullivan.com' },
};

// Track active link/email for c/o commands
let activeLink = null;
let activeEmail = null;
let inContactMenu = false;
let inLinksMenu = false;

function getPromptHTML() {
  return `<span class="prompt-user">visitor</span><span class="prompt-at">@</span><span class="prompt-host">pdsullivan.com</span> <span class="prompt-separator">in</span> <span class="prompt-path">~</span> <span class="prompt-git"> main</span>`;
}

function getArrowHTML(error = false) {
  return `<span class="prompt-arrow${error ? ' error' : ''}">❯</span>`;
}

function printLine(html, className = '') {
  const line = document.createElement('div');
  line.className = className;
  line.innerHTML = html;
  output.appendChild(line);
}


function printCommand(cmd) {
  printLine(`${getPromptHTML()}`, 'command-line');
  printLine(`${getArrowHTML()} <span class="cmd-text">${cmd}</span>`, 'command-line');
}

function handleCommand(cmd) {
  const trimmed = cmd.trim().toLowerCase();

  // Echo the command
  printCommand(cmd);

  if (trimmed === '') {
    return;
  }

  if (trimmed === 'clear') {
    output.innerHTML = '';
    return;
  }

  // Handle c/o when there's an active link
  if (activeLink && (trimmed === 'c' || trimmed === 'o')) {
    if (trimmed === 'c') {
      navigator.clipboard.writeText(activeLink.url);
      haptic.confirm();
      printLine(`<span class="muted">copied:</span> ${activeLink.url}`, 'response');
    } else if (trimmed === 'o') {
      haptic.confirm();
      printLine(`<span class="muted">opening:</span> ${activeLink.url}`, 'response');
      window.open(activeLink.url, '_blank');
    }
    activeLink = null;
    return;
  }

  // Handle c when there's an active email
  if (activeEmail && trimmed === 'c') {
    navigator.clipboard.writeText(activeEmail.email);
    haptic.confirm();
    printLine(`<span class="muted">copied:</span> ${activeEmail.email}`, 'response');
    activeEmail = null;
    return;
  }

  // Context-aware shortcuts
  let resolved = trimmed;

  // When in contact menu, map display names to actual commands
  if (inContactMenu) {
    const contactShortcuts = { work: 'workemail', personal: 'personalemail' };
    resolved = contactShortcuts[trimmed] || trimmed;
  }

  // When there's an active email, l goes to contact
  if (activeEmail && trimmed === 'l') {
    resolved = 'contact';
  }

  // General shortcuts (only apply if not already resolved)
  const shortcuts = {
    l: 'links',
    c: 'contact',
    w: 'work',
    h: 'help',
  };
  if (!activeEmail) {
    resolved = shortcuts[resolved] || resolved;
  }

  const response = commands[resolved];
  const link = linkData[resolved];
  const email = emailData[resolved];

  // Clear active states on any other command
  activeLink = null;
  activeEmail = null;
  inContactMenu = false;
  inLinksMenu = false;

  if (response) {
    // Set menu flags for contact/links
    if (resolved === 'contact') inContactMenu = true;
    if (resolved === 'links') inLinksMenu = true;
    printLine(response, 'response');
    haptic.confirm(); // Success - two taps
  } else if (link) {
    // Show link options and set active link
    activeLink = link;
    printLine(`<span class="highlight">${link.display}</span>

  <span class="link-action" data-action="copy" data-url="${link.url}">[c] copy to clipboard</span>
  <span class="link-action" data-action="visit" data-url="${link.url}">[o] open link</span>
  <span class="clickable-cmd" data-cmd="links">[l] all links</span>`, 'response');
    haptic.confirm();
  } else if (email) {
    // Show email options and set active email
    activeEmail = email;
    printLine(`<span class="highlight">${email.display}</span>

  <span class="email-action" data-action="copy" data-email="${email.email}">[c] copy to clipboard</span>
  <span class="clickable-cmd" data-cmd="contact">[l] all contacts</span>`, 'response');
    haptic.confirm();
  } else {
    printLine(`<span class="error">command not found:</span> ${trimmed}. Type <span class="highlight">'help'</span> for available commands.`, 'response');
    haptic.error(); // Error - three taps
  }
}

document.getElementById('command-form').addEventListener('submit', (e) => {
  e.preventDefault();
  handleCommand(input.value);
  input.value = '';
});

// Focus input when clicking anywhere (but not on copyable elements)
document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('copyable')) {
    input.focus();
  }
});

// Copy to clipboard on click
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('copyable')) {
    const text = e.target.dataset.copy;
    await navigator.clipboard.writeText(text);
    haptic.confirm();
    printLine(`<span class="muted">copied to clipboard:</span> ${text}`, 'response');
    input.focus();
  }
});

// Run command on click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('clickable-cmd')) {
    const cmd = e.target.dataset.cmd;
    handleCommand(cmd);
    input.focus();
  }
});

// Link action click
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('link-action')) {
    const action = e.target.dataset.action;
    const url = e.target.dataset.url;

    if (action === 'copy') {
      await navigator.clipboard.writeText(url);
      haptic.confirm();
      printLine(`<span class="muted">copied:</span> ${url}`, 'response');
    } else if (action === 'visit') {
      haptic.confirm();
      printLine(`<span class="muted">opening:</span> ${url}`, 'response');
      window.open(url, '_blank');
    }
    activeLink = null;
    input.focus();
  }
});

// Email action click
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('email-action')) {
    const email = e.target.dataset.email;
    await navigator.clipboard.writeText(email);
    haptic.confirm();
    printLine(`<span class="muted">copied:</span> ${email}`, 'response');
    activeEmail = null;
    input.focus();
  }
});

// Welcome message
printLine(`<span class="banner">╭─────────────────────────────────────╮
│  Welcome to pdsullivan.com          │
╰─────────────────────────────────────╯</span>`, '');
printLine(`<span class="welcome-text">Type <span class="highlight">'help'</span> for available commands.</span>

`, '');

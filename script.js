const output = document.getElementById('output');
const input = document.getElementById('command-input');

const commands = {
  help: `Available commands:
  <span class="highlight">about</span>     - who is patrick?
  <span class="highlight">work</span>      - what do I do
  <span class="highlight">contact</span>   - get in touch
  <span class="highlight">links</span>     - find me elsewhere
  <span class="highlight">clear</span>     - clear the terminal`,

  about: `Hey, I'm Patrick Sullivan.

Co-founder & CTO at Linq. I build startups—the tech, the product, the teams.

Previously a founding team member at Shipt, where I spent 5 years and led half the engineering org.

Outside of work: daily workouts, scuba, skiing, good food, good wine.`,

  work: `<span class="highlight">Co-Founder & CTO at Linq</span> (2020-present)
Building a communications API platform for iMessage, RCS, SMS & voice.

<span class="muted">Previously:</span> Founding Team & Head of Frontend at Shipt (2015-2020)

<span class="muted">Based in:</span> Birmingham, AL & San Francisco, CA`,

  contact: `<span class="label">Work</span>     patrick@linqapp.com
<span class="label">Personal</span> patrick@pdsullivan.com`,

  links: `<span class="label">X</span>         <a href="https://x.com/patsullyyy" target="_blank">x.com/patsullyyy</a>
<span class="label">Instagram</span> <a href="https://instagram.com/patsullyyy" target="_blank">instagram.com/patsullyyy</a>
<span class="label">LinkedIn</span>  <a href="https://linkedin.com/in/pdsullivan" target="_blank">linkedin.com/in/pdsullivan</a>
<span class="label">Strava</span>    <a href="https://strava.com/athletes/patsullyyy" target="_blank">strava.com/athletes/patsullyyy</a>
<span class="label">Thoughts</span>  <a href="https://accordingto.pdsullivan.com" target="_blank">accordingto.pdsullivan.com</a>`,

  clear: 'CLEAR',
};

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
  window.scrollTo(0, document.body.scrollHeight);
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

  const response = commands[trimmed];
  if (response) {
    printLine(response, 'response');
  } else {
    printLine(`<span class="error">command not found:</span> ${trimmed}. Type <span class="highlight">'help'</span> for available commands.`, 'response');
  }
}

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleCommand(input.value);
    input.value = '';
  }
});

// Focus input when clicking anywhere
document.addEventListener('click', () => input.focus());

// Welcome message
printLine(`<span class="banner">╭─────────────────────────────────────╮
│  Welcome to pdsullivan.com          │
╰─────────────────────────────────────╯</span>`, '');
printLine(`<span class="welcome-text">Type <span class="highlight">'help'</span> for available commands.</span>

`, '');

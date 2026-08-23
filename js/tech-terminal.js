/**
 * MAHAVEER — Interactive Tech Lab Terminal
 * Tactile developer terminal showcasing 7+ years of software development, enterprise architectures, AI workflows, and music.
 */

document.addEventListener("DOMContentLoaded", () => {
  const terminalInput = document.getElementById("terminalCommandInput");
  const terminalBody = document.getElementById("terminalBodyContent");

  if (!terminalInput || !terminalBody) return;

  const commands = {
    help: () => `
Available Commands:
  • <span class="accent">whoami</span>        - Core software engineering & creative profile
  • <span class="accent">skills</span>        - Languages, frameworks, databases, and IDEs
  • <span class="accent">projects</span>      - Enterprise projects (RSMML, RIICO)
  • <span class="accent">ai-experience</span> - AI tooling (Claude, Antigravity, Codex, ChatGPT, RouteCode)
  • <span class="accent">discography</span>   - Original songs (Shodh, Kaalia Freestyle, Aao Naa, Shiv-Shiv)
  • <span class="accent">philosophy</span>    - The intersection of engineering and poetry
  • <span class="accent">contact</span>       - How to collaborate or reach out
  • <span class="accent">clear</span>         - Clear the terminal console
`,
    whoami: () => `
Mahaveer (@BadtameezMusic)
--------------------------------------------------
• Role: Senior Software Developer (7+ Years of Experience) & Creative Artist
• Core Stack: C#, ASP.NET, ReactJS, Blazor, DB2, SQL Server
• Enterprise Impact: Key projects for RSMML & RIICO
• AI & Tooling: Antigravity, Claude, Codex, ChatGPT, RouteCode, VS Code, Visual Studio
• Creative Dual-Identity: Lyricist, Songwriter, Poet, Video Editor
• Motto: “naram dil, garam alfaaz, bas yahi hai apna andaaz!”
`,
    skills: () => `
[LANGUAGES & FRAMEWORKS]
  • C#, ASP.NET, ReactJS, Blazor
  • HTML5, CSS3, JavaScript (ES6+), jQuery

[DATABASES]
  • IBM DB2, Microsoft SQL Server

[IDEs & DEV TOOLS]
  • Visual Studio, Visual Studio Code (VS Code), Antigravity

[AI HANDS-ON TOOLING]
  • Claude, Antigravity 2.0, Codex, ChatGPT, RouteCode

[CREATIVE SUITE]
  • Urdu & Hindi Lyric Writing, Ghazal Metre, Audio DSP
  • Video Editing & Motion Graphics (Premiere, After Effects, DaVinci)
`,
    projects: () => `
[KEY ENTERPRISE PROJECTS]
--------------------------------------------------
1. <span class="accent">RSMML (Rajasthan State Mines and Minerals Limited)</span>
   • Enterprise software architecture, resource workflow automation, and high-reliability data systems.

2. <span class="accent">RIICO (Rajasthan State Industrial Development and Investment Corporation)</span>
   • Large-scale industrial and infrastructure operations software, enterprise database management, and service portals.
`,
    "ai-experience": () => `
[AI-ACCELERATED ENGINEERING SUITE]
  ✓ Antigravity & Agentic Pair Programming
  ✓ Claude 3.5 Sonnet / 3.7 Sonnet for architectural design
  ✓ Codex & ChatGPT for automated code generation & refactoring
  ✓ RouteCode for dynamic workflow routing & intelligence
`,
    discography: () => `
[OFFICIAL RELEASES — MAHAVEER]
--------------------------------------------------
1. <span class="accent">Shodh</span> (Philosophical Poetry & Rap) ▶ https://youtu.be/bv7Ve8PqPJc
2. <span class="accent">Kaalia Freestyle</span> (Freestyle Hip-Hop · Garam Alfaaz) ▶ https://youtu.be/oG0lLpc6FEk
3. <span class="accent">Aao Naa</span> (Soulful Romantic Ballad · Naram Dil) ▶ https://youtu.be/QCf7O4lZgGU
4. <span class="accent">Shiv-Shiv</span> (Spiritual / Devotional Fusion) ▶ https://youtu.be/6HV8Dp8NAaI
`,
    philosophy: () => `
“Code is not just logic; it is modern poetry.
 An algorithm is a rhythm; a function is a stanza; 
 and technology is another canvas through which we capture the human soul.”
`,
    contact: () => `
Let's build or collaborate together:
• Email: contact@mahaveermusic.com
• YouTube: @BadtameezMusic
• GitHub: github.com/mahaveer-builder
`
  };

  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const rawInput = terminalInput.value.trim();
      const cmd = rawInput.toLowerCase();
      terminalInput.value = "";

      if (!rawInput) return;

      if (cmd === "clear") {
        terminalBody.innerHTML = `
          <div class="terminal-line"><span class="terminal-prompt">mahaveer@studio:~$</span> <span class="accent">terminal initialized</span></div>
        `;
        return;
      }

      // Append user command
      const cmdRow = document.createElement("div");
      cmdRow.className = "terminal-line";
      cmdRow.innerHTML = `<span class="terminal-prompt">mahaveer@studio:~$</span> ${escapeHTML(rawInput)}`;
      terminalBody.appendChild(cmdRow);

      // Execute command
      const responseRow = document.createElement("div");
      responseRow.className = "terminal-line terminal-output";

      if (commands[cmd]) {
        responseRow.innerHTML = commands[cmd]();
      } else {
        responseRow.innerHTML = `Command not recognized: '<span class="accent">${escapeHTML(rawInput)}</span>'. Type '<span class="accent">help</span>' for available commands.`;
      }

      terminalBody.appendChild(responseRow);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  });

  const resetBtn = document.getElementById("terminalResetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      terminalBody.innerHTML = `
        <div class="terminal-line">
          <span class="terminal-prompt">mahaveer@studio:~$</span> <span class="accent">cat engineering_profile.json</span>
        </div>
        <div class="terminal-line terminal-output">
          {<br>
          &nbsp;&nbsp;"developer": "Mahaveer Jain",<br>
          &nbsp;&nbsp;"experience": "7+ Years Software Development",<br>
          &nbsp;&nbsp;"languages_frameworks": ["C#", "ASP.Net", "ReactJS", "Blazor", "HTML", "CSS", "JS", "jQuery"],<br>
          &nbsp;&nbsp;"databases": ["IBM DB2", "SQL Server"],<br>
          &nbsp;&nbsp;"ai_tooling": ["Claude", "Antigravity", "Codex", "ChatGPT", "RouteCode"],<br>
          &nbsp;&nbsp;"enterprise_projects": ["RSMML", "RIICO"]<br>
          }
        </div>
        <div class="terminal-line">
          <span class="terminal-prompt">mahaveer@studio:~$</span> <span style="color: var(--text-muted);">Console reset. Type 'help' or 'skills' to inspect details</span>
        </div>
      `;
      terminalBody.scrollTop = 0;
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});

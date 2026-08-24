(function() {
  "use strict";

  // ----- DOM refs -----
  const chatMessages = document.getElementById('chatMessages');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const quickChips = document.getElementById('quickChips');

  // ----- State -----
  let isProcessing = false;

  // ----- Helper: scroll to bottom -----
  function scrollToBottom() {
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 20);
  }

  // ----- Add a message bubble -----
  function addMessage(text, sender = 'bot', extraClass = '') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender} ${extraClass}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    if (sender === 'bot') {
      avatar.innerHTML = '<i class="fas fa-robot"></i>';
    } else {
      avatar.innerHTML = '<i class="fas fa-user"></i>';
    }

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    // simple markdown-like parsing for bold ** **
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    bubble.innerHTML = formattedText;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
  }

  // ----- Show / remove typing indicator -----
  function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="avatar"><i class="fas fa-robot"></i></div>
        <div class="dots">
          <span></span><span></span><span></span>
        </div>
      `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
  }

  function removeTyping() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  }

  // ----- Simulate "AI" response (movie recommendation + details) -----
  function generateBotResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    let reply = '';

    // ----- pattern matching (demo) -----
    if (lower.includes('sci-fi') || lower.includes('scifi') || lower.includes('science fiction')) {
      reply = `🎬 <strong>Interstellar</strong> (2014) · Dir: Christopher Nolan · Prod: Emma Thomas, Christopher Nolan<br> 
        🌍 Country: USA/UK · Genre: Sci-Fi, Drama · ⭐ 8.6/10<br>
        <span style="display:inline-block; margin-top:6px;">🧠 A team of explorers travel through a wormhole in space. Stunning visuals and profound themes. 
        Also check: <strong>Arrival</strong> (2016) · Dir: Denis Villeneuve · Prod: Dan Levine, Shawn Levy.</span>`;
    } else if (lower.includes('k-drama') || lower.includes('korean drama') || lower.includes('kdrama')) {
      reply = `🇰🇷 <strong>Crash Landing on You</strong> (2019) · Dir: Lee Jeong-hyo · Prod: Lee Ji-min, Ha Myung-hee<br>
        🌏 Country: South Korea · Genre: Romance, Comedy, Drama · ⭐ 8.7/10<br>
        <span style="display:inline-block; margin-top:6px;">💞 A South Korean heiress crash-lands in North Korea, where she meets a charismatic officer. 
        Great chemistry and production. Also: <strong>Goblin</strong> · Dir: Lee Eung-bok · Prod: Kim Hyun-jung.</span>`;
    } else if (lower.includes('bollywood') || lower.includes('hindi')) {
      reply = `🇮🇳 <strong>3 Idiots</strong> (2009) · Dir: Rajkumar Hirani · Prod: Vidhu Vinod Chopra<br>
        🌏 Country: India · Genre: Comedy, Drama · ⭐ 8.4/10<br>
        <span style="display:inline-block; margin-top:6px;">🎓 Two friends search for their lost college buddy. A heartwarming satire on the education system. 
        Also: <strong>Dangal</strong> · Dir: Nitesh Tiwari · Prod: Aamir Khan, Kiran Rao.</span>`;
    } else if (lower.includes('anime') || (lower.includes('fantasy') && lower.includes('anime'))) {
      reply = `🎌 <strong>Spirited Away</strong> (2001) · Dir: Hayao Miyazaki · Prod: Toshio Suzuki<br>
        🌏 Country: Japan · Genre: Animation, Fantasy · ⭐ 8.6/10<br>
        <span style="display:inline-block; margin-top:6px;">🌀 A young girl navigates a mysterious spirit world. Masterpiece by Studio Ghibli. 
        Also: <strong>Your Name</strong> · Dir: Makoto Shinkai · Prod: Kōichirō Itō.</span>`;
    } else if (lower.includes('nolan') || lower.includes('christopher nolan')) {
      reply = `🎥 <strong>Inception</strong> (2010) · Dir: Christopher Nolan · Prod: Emma Thomas, Christopher Nolan<br>
        🌍 Country: USA/UK · Genre: Sci-Fi, Action · ⭐ 8.8/10<br>
        <span style="display:inline-block; margin-top:6px;">🌀 A thief who steals corporate secrets through dream-sharing tech. Mind-bending. 
        Also: <strong>The Dark Knight</strong> · Dir: Nolan · Prod: Emma Thomas, Charles Roven.</span>`;
    } else if (lower.includes('director') || lower.includes('producer') || lower.includes('country')) {
      reply = `📽️ I can share director/producer details! For example: <br>
        <strong>Parasite</strong> (2019) · Dir: Bong Joon-ho · Prod: Kwak Sin-ae, Bong Joon-ho<br>
        🇰🇷 Country: South Korea · Genre: Thriller, Drama · ⭐ 8.5/10<br>
        <span style="display:inline-block; margin-top:6px;">🏆 Won 4 Oscars, including Best Picture. A must-watch.</span>`;
    } else if (lower.includes('romance') || lower.includes('romantic')) {
      reply = `❤️ <strong>La La Land</strong> (2016) · Dir: Damien Chazelle · Prod: Fred Berger, Jordan Horowitz, Marc Platt<br>
        🌍 Country: USA · Genre: Musical, Romance · ⭐ 8.0/10<br>
        <span style="display:inline-block; margin-top:6px;">🎶 A jazz pianist and an actress fall in love while chasing their dreams in LA. 
        Also: <strong>Eternal Sunshine</strong> · Dir: Michel Gondry · Prod: Anthony Bregman, Steve Golin.</span>`;
    } else if (lower.includes('action') || lower.includes('thriller')) {
      reply = `🔥 <strong>Mad Max: Fury Road</strong> (2015) · Dir: George Miller · Prod: George Miller, Doug Mitchell<br>
        🌍 Country: Australia/USA · Genre: Action, Adventure · ⭐ 8.1/10<br>
        <span style="display:inline-block; margin-top:6px;">🚗 In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler. High-octane. 
        Also: <strong>John Wick</strong> · Dir: Chad Stahelski · Prod: Basil Iwanyk, David Leitch.</span>`;
    } else {
      // fallback : generic but still rich
      reply = `🎞️ I found some interesting titles for you! <br>
        <strong>Everything Everywhere All at Once</strong> (2022) · Dir: Daniel Kwan, Daniel Scheinert · Prod: Daniels, Jonathan Wang<br>
        🌏 Country: USA · Genre: Sci-Fi, Comedy, Drama · ⭐ 8.0/10<br>
        <span style="display:inline-block; margin-top:6px;">🌀 An aging Chinese immigrant gets swept up in an insane adventure. Multiverse madness. 
        Also: <strong>Past Lives</strong> (2023) · Dir: Celine Song · Prod: David Hinojosa, Christine Vachon.</span>`;
    }

    return reply;
  }

  // ----- Process user message (public) -----
  function processUserMessage(message) {
    if (isProcessing) return;
    if (!message || message.trim() === '') return;

    const clean = message.trim();
    // add user message
    addMessage(clean, 'user');

    // clear input
    userInput.value = '';
    isProcessing = true;

    // show typing
    showTyping();

    // simulate network delay (400-800ms)
    const delay = 450 + Math.random() * 400;
    setTimeout(() => {
      removeTyping();

      // generate bot response
      const botReply = generateBotResponse(clean);
      addMessage(botReply, 'bot');

      isProcessing = false;

      // after bot message, update quick chips with dynamic suggestions
      updateChips(clean);
    }, delay);
  }

  // ----- dynamic chip update based on context -----
  function updateChips(userMessage) {
    const lower = userMessage.toLowerCase();
    let chips = [];
    if (lower.includes('sci-fi') || lower.includes('scifi')) {
      chips = ['Dune', 'Blade Runner', 'Ex Machina'];
    } else if (lower.includes('k-drama') || lower.includes('korean')) {
      chips = ['Reply 1988', 'Kingdom', 'Itaewon Class'];
    } else if (lower.includes('bollywood')) {
      chips = ['Lagaan', 'Dilwale Dulhania', 'Gangs of Wasseypur'];
    } else if (lower.includes('anime')) {
      chips = ['Attack on Titan', 'Demon Slayer', 'Cowboy Bebop'];
    } else if (lower.includes('action')) {
      chips = ['The Raid', 'Die Hard', 'Mission Impossible'];
    } else {
      // default: more general
      chips = ['Sci‑Fi thriller', 'K‑Drama romance', 'Bollywood action', 'Anime fantasy', 'Nolan films'];
    }

    // rebuild chip container
    quickChips.innerHTML = '';
    chips.forEach(label => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = `<i class="fas fa-magic" style="font-size: 0.6rem;"></i> ${label}`;
      chip.dataset.query = label;
      quickChips.appendChild(chip);
    });
  }

  // ----- Event listeners -----
  function handleSend() {
    const text = userInput.value.trim();
    if (text) processUserMessage(text);
  }

  sendBtn.addEventListener('click', handleSend);

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });

  // chip click → fill input & send
  quickChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const query = chip.dataset.query || chip.innerText.trim();
    if (query) {
      userInput.value = query;
      handleSend();
    }
  });

  // focus input on load
  userInput.focus();

  // add a small instruction after load
  setTimeout(() => {
    scrollToBottom();
  }, 100);

  // expose for debugging
  window.__chat = { processUserMessage };

})();
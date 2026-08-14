// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Nav background on scroll
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Scroll-spy : active le lien de la section visible à l'écran 
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const sections = Array.from(navLinks)
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === id);
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
sections.forEach(section => spyObserver.observe(section));

// Séquence de boot du terminal (personnalisée) 
const bootLines = [
  { prompt: '$', cmd: 'whoami' },
  { out: 'mamadou.tine' },
  { prompt: '$', cmd: 'id' },
  { out: 'groups=dev,cybersecurite,tdsi-l3' },
  { prompt: '$', cmd: 'scan --target=localhost --deep' },
  { out: '3 services actifs · 0 faille critique' },
  { prompt: '$', cmd: 'status --check' },
  { ok: 'handshake ok · accès autorisé' },
];

const body = document.querySelector('.terminal-body');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function renderStatic() {
  body.innerHTML = bootLines.map(l => {
    if (l.cmd) return `<p class="tline"><span class="prompt">${l.prompt}</span> ${l.cmd}</p>`;
    if (l.ok) return `<p class="tline"><span class="ok">${l.ok}</span></p>`;
    return `<p class="tline"><span class="out">${l.out}</span></p>`;
  }).join('');
}

async function typeSequence() {
  body.innerHTML = '';
  for (const line of bootLines) {
    const p = document.createElement('p');
    p.className = 'tline';
    body.appendChild(p);

    if (line.cmd) {
      const promptSpan = document.createElement('span');
      promptSpan.className = 'prompt';
      promptSpan.textContent = line.prompt + ' ';
      p.appendChild(promptSpan);
      const textNode = document.createElement('span');
      p.appendChild(textNode);
      for (let i = 0; i <= line.cmd.length; i++) {
        textNode.textContent = line.cmd.slice(0, i);
        await sleep(32);
      }
      await sleep(220);
    } else {
      const span = document.createElement('span');
      span.className = line.ok ? 'ok' : 'out';
      span.textContent = line.ok || line.out;
      p.appendChild(span);
      await sleep(260);
    }
  }
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.textContent = '▌';
  body.lastElementChild.appendChild(cursor);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

if (body) {
  if (prefersReduced) {
    renderStatic();
  } else {
    (async () => {
      await sleep(600);
      while (true) {
        await typeSequence();
        await sleep(2800);   // Pour laisser la séquence affichée un moment
      }
    })();
  }
}

// Badge photo : affiche les initiales si aucune image n'est fournie 
const badgePhoto = document.querySelector('.badge-photo');
const badgeImg = document.getElementById('badgePhotoImg');
if (badgePhoto && badgeImg) {
  badgeImg.addEventListener('error', () => badgePhoto.classList.add('no-photo'));
  if (!badgeImg.currentSrc && badgeImg.complete && badgeImg.naturalWidth === 0) {
    badgePhoto.classList.add('no-photo');
  }
}

// Scroll reveal
const revealTargets = document.querySelectorAll('.skill-card, .project-card, .fact-list, .about-links, .contact-form, .id-badge');
revealTargets.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => io.observe(el));

// Contact form 
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    status.textContent = '⚠ Vérifie les champs du formulaire.';
    return;
  }

  const name = document.getElementById('fname').value;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  status.textContent = '… Envoi en cours';

  try {
    const response = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    });
    if (!response.ok) throw new Error('Réponse serveur invalide');
    status.textContent = `✓ Merci ${name}, message envoyé`;
    form.reset();
  } catch (err) {
    status.textContent = '⚠ Échec de l\'envoi — réessaie, ou écris-moi directement à tinemamadou636@gmail.com';
  } finally {
    submitBtn.disabled = false;
  }
});


// FOND RÉSEAU ANIMÉ 

(function netBackground() {
  const canvas = document.getElementById('netBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes, pulses, rings, drops;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HEX = '0123456789ABCDEF';

  function resize() {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }

  function initNodes() {
    const count = Math.max(26, Math.min(75, Math.floor((window.innerWidth * window.innerHeight) / 24000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.16 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.16 * devicePixelRatio,
      r: (Math.random() < 0.18 ? 2.4 : 1.4) * devicePixelRatio,
      amber: Math.random() < 0.28
    }));
    pulses = [];
    rings = [];

    const dropCount = Math.max(8, Math.min(18, Math.floor(window.innerWidth / 140)));
    drops = Array.from({ length: dropCount }, () => makeDrop());
  }

  function makeDrop() {
    return {
      x: Math.random() * w,
      y: Math.random() * h - h,
      speed: (0.35 + Math.random() * 0.5) * devicePixelRatio,
      char: HEX[Math.floor(Math.random() * HEX.length)],
      swap: 40 + Math.random() * 60,
      life: 0,
      amber: Math.random() < 0.3
    };
  }

  function maybeSpawnPulse() {
    if (Math.random() > 0.045 || nodes.length < 2) return;
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    let closest = null, closestDist = Infinity;
    for (const b of nodes) {
      if (b === a) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < closestDist && d < 180 * devicePixelRatio) { closest = b; closestDist = d; }
    }
    if (closest) pulses.push({ a, b: closest, t: 0, amber: Math.random() < 0.4 });
  }

  function maybeSpawnRing() {
    if (Math.random() > 0.006 || !nodes.length) return;
    const n = nodes[Math.floor(Math.random() * nodes.length)];
    rings.push({ x: n.x, y: n.y, r: 0, amber: n.amber });
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    const linkDist = 150 * devicePixelRatio;

    // digital rain hex glyphs — accent très discret, esprit "hacking"
    ctx.font = `${11 * devicePixelRatio}px 'JetBrains Mono', monospace`;
    ctx.textBaseline = 'middle';
    for (const d of drops) {
      d.y += d.speed;
      d.life++;
      if (d.life > d.swap) { d.char = HEX[Math.floor(Math.random() * HEX.length)]; d.life = 0; }
      if (d.y > h + 20) { Object.assign(d, makeDrop(), { y: -20 }); }
      const fade = 1 - Math.min(1, Math.abs((d.y / h) - 0.5) * 1.3);
      ctx.fillStyle = d.amber
        ? `rgba(255,176,0,${0.16 * Math.max(0, fade)})`
        : `rgba(0,217,255,${0.16 * Math.max(0, fade)})`;
      ctx.fillText(d.char, d.x, d.y);
    }

    // déplacement des nœuds
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }

    // liens
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          ctx.strokeStyle = `rgba(0,217,255,${0.11 * (1 - dist / linkDist)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // paquets de données voyageant sur les liens 
    maybeSpawnPulse();
    pulses = pulses.filter(p => p.t < 1);
    for (const p of pulses) {
      p.t += 0.018;
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.beginPath();
      ctx.arc(x, y, 2.1 * devicePixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = p.amber ? 'rgba(255,176,0,0.85)' : 'rgba(0,217,255,0.9)';
      ctx.shadowColor = p.amber ? 'rgba(255,176,0,0.8)' : 'rgba(0,217,255,0.8)';
      ctx.shadowBlur = 8 * devicePixelRatio;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // anneaux radar occasionnels (détection)
    maybeSpawnRing();
    rings = rings.filter(r => r.r < 70 * devicePixelRatio);
    for (const r of rings) {
      r.r += 0.55 * devicePixelRatio;
      const alpha = Math.max(0, 0.35 * (1 - r.r / (70 * devicePixelRatio)));
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = r.amber ? `rgba(255,176,0,${alpha})` : `rgba(0,217,255,${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // nœuds
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.amber ? 'rgba(255,176,0,0.6)' : 'rgba(0,217,255,0.6)';
      ctx.fill();
    }
  }

  function loop() {
    step();
    requestAnimationFrame(loop);
  }

  resize();
  initNodes();
  if (isReduced) {
    step();
  } else {
    loop();
  }

  window.addEventListener('resize', () => { resize(); initNodes(); }, { passive: true });
})();


// TILT 3D + SPOTLIGHT — cartes compétences / projets

(function tiltEffect() {
  const cards = document.querySelectorAll('[data-tilt]');
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * 8;
      const ry = (px - 0.5) * 10;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  });
})();


// TEXT SCRAMBLE — titres de projets (effet "déchiffrement")

(function scrambleTitles() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890#$%&/\\';
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('[data-scramble]');

  function scramble(el) {
    const final = el.dataset.scramble;
    if (isReduced) { el.textContent = final; return; }
    let frame = 0;
    const totalFrames = 18;
    const timer = setInterval(() => {
      frame++;
      let out = '';
      for (let i = 0; i < final.length; i++) {
        if (final[i] === ' ') { out += ' '; continue; }
        const revealFrame = (i / final.length) * totalFrames;
        out += frame >= revealFrame ? final[i] : chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (frame >= totalFrames) clearInterval(timer);
    }, 28);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        scramble(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  targets.forEach(el => io.observe(el));
})();


// BARRES D'INTÉGRITÉ — se remplissent à l'entrée dans le viewport

(function integrityBars() {
  const bars = document.querySelectorAll('.integrity-bar');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target.dataset.integrity || '80';
        entry.target.style.setProperty('--target', `${target}%`);
        entry.target.classList.add('is-charged');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => io.observe(b));
})();
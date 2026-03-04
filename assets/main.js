
// ---- IMAGE DATA ----
const HERO_SRC = 'assets/images/hero.jpg';
const LOGO_SRC = 'assets/images/logo.jpg';

function initImages() {
  document.getElementById('heroImg').src = HERO_SRC;
  document.getElementById('logoImg').src = LOGO_SRC;
  document.getElementById('footerLogo').src = LOGO_SRC;
  const dl = document.getElementById('drawerLogo');
  if (dl) dl.src = LOGO_SRC;
}
// Set images immediately (don't wait for load event)
initImages();

// ---- PAGE ROUTING ----
const pages = ['home','agenda','reunioes','sobre'];
function showPage(name) {
  pages.forEach(p => {
    const el = document.getElementById('page-'+p);
    if(el) el.classList.toggle('active', p===name);
  });
  ['home','sobre','reunioes','agenda','galeria'].forEach(n => {
    const el = document.getElementById('nav-'+n);
    if(el) el.classList.toggle('active', n===name);
  });
  try{window.scrollTo({top:0,behavior:'smooth'});}catch(e){window.scrollTo(0,0);}
  closeMobile();
  setTimeout(initReveal, 150);
}
function navGaleria() {
  showPage('home');
  setTimeout(() => {
    const el = document.getElementById('galeria');
    if(el) el.scrollIntoView({behavior:'smooth'});
  }, 200);
}
function scrollToSection(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
  }, 100);
}

// ---- HEADER SCROLL ----
window.addEventListener('scroll', () => {
  document.getElementById('main-header').classList.toggle('scrolled', window.scrollY > 60);
});

// ---- DARK MODE ----
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
}

// ---- QUICK ACCESS ----
document.getElementById('quickAccessBtn').addEventListener('click', () => {
  document.getElementById('overlayBg').classList.add('open');
  document.getElementById('quickPanel').classList.add('open');
});
function closeOverlay() {
  document.getElementById('overlayBg').classList.remove('open');
  document.getElementById('quickPanel').classList.remove('open');
}

// ---- MOBILE MENU ----
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
  document.getElementById('mobileOverlay').classList.toggle('open');
  // Sync drawer logo
  const dl = document.getElementById('drawerLogo');
  if (dl && !dl.src.includes('base64')) {
    dl.src = LOGO_SRC;
  }
}
function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('mobileOverlay').classList.remove('open');
}

// ---- CAROUSEL (infinite loop) ----
const cTrack = document.getElementById('cTrack');
const cDotsEl = document.getElementById('cDots');
let cCur = 0;
let cAutoTimer = null;

function cVis() {
  return window.innerWidth < 768 ? 1 : window.innerWidth < 1100 ? 2 : 3;
}

function buildCarousel() {
  // Remove old clones
  cTrack.querySelectorAll('.tcard-clone').forEach(el => el.remove());
  const origCards = Array.from(cTrack.querySelectorAll('.tcard:not(.tcard-clone)'));
  const vis = cVis();
  // Clone cards for infinite feel
  origCards.slice(0, vis).forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('tcard-clone');
    cTrack.appendChild(clone);
  });
  origCards.slice(-vis).forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('tcard-clone');
    cTrack.insertBefore(clone, cTrack.firstChild);
  });
  cCur = vis; // start after prepended clones
  cTrack.style.transition = 'none';
  updateCarouselPos(false);
}

function getCards() { return Array.from(cTrack.querySelectorAll('.tcard')); }

function updateCarouselPos(animated = true) {
  const cards = getCards();
  if (!cards.length) return;
  const gap = 22;
  const vis = cVis();
  const trackWidth = cTrack.parentElement.offsetWidth;
  const cardWidth = (trackWidth - gap * (vis - 1)) / vis;
  cards.forEach(c => { c.style.flex = `0 0 ${cardWidth}px`; c.style.maxWidth = `${cardWidth}px`; });
  const offset = cCur * (cardWidth + gap);
  if (!animated) {
    cTrack.style.transition = 'none';
  } else {
    cTrack.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
  }
  cTrack.style.transform = `translateX(-${offset}px)`;
  updateDots();
}

function updateDots() {
  const origCards = cTrack.querySelectorAll('.tcard:not(.tcard-clone)');
  const vis = cVis();
  const clonesBefore = vis;
  const realIdx = ((cCur - clonesBefore) % origCards.length + origCards.length) % origCards.length;
  document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === realIdx));
}

function cGo(dir) {
  cCur += dir;
  cTrack.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
  updateCarouselPos(true);
  // Handle wrap-around
  const origCards = Array.from(cTrack.querySelectorAll('.tcard:not(.tcard-clone)'));
  const vis = cVis();
  const total = origCards.length + vis * 2;
  cTrack.addEventListener('transitionend', function handler() {
    cTrack.removeEventListener('transitionend', handler);
    if (cCur <= vis - 1) {
      cCur = origCards.length + vis - 1;
      updateCarouselPos(false);
    } else if (cCur >= origCards.length + vis) {
      cCur = vis;
      updateCarouselPos(false);
    }
  });
}

function cGoDot(realIdx) {
  const vis = cVis();
  cCur = realIdx + vis;
  updateCarouselPos(true);
}

// Build dots
const origCount = cTrack.querySelectorAll('.tcard').length;
for (let i = 0; i < origCount; i++) {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  d.onclick = () => cGoDot(i);
  cDotsEl.appendChild(d);
}

document.getElementById('cPrev').onclick = () => { clearInterval(cAutoTimer); cGo(-1); startAuto(); };
document.getElementById('cNext').onclick = () => { clearInterval(cAutoTimer); cGo(1); startAuto(); };

function startAuto() {
  cAutoTimer = setInterval(() => cGo(1), 4500);
}

window.addEventListener('load', () => { buildCarousel(); startAuto(); });
window.addEventListener('resize', () => { buildCarousel(); });

// ---- FAQ ----
function toggleFaq(item) {
  const open = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(e=>e.classList.remove('open'));
  if(!open) item.classList.add('open');
}

// ---- FORM ----
function submitForm() {
  const nome = document.getElementById('f-nome').value.trim();
  const tel = document.getElementById('f-tel').value.trim();
  const check = document.getElementById('f-check').checked;
  if(!nome || !tel) { alert('Por favor preencha nome e WhatsApp.'); return; }
  if(!check) { alert('Por favor aceite os termos para continuar.'); return; }
  document.getElementById('formWrap').style.display='none';
  document.getElementById('successMsg').classList.add('show');
  try{window.scrollTo({top:0,behavior:'smooth'});}catch(e){window.scrollTo(0,0);}
}

// ---- CALENDAR ----
const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const eventDays = [8,13,15,22,29];
let calYear=2026, calMonth=2;
function renderCal() {
  document.getElementById('calTitle').textContent = months[calMonth]+' '+calYear;
  const grid = document.getElementById('calDays');
  grid.innerHTML='';
  const first = new Date(calYear,calMonth,1).getDay();
  const days = new Date(calYear,calMonth+1,0).getDate();
  const today = new Date();
  for(let i=0;i<first;i++){
    const d=document.createElement('div');d.className='cal-day other-month';
    const prev=new Date(calYear,calMonth,0).getDate()-first+i+1;
    d.textContent=prev;grid.appendChild(d);
  }
  for(let i=1;i<=days;i++){
    const d=document.createElement('div');
    const isToday=today.getDate()===i&&today.getMonth()===calMonth&&today.getFullYear()===calYear;
    const hasEvent=eventDays.includes(i)&&calMonth===2&&calYear===2026;
    d.className='cal-day'+(isToday?' today':hasEvent?' has-event':'');
    d.textContent=i;grid.appendChild(d);
  }
}
function calNav(dir){
  calMonth+=dir;
  if(calMonth>11){calMonth=0;calYear++;}
  if(calMonth<0){calMonth=11;calYear--;}
  renderCal();
}
function addToCalendar(title, date) {
  const d = date.replace(/-/g,'');
  const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title+' - JOFA')}&dates=${d}/${d}&details=${encodeURIComponent('Evento do Grupo JOFA - Santuário de Nossa Senhora de Fátima, Rio Grande/RS')}&location=${encodeURIComponent('Santuário de Nossa Senhora de Fátima, Rio Grande, RS, Brasil')}`;
  window.open(url,'_blank');
}
renderCal();

// ---- REUNIÕES ----
const window.reunioesData = reunioesData = [
  {emoji:'🙏',bg:'linear-gradient(135deg,#1A3A6E,#7BAFD4)',photo:'',tag:'Fé & Vida',date:'22 de Fevereiro, 2026',title:'O Segredo de Fátima para os Jovens de Hoje',body:`<p>Neste encontro especial, o grupo JOFA mergulhou fundo na mensagem de Nossa Senhora de Fátima e explorou como as aparições de 1917 continuam relevantes para os jovens do século XXI.</p><p>Com dinâmicas de grupo, reflexões bíblicas e um tempo de adoração, cada jovem teve a oportunidade de reconhecer os "segredos" que Maria traz para a própria vida: oração, conversão e consagração ao Coração Imaculado.</p><p>O encontro terminou com uma reza do terço às 21h, seguido da tradicional confraternização com pizza. Foi uma noite inesquecível!</p>`},
  {emoji:'✝️',bg:'linear-gradient(135deg,#0D1B3E,#C9A84C)',photo:'',tag:'Oração',date:'15 de Fevereiro, 2026',title:'Adoração e Louvor — Uma Noite com Maria',body:`<p>A noite de adoração ao Santíssimo Sacramento foi um dos momentos mais marcantes do ano. A banda do JOFA preparou um setlist especial com músicas de louvor que levaram o grupo a uma experiência profunda de fé.</p><p>Intercalado com músicas, houve momentos de silêncio e testemunhos de jovens que compartilharam como a presença de Maria transformou suas vidas.</p><p>A celebração encerrou com a bênção do Santíssimo e uma oração final de consagração a Nossa Senhora.</p>`},
  {emoji:'🌟',bg:'linear-gradient(135deg,#2A5090,#A8CCDF)',photo:'',tag:'Reflexão',date:'08 de Fevereiro, 2026',title:'Como Dizer Sim? — O Fiat de Maria na Nossa Vida',body:`<p>Inspirados no "Fiat" de Maria — "Faça-se em mim segundo a Tua palavra" — os jovens refletiram sobre o que significa dizer sim a Deus nas escolhas do cotidiano.</p><p>Com dinâmicas criativas, os jovens exploraram momentos em que sentiram chamados a dizer sim: à amizade, ao serviço, à oração, aos estudos e às responsabilidades familiares.</p><p>Uma das falas mais marcantes da noite: "O sim de Maria não foi um sim fácil, mas foi um sim confiante. E é isso que Deus pede de nós também."</p>`},
  {emoji:'🎵',bg:'linear-gradient(135deg,#C9A84C,#1A3A6E)',photo:'',tag:'Louvor',date:'01 de Fevereiro, 2026',title:'Noite de Louvor e Adoração — JOFA ao Vivo',body:`<p>Para fechar o primeiro mês do ano, o JOFA preparou uma noite especial de música ao vivo! A banda formada pelos próprios jovens do grupo apresentou músicas autorais e versões especiais de clássicos do louvor católico.</p><p>O clima foi de pura celebração: a nave do santuário tomada de jovens que cantavam, oravam e testemunhavam a alegria de ser cristão.</p><p>No final, houve um momento de oração pelos novos membros que estavam participando pela primeira vez. Que Deus abençoe cada um!</p>`},
  {emoji:'❤️',bg:'linear-gradient(135deg,#1A2D5A,#7BAFD4)',photo:'',tag:'Família',date:'25 de Janeiro, 2026',title:'Amor de Verdade — Relacionamentos à Luz da Fé',body:`<p>Em um dos encontros mais esperados do semestre, o JOFA abriu espaço para um diálogo honesto e profundo sobre relacionamentos, amizades e o amor como vocação.</p><p>Com base no ensinamento de São João Paulo II sobre a "Teologia do Corpo", os jovens exploraram a diferença entre o amor verdadeiro e suas distorções culturais.</p><p>Foi um encontro que gerou muita reflexão, conversas espontâneas e até lágrimas de emoção. Afinal, todos queremos amar e ser amados de verdade!</p>`},
  {emoji:'🍕',bg:'linear-gradient(135deg,#7BAFD4,#0D1B3E)',photo:'',tag:'Confraternização',date:'18 de Janeiro, 2026',title:'Encontro de Abertura 2026 — Bem-vindos ao JOFA!',body:`<p>O primeiro encontro de 2026 foi marcado pelo acolhimento especial aos novos membros. Com dinâmicas de apresentação, muita risada e muita expectativa para o novo ano, o JOFA abriu suas portas com alegria!</p><p>O padre coordenador fez uma partilha sobre os planos para o ano: novos retiros, ações sociais, a festa de Fátima em maio e muito mais!</p><p>Após o encontro, o grupo foi para o tradicional jantar de pizza nas proximidades do santuário. Foi uma noite perfeita para começar o ano com o pé direito — e com muita graça!</p>`}
];

function openReuniao(i) {
  const r = reunioesData[i];
  const hero = document.getElementById('rdHeroImg');
  hero.style.background = r.bg;
  hero.style.display = 'flex';
  hero.style.alignItems = 'center';
  hero.style.justifyContent = 'center';
  hero.style.position = 'relative';
  hero.style.overflow = 'hidden';
  if (r.photo) {
    hero.innerHTML = `<img src="${r.photo}" style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;object-fit:cover;-webkit-object-fit:cover;">`;
  } else {
    hero.innerHTML = `<span style="font-size:64px">${r.emoji}</span>`;
  }
  document.getElementById('rdMeta').innerHTML = `<span class="rc-tag">${r.tag}</span><span class="rc-date">${r.date}</span>`;
  document.getElementById('rdTitle').textContent = r.title;
  document.getElementById('rdBody').innerHTML = r.body;
  document.getElementById('reunioesGrid').style.display='none';
  document.getElementById('reuniaoDetail').classList.add('visible');
  try{window.scrollTo({top:0,behavior:'smooth'});}catch(e){window.scrollTo(0,0);}
}
function closeReuniao() {
  document.getElementById('reunioesGrid').style.display='block';
  document.getElementById('reuniaoDetail').classList.remove('visible');
}

// INIT
// initImages already called immediately above

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });
}
window.addEventListener('load', initReveal);
// Re-init reveal on page switch - patch showPage
document.addEventListener('click', () => { setTimeout(initReveal, 200); });

// ======================================================
// ADMIN PANEL SYSTEM
// ======================================================

const ADMIN_PASSWORD = 'jofa2025';
let adminLoggedIn = false;
let activeTab = 'testemunhos';

window.testimonialsData = testimonialsData = [
  {id:1, quote:'No JOFA encontrei amigos que se tornaram família. Cada encontro me faz crescer como pessoa e como cristão.', name:'Lucas Pereira', age:'17 anos • membro há 2 anos', avatarColor:'linear-gradient(135deg,#7BAFD4,#1A2D5A)'},
  {id:2, quote:'Entrei com dúvidas sobre a fé e saí com certezas no coração. O JOFA me mostrou que ser jovem e católico é incrível!', name:'Ana Beatriz', age:'20 anos • membro há 3 anos', avatarColor:'linear-gradient(135deg,#C9A84C,#1A2D5A)'},
  {id:3, quote:'A Catequese do JOFA me abriu os olhos. As conversas são profundas mas leves ao mesmo tempo. Me apaixonei!', name:'Gabriel Santos', age:'19 anos • membro há 1 ano', avatarColor:'linear-gradient(135deg,#2A5090,#C9A84C)'},
  {id:4, quote:'Me sinto em casa toda vez que venho. O acolhimento aqui é diferente de qualquer lugar. É uma família que escolhi!', name:'Mariana Costa', age:'16 anos • membro há 4 anos', avatarColor:'linear-gradient(135deg,#7BAFD4,#0D1B3E)'},
  {id:5, quote:'Antes achava difícil conciliar fé e vida jovem. No JOFA aprendi que os dois andam juntos e se complementam lindamente.', name:'Rafael Mendes', age:'22 anos • fundador', avatarColor:'linear-gradient(135deg,#C9A84C,#7BAFD4)'}
];

window.galleryData = galleryData = [
  {id:1, label:'Encontro de Fé', bg:'linear-gradient(135deg,#1A3A6E,#7BAFD4)', src:''},
  {id:2, label:'Adoração', bg:'linear-gradient(135deg,#2A5090,#A8CCDF)', src:''},
  {id:3, label:'Retiro', bg:'linear-gradient(135deg,#0D1B3E,#C9A84C)', src:''},
  {id:4, label:'Serviço Social', bg:'linear-gradient(135deg,#1A2D5A,#7BAFD4)', src:''},
  {id:5, label:'Louvor', bg:'linear-gradient(135deg,#C9A84C,#1A3A6E)', src:''},
  {id:6, label:'Pizza 🍕', bg:'linear-gradient(135deg,#7BAFD4,#0D1B3E)', src:''}
];

window.eventsData = eventsData = [
  {id:1, day:'08', month:'Mar', tag:'encontro', title:'Encontro Semanal JOFA', details:'📍 Santuário de Fátima • ⏰ 19h30 — Tema: "A Alegria de Maria"', gcalDate:'2026-03-08'},
  {id:2, day:'13', month:'Mar', tag:'retiro', title:'Retiro de Quaresma — JOFA 2026', details:'📍 Casa de Retiro São Francisco • ⏰ Sábado, 8h às 18h', gcalDate:'2026-03-13'},
  {id:3, day:'15', month:'Mar', tag:'encontro', title:'Encontro Semanal JOFA', details:'📍 Santuário de Fátima • ⏰ 19h30 — Tema: "O Fiat de Maria"', gcalDate:'2026-03-15'},
  {id:4, day:'22', month:'Mar', tag:'missa', title:'Missa dos Jovens — Domingo de Ramos', details:'📍 Santuário de Fátima • ⏰ 10h00', gcalDate:'2026-03-22'},
  {id:5, day:'29', month:'Mar', tag:'social', title:'Visita ao Lar dos Idosos — Páscoa Solidária', details:'📍 Lar dos Idosos São Vicente • ⏰ 9h00', gcalDate:'2026-03-29'},
  {id:6, day:'05', month:'Abr', tag:'encontro', title:'Encontro Pós-Páscoa', details:'📍 Santuário de Fátima • ⏰ 19h30', gcalDate:'2026-04-05'},
  {id:7, day:'13', month:'Mai', tag:'especial', title:'Festa de Nossa Senhora de Fátima — 13 de Maio!', details:'📍 Santuário de Fátima • ⏰ Programação especial todo o dia!', gcalDate:'2026-05-13'}
];

// ---- RENDER FUNCTIONS ----
function renderTestimonials() {
  const track = document.getElementById('cTrack');
  if (!track) return;
  track.innerHTML = testimonialsData.map(t => `
    <div class="tcard">
      <p class="tcard-quote">"${t.quote}"</p>
      <div class="tcard-author">
        <div class="avatar" style="background:${t.avatarColor}">${t.name.charAt(0)}</div>
        <div><div class="author-name">${t.name}</div><div class="author-age">${t.age}</div></div>
      </div>
    </div>
  `).join('');
  setTimeout(() => { buildCarousel(); }, 60);
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = galleryData.map(g => `
    <div class="gitem">
      ${g.src
        ? `<img src="${g.src}" style="width:100%;height:100%;-webkit-object-fit:cover;object-fit:cover;display:block;" alt="${g.label}">`
        : `<div class="gph" style="background:${g.bg};width:100%;height:100%;"></div>`
      }
      <div class="gitem-overlay"></div>
      <div class="gitem-caption">${g.label}</div>
    </div>
  `).join('');
}

function renderEvents() {
  const list = document.getElementById('eventsList');
  if (!list) return;
  const tagClasses = {encontro:'tag-encontro',retiro:'tag-retiro',missa:'tag-missa',social:'tag-social',especial:'tag-retiro'};
  const tagLabels = {encontro:'Encontro',retiro:'Retiro',missa:'Missa Especial',social:'Ação Social',especial:'Especial'};
  list.innerHTML = eventsData.map(e => `
    <div class="event-card">
      <div class="event-date-badge"><div class="event-day">${e.day}</div><div class="event-month">${e.month}</div></div>
      <div class="event-info">
        <span class="event-tag ${tagClasses[e.tag]||'tag-encontro'}">${tagLabels[e.tag]||e.tag}</span>
        <div class="event-title">${e.title}</div>
        <div class="event-details">${e.details}</div>
        <div class="event-actions"><button class="btn-add" onclick="addToCalendar('${e.title.replace(/'/g,"\'")}','${e.gcalDate}')">+ Google Agenda</button></div>
      </div>
    </div>
  `).join('');
}

function reuniaoImgHtml(r, i) {
  var bgs = ['linear-gradient(135deg,#1A3A6E,#7BAFD4)','linear-gradient(135deg,#0D1B3E,#C9A84C)','linear-gradient(135deg,#2A5090,#A8CCDF)','linear-gradient(135deg,#C9A84C,#1A3A6E)','linear-gradient(135deg,#1A2D5A,#7BAFD4)','linear-gradient(135deg,#7BAFD4,#0D1B3E)'];
  var emojis = ['🙏','✝️','🌟','🎵','❤️','🍕'];
  var bg = r.bg || bgs[i % bgs.length];
  var inner = r.photo
    ? '<img src="' + r.photo + '" style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;-webkit-object-fit:cover;object-fit:cover;">'
    : '<span style="font-size:48px">' + (r.emoji || emojis[i % emojis.length]) + '</span>';
  return '<div class="rc-img-ph" style="background:' + bg + ';position:relative;overflow:hidden;">' + inner + '</div>';
}
function renderReunioes() {
  var grid = document.getElementById('reunioesGridInner');
  if (!grid) return;
  grid.innerHTML = reunioesData.map(function(r, i) {
    var excerpt = r.body.replace(/<[^>]+>/g,'').substring(0,120);
    return '<div class="reuniao-card-full" onclick="openReuniao(' + i + ')">'
      + reuniaoImgHtml(r, i)
      + '<div class="rc-body">'
      + '<div class="rc-meta"><span class="rc-tag">' + r.tag + '</span><span class="rc-date">' + r.date + '</span></div>'
      + '<div class="rc-title">' + r.title + '</div>'
      + '<div class="rc-excerpt">' + excerpt + '...</div>'
      + '<a class="rc-link">Ler resumo completo &rarr;</a>'
      + '</div></div>';
  }).join('');
}

function updateLastReuniao() {
  var el = document.getElementById('ultimaReuniao');
  if (!el || !reunioesData.length) return;
  var r = reunioesData[0];
  var excerpt = r.body.replace(/<[^>]+>/g,'').substring(0,200);
  var bg = r.bg || 'linear-gradient(135deg,#1A3A6E,#7BAFD4)';
  var imgHtml = r.photo
    ? '<img src="' + r.photo + '" style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;-webkit-object-fit:cover;object-fit:cover;">'
    : '<span style="font-size:52px">' + (r.emoji || '🙏') + '</span>';
  el.innerHTML = '<div class="reuniao-card-home reveal" style="cursor:pointer;" onclick="showPage(\'reunioes\')">'
    + '<div class="reuniao-img-placeholder" style="background:' + bg + ';display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">'
    + imgHtml + '</div>'
    + '<div>'
    + '<span class="reuniao-tag">' + (r.tag || 'Encontro Recente') + '</span>'
    + '<h3 class="reuniao-h">' + r.title + '</h3>'
    + '<p class="reuniao-p">' + excerpt + '...</p>'
    + '<a href="#" class="btn-outline" onclick="showPage(\'reunioes\');return false;">Ver Resumo Completo →</a>'
    + '</div></div>';
}
function renderAll() {
  renderTestimonials();
  renderGallery();
  renderEvents();
  renderReunioes();
  updateLastReuniao();
}

// ---- ADMIN OPEN/CLOSE ----
function openAdmin() {
  document.getElementById('adminPanel').classList.add('open');
  document.getElementById('adminOverlay').classList.add('open');
  if (!adminLoggedIn) {
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminContent').style.display = 'none';
    setTimeout(() => { const pw = document.getElementById('adminPassword'); if(pw) pw.focus(); }, 400);
  } else {
    showAdminContent();
  }
}
function closeAdmin() {
  document.getElementById('adminPanel').classList.remove('open');
  document.getElementById('adminOverlay').classList.remove('open');
  document.getElementById('adminPanel').style.right = '';
}
function checkAdmin() {
  const email = document.getElementById('adminEmail');
  const pw = document.getElementById('adminPassword');
  const btn = document.getElementById('adminLoginBtn');
  const err = document.getElementById('adminError');
  if (!pw || !email) return;
  if (btn) { btn.textContent = 'Entrando...'; btn.disabled = true; }
  if (err) err.style.display = 'none';
  if (typeof window.firebaseLogin === 'function') {
    window.firebaseLogin(email.value.trim(), pw.value).then(result => {
      if (btn) { btn.textContent = 'Entrar no Painel'; btn.disabled = false; }
      if (result.ok) {
        adminLoggedIn = true;
        showAdminContent();
      } else {
        if (err) { err.textContent = result.msg; err.style.display = 'block'; }
        pw.value = '';
        pw.style.borderColor = '#e04040';
        setTimeout(() => { pw.style.borderColor = ''; }, 2000);
      }
    });
  } else {
    // Fallback to local password if Firebase not loaded yet
    if (pw.value === ADMIN_PASSWORD) {
      adminLoggedIn = true;
      showAdminContent();
    } else {
      if (err) { err.style.display = 'block'; }
      pw.value = '';
      if (btn) { btn.textContent = 'Entrar no Painel'; btn.disabled = false; }
    }
  }
}
function showAdminContent() {
  document.getElementById('adminLogin').style.display = 'none';
  const ac = document.getElementById('adminContent');
  ac.style.cssText = 'display:flex;flex:1;overflow:hidden;flex-direction:column;';
  // update tab counts
  updateTabCounts();
  switchTab(activeTab, document.querySelector('.admin-tab.active'));
}
function updateTabCounts() {
  const counts = {testemunhos: testimonialsData.length, reunioes: reunioesData.length, galeria: galleryData.length, agenda: eventsData.length};
  document.querySelectorAll('.admin-tab').forEach(tab => {
    const t = tab.getAttribute('data-tab');
    const badge = tab.querySelector('.tab-count');
    if (badge && counts[t] !== undefined) badge.textContent = counts[t];
  });
}

function switchTab(tab, btn) {
  activeTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else { const el = document.querySelector(`.admin-tab[data-tab="${tab}"]`); if(el) el.classList.add('active'); }
  renderAdminTab(tab);
}

function renderAdminTab(tab) {
  const body = document.getElementById('adminBody');
  if (!body) return;
  if (tab === 'testemunhos') body.innerHTML = buildTestimonialsUI();
  else if (tab === 'reunioes') body.innerHTML = buildReunioesUI();
  else if (tab === 'galeria') body.innerHTML = buildGaleriaUI();
  else if (tab === 'agenda') body.innerHTML = buildAgendaUI();
}

// ---- TESTIMONIALS UI ----
function buildTestimonialsUI() {
  return `<div class="admin-section-hdr"><h3>💬 Testemunhos</h3><button class="admin-add-btn" onclick="addTestimonial()">+ Novo</button></div>` +
  testimonialsData.map((t,i) => `
    <div class="admin-card">
      <div class="admin-card-hdr">
        <div class="admin-card-num">${i+1}</div>
        <div class="admin-card-label">${t.name}</div>
        <div class="admin-card-btns">
          <button class="btn-save-sm" onclick="saveTestimonial(${i})">✓ Salvar</button>
          <button class="btn-del-sm" onclick="deleteTestimonial(${i})">🗑</button>
        </div>
      </div>
      <div class="admin-row">
        <div class="afield"><label>Nome</label><input id="t-name-${i}" value="${t.name}"></div>
        <div class="afield"><label>Idade / Tempo</label><input id="t-age-${i}" value="${t.age}"></div>
      </div>
      <div class="afield"><label>Testemunho</label><textarea id="t-quote-${i}">${t.quote}</textarea></div>
    </div>
  `).join('');
}
function addTestimonial() {
  testimonialsData.push({id:Date.now(),quote:'Escreva o testemunho aqui...',name:'Nome',age:'xx anos',avatarColor:'linear-gradient(135deg,#7BAFD4,#0D1B3E)'});
  renderAdminTab('testemunhos'); renderTestimonials(); updateTabCounts();
}
function saveTestimonial(i) {
  testimonialsData[i].name = document.getElementById('t-name-'+i).value;
  testimonialsData[i].age = document.getElementById('t-age-'+i).value;
  testimonialsData[i].quote = document.getElementById('t-quote-'+i).value;
  renderAdminTab('testemunhos'); renderTestimonials(); syncFirestore('✅ Testemunho salvo!');
}
function deleteTestimonial(i) {
  if (!confirm('Excluir este testemunho?')) return;
  testimonialsData.splice(i,1);
  renderAdminTab('testemunhos'); renderTestimonials(); updateTabCounts(); showToast('🗑️ Removido');
}

// ---- REUNIÕES UI ----
function buildReunioesUI() {
  return `<div class="admin-section-hdr"><h3>📖 Reuniões</h3><button class="admin-add-btn" onclick="addReuniao()">+ Nova</button></div>` +
  reunioesData.map((r,i) => `
    <div class="admin-card">
      <div class="admin-card-hdr">
        <div class="admin-card-num">${i+1}</div>
        <div class="admin-card-label">${r.title}</div>
        <div class="admin-card-btns">
          <button class="btn-save-sm" onclick="saveReuniao(${i})">✓ Salvar</button>
          <button class="btn-del-sm" onclick="deleteReuniao(${i})">🗑</button>
        </div>
      </div>
      <div class="admin-row">
        <div class="afield"><label>Categoria</label><input id="r-tag-${i}" value="${r.tag}"></div>
        <div class="afield"><label>Data</label><input id="r-date-${i}" value="${r.date}"></div>
      </div>
      <div class="afield"><label>Título</label><input id="r-title-${i}" value="${r.title}"></div>
      <div class="afield"><label>Conteúdo (HTML aceito)</label><textarea id="r-body-${i}" style="min-height:110px">${r.body.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea></div>
    </div>
  `).join('');
}
function addReuniao() {
  reunioesData.unshift({emoji:'🙏',bg:'linear-gradient(135deg,#1A3A6E,#7BAFD4)',photo:'',tag:'Novo',date:'xx de Mês, 2026',title:'Novo Encontro',body:'<p>Descreva o encontro aqui.</p>'});
  renderAdminTab('reunioes'); renderReunioes(); updateLastReuniao(); updateTabCounts(); showToast('➕ Reunião criada!');
}
function uploadReunitoImg(i, input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    reunioesData[i].photo = e.target.result;
    renderAdminTab('reunioes');
    renderReunioes();
    updateLastReuniao();
    showToast('📷 Foto da reunião carregada!');
  };
  reader.readAsDataURL(file);
}
function removeReunitoImg(i) {
  reunioesData[i].photo = '';
  renderAdminTab('reunioes');
  renderReunioes();
  updateLastReuniao();
  showToast('🗑️ Foto removida');
}
function saveReuniao(i) {
  reunioesData[i].tag = document.getElementById('r-tag-'+i).value;
  reunioesData[i].date = document.getElementById('r-date-'+i).value;
  reunioesData[i].title = document.getElementById('r-title-'+i).value;
  let body = document.getElementById('r-body-'+i).value;
  body = body.replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  reunioesData[i].body = body;
  renderAdminTab('reunioes'); renderReunioes(); updateLastReuniao(); syncFirestore('✅ Reunião salva!');
}
function deleteReuniao(i) {
  if (!confirm('Excluir esta reunião?')) return;
  reunioesData.splice(i,1);
  renderAdminTab('reunioes'); renderReunioes(); updateTabCounts(); showToast('🗑️ Removida');
}

// ---- GALERIA UI ----
function buildGaleriaUI() {
  return `<div class="admin-section-hdr"><h3>🖼️ Galeria</h3><button class="admin-add-btn" onclick="addGalleryItem()">+ Adicionar</button></div>
  <p style="font-size:.78rem;color:var(--text-mid);margin-bottom:14px;padding:0 2px;">Faça upload de fotos do seu dispositivo ou cole um link de imagem.</p>` +
  galleryData.map((g,i) => `
    <div class="admin-card">
      <div class="admin-card-hdr">
        <div class="admin-card-num">${i+1}</div>
        <div class="admin-card-label">${g.label}</div>
        <div class="admin-card-btns">
          <button class="btn-save-sm" onclick="saveGalleryItem(${i})">✓ Salvar</button>
          <button class="btn-del-sm" onclick="deleteGalleryItem(${i})">🗑</button>
        </div>
      </div>
      <div class="afield"><label>Legenda</label><input id="g-label-${i}" value="${g.label}"></div>
      <div class="img-preview" id="g-preview-${i}">
        ${g.src ? `<img src="${g.src}" alt="${g.label}">` : `<span style="color:var(--text-mid);font-size:.75rem;">Gradiente padrão — sem foto</span>`}
      </div>
      <div class="img-upload-area" style="margin-top:8px;">
        <input type="file" accept="image/*" onchange="uploadGalleryImg(${i},this)">
        <div class="upload-icon">📸</div>
        <p>Clique para fazer upload de foto</p>
      </div>
      <div class="afield" style="margin-top:8px;"><label>Ou cole uma URL</label><input type="url" id="g-src-${i}" value="${g.src&&!g.src.startsWith('data:')?g.src:''}" placeholder="https://..." onblur="applyGalleryUrl(${i})"></div>
    </div>
  `).join('');
}
function uploadGalleryImg(i, input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    galleryData[i].src = e.target.result;
    const prev = document.getElementById('g-preview-'+i);
    if (prev) prev.innerHTML = `<img src="${e.target.result}" alt="preview">`;
    renderGallery(); showToast('📷 Foto carregada!');
  };
  reader.readAsDataURL(file);
}
function applyGalleryUrl(i) {
  const val = document.getElementById('g-src-'+i).value.trim();
  if (!val) return;
  galleryData[i].src = val;
  const prev = document.getElementById('g-preview-'+i);
  if (prev) prev.innerHTML = `<img src="${val}" alt="preview" onerror="this.parentElement.innerHTML='<span>URL inválida</span>'">`;
  renderGallery(); showToast('🔗 URL aplicada!');
}
function saveGalleryItem(i) {
  galleryData[i].label = document.getElementById('g-label-'+i).value;
  renderGallery(); syncFirestore('✅ Foto salva!');
}
function addGalleryItem() {
  galleryData.push({id:Date.now(),label:'Nova Foto',bg:'linear-gradient(135deg,#1A3A6E,#7BAFD4)',src:''});
  renderAdminTab('galeria'); renderGallery(); updateTabCounts();
}
function deleteGalleryItem(i) {
  if (!confirm('Remover esta foto da galeria?')) return;
  galleryData.splice(i,1);
  renderAdminTab('galeria'); renderGallery(); updateTabCounts(); showToast('🗑️ Foto removida');
}

// ---- AGENDA UI ----
function buildAgendaUI() {
  const tagOpts = ['encontro','retiro','missa','social','especial'];
  return `<div class="admin-section-hdr"><h3>📅 Agenda</h3><button class="admin-add-btn" onclick="addEvent()">+ Novo</button></div>` +
  eventsData.map((e,i) => `
    <div class="admin-card">
      <div class="admin-card-hdr">
        <div class="admin-card-num">${i+1}</div>
        <div class="admin-card-label">${e.day}/${e.month} — ${e.title}</div>
        <div class="admin-card-btns">
          <button class="btn-save-sm" onclick="saveEvent(${i})">✓ Salvar</button>
          <button class="btn-del-sm" onclick="deleteEvent(${i})">🗑</button>
        </div>
      </div>
      <div class="admin-row cols3">
        <div class="afield"><label>Dia</label><input id="e-day-${i}" value="${e.day}" maxlength="2"></div>
        <div class="afield"><label>Mês</label><input id="e-month-${i}" value="${e.month}" maxlength="4"></div>
        <div class="afield"><label>Tipo</label><select id="e-tag-${i}">${tagOpts.map(t=>`<option value="${t}"${e.tag===t?' selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}</select></div>
      </div>
      <div class="admin-row">
        <div class="afield"><label>Título</label><input id="e-title-${i}" value="${e.title}"></div>
        <div class="afield"><label>Data (AAAA-MM-DD)</label><input type="date" id="e-gcal-${i}" value="${e.gcalDate||''}"></div>
      </div>
      <div class="afield"><label>Detalhes</label><input id="e-details-${i}" value="${e.details}"></div>
    </div>
  `).join('');
}
function addEvent() {
  eventsData.push({id:Date.now(),day:'01',month:'Jan',tag:'encontro',title:'Novo Evento',details:'📍 Local • ⏰ Horário',gcalDate:''});
  renderAdminTab('agenda'); renderEvents(); updateTabCounts();
}
function saveEvent(i) {
  eventsData[i].day = document.getElementById('e-day-'+i).value;
  eventsData[i].month = document.getElementById('e-month-'+i).value;
  eventsData[i].tag = document.getElementById('e-tag-'+i).value;
  eventsData[i].gcalDate = document.getElementById('e-gcal-'+i).value;
  eventsData[i].title = document.getElementById('e-title-'+i).value;
  eventsData[i].details = document.getElementById('e-details-'+i).value;
  renderAdminTab('agenda'); renderEvents(); syncFirestore('✅ Evento salvo!');
}
function deleteEvent(i) {
  if (!confirm('Excluir este evento?')) return;
  eventsData.splice(i,1);
  renderAdminTab('agenda'); renderEvents(); updateTabCounts(); showToast('🗑️ Removido');
}

// ---- SAVE ALL ----
function saveAllData() {
  renderAll();
  showToast('💾 Salvando no servidor...');
  if (typeof window.saveToFirestore === 'function') {
    window.saveToFirestore().then(ok => {
      if (ok) {
        showToast('🚀 Publicado e salvo com sucesso!');
      } else {
        showToast('⚠️ Salvo localmente (erro no servidor)');
      }
      setTimeout(closeAdmin, 800);
    });
  } else {
    showToast('🚀 Publicado com sucesso!');
    setTimeout(closeAdmin, 600);
  }
}

// ---- TOAST ----
function showToast(msg) {
  const t = document.getElementById('adminToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function syncFirestore(msg) {
  if (typeof window.saveToFirestore === 'function') {
    window.saveToFirestore().then(ok => {
      showToast(ok ? (msg || '✅ Salvo no servidor!') : '⚠️ Salvo localmente apenas');
    });
  }
}

// ---- INIT ----
renderAll();


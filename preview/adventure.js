/* Spellbound's combined adventure layer. All activities share learning-v2-spelling. */
let dailyActive = false;
state.pocket = Array.isArray(state.pocket) ? state.pocket : [];
state.stories = Array.isArray(state.stories) ? state.stories : [];
state.badges = Array.isArray(state.badges) ? state.badges : [];
state.pocket=state.pocket.filter(w=>typeof w==='string');
state.stories=state.stories.filter(s=>s&&typeof s.text==='string'&&typeof s.title==='string');
if(state.mission&&(!state.mission.session||!Array.isArray(state.mission.session.deck)||!Array.isArray(state.mission.found)||!['spell','discover','create','done'].includes(state.mission.stage)))state.mission=null;
state.nookName = typeof state.nookName === 'string' ? state.nookName : 'My riverside nook';

// Both GitHub Pages repositories share an origin. Import the old Capy totals once,
// without removing the source record. Different origins cannot share browser data.
if (!state.capyImported) {
  try {
    const previous = JSON.parse(localStorage.getItem('learning-preview-v1-words'));
    if (previous && typeof previous === 'object') {
      const count = value => Number.isFinite(value) && value >= 0 ? value : 0;
      state.sessions += count(previous.sessions);
      state.stars += count(previous.stars);
      state.days = [...new Set([...state.days, ...(Array.isArray(previous.days) ? previous.days.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)) : [])])];
      if (previous.skills?.words) {
        const old = previous.skills.words;
        const current = state.skills.words || { independent: 0, supported: 0, completed: 0 };
        state.skills.words = Object.fromEntries(['independent', 'supported', 'completed'].map(k => [k, count(current[k]) + count(old[k])]));
      }
    }
    state.capyImported = true;
    save();
  } catch { /* Keep the old record untouched if it cannot be read. */ }
}

const dailyPlaces = [
  { title: 'The river of hidden words', anchor: 'rain', rack: 'RAINST', topic: 'vowels', badge: 'River explorer', story: 'Capy discovers a tiny boat after the rain. Where does it lead?' },
  { title: 'A message from the island', anchor: 'ship', rack: 'SHIPOT', topic: 'sounds', badge: 'Island explorer', story: 'A little ship arrives with a mysterious message for Capy. What does it say?' },
  { title: 'Beyond the garden gate', anchor: 'boat', rack: 'BOATSR', topic: 'vowels', badge: 'Garden explorer', story: 'Capy finds a boat behind the garden gate. Who is waiting inside?' }
];
function todayPlace() {
  const d = new Date();
  const index = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) % dailyPlaces.length;
  return dailyPlaces[index];
}
function rememberWord(word) {
  if (!state.pocket.includes(word)) state.pocket.push(word);
  save();
}
function wordGoal() { return dailyActive ? 3 : 5; }
function coach(message) {
  return `<aside class="capy-coach"><img src="capy-garden-v2.png" alt="Capy, your word companion"><div><span class="eyebrow">Capy says</span><p>${esc(message)}</p></div></aside>`;
}
function missionSteps(stage) {
  const at = ['spell', 'discover', 'create', 'done'].indexOf(stage);
  return `<ol class="mission-steps" aria-label="Adventure stages">${['Spell', 'Discover', 'Create'].map((label, i) => `<li class="${i < at ? 'done' : i === at ? 'current' : ''}"><span>${i < at ? '✓' : i + 1}</span>${label}</li>`).join('')}</ol>`;
}
function missionForHome() {
  return state.mission && (state.mission.stage !== 'done' || state.mission.date === day()) ? state.mission : null;
}
function homeAdventure() {
  dailyActive = false;
  const m = missionForHome(), place = m || todayPlace();
  const completed = m?.stage === 'done';
  view(`<section class="adventure-topline"><span class="eyebrow">Your word world</span><div class="row"><span class="counter">✦ ${state.stars} stars</span><span class="counter">${streak()}-day streak</span></div></section>
    <section class="adventure-hero" aria-label="Today's adventure">
      <img class="world-art" src="capy-garden-v2.png" alt="Capy waits beside a magical river, with a treehouse and a little boat" fetchpriority="high">
      <div class="mission-card"><span class="eyebrow">${completed ? 'Today’s adventure · Complete' : 'Today’s adventure · About 5–8 minutes'}</span>
        <h1>${esc(place.title)}</h1><p>${completed ? 'Your explorer stamp is in your nook. There are more words to discover whenever you like.' : 'Capy’s ready. Bring a few words, follow your curiosity and make a little story.'}</p>
        ${missionSteps(m?.stage || 'spell')}
        <button class="btn gold" id="daily-start">${completed ? 'Visit my nook' : m ? 'Continue adventure' : 'Let’s go, Capy'} <span aria-hidden="true">→</span></button>
        <span class="mission-note">No timer. A helping paw whenever you need it.</span>
      </div>
    </section>
    <div class="adventure-columns"><section><div class="section-title"><h2>Choose your own trail</h2><span class="muted">Every trail is open</span></div>
      <div class="trail-list">${SpellingTopics.map((t, i) => `<button class="trail" data-topic="${t.id}"><span class="trail-node">${t.icon}</span><span class="trail-copy"><strong>${t.title}</strong><span>${t.desc}</span></span><span class="trail-end">${state.skills[t.id]?.completed ? '✓' : '→'}</span></button>`).join('')}</div>
    </section><aside class="side-quests"><article class="discovery-invite"><span class="eyebrow">A pocketful of possibilities</span><div class="sample-tiles" aria-hidden="true"><span>W</span><span>O</span><span>R</span><span>D</span></div><h2>What’s hiding in the letters?</h2><p>Visit Capy’s word discovery. Find five words, or follow a clue when you’re stuck.</p><button class="btn" id="free-discovery">Go exploring</button></article>
      <article class="nook-invite"><span class="eyebrow">A place of your own</span><h2>${esc(state.nookName)}</h2><p>${state.pocket.length} collected words · ${state.stories.length} adventure stories</p><button class="btn secondary" id="my-nook">Open my nook</button></article>
      <button class="journal-link" id="journal">Open my learning journal →</button>
    </aside></div>${notice()}`);
  document.getElementById('daily-start').onclick = completed ? collection : startDaily;
  document.getElementById('free-discovery').onclick = wordHome;
  document.getElementById('my-nook').onclick = collection;
  document.getElementById('journal').onclick = progress;
  main.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => start(b.dataset.topic));
}
home = homeAdventure;

function startDaily() {
  if (!missionForHome()) {
    const place = todayPlace();
    const anchorEntry = SpellWords[place.topic].find(w => w[0] === place.anchor);
    const due = Object.entries(SpellWords).flatMap(([topic, entries]) => entries.map(e => spellQuestion(topic, e)))
      .filter(q => q.word !== place.anchor && state.words[q.id]?.due <= Date.now())
      .sort((a, b) => state.words[a.id].due - state.words[b.id].due);
    const fresh = shuffle(SpellWords[place.topic].filter(e => e[0] !== place.anchor)).map(e => spellQuestion(place.topic, e));
    const unique = [...new Map([...due, ...fresh].map(q => [q.id, q])).values()];
    state.mission = { ...place, date: day(), stage: 'spell', found: [], draft: '',
      session: { topic: { id: 'daily', title: 'Words for the journey' }, deck: [...unique.slice(0, 2), spellQuestion(place.topic, anchorEntry)], index: 0, independent: 0, supported: 0, daily: true, finished: false } };
    save();
  }
  dailyActive = true;
  if (state.mission.stage === 'spell') {
    session = JSON.parse(JSON.stringify(state.mission.session));
    session.resumeHelped = session.helped;
    question();
  } else if (state.mission.stage === 'discover') resumeDiscovery();
  else if (state.mission.stage === 'create') dailyWriting();
  else { dailyActive = false; collection(); }
}
function checkpointSpelling() {
  if (!dailyActive || !session?.daily || state.mission?.stage !== 'spell') return;
  const snapshot = JSON.parse(JSON.stringify(session));
  if (snapshot.finished) { snapshot.index++; snapshot.finished = false; snapshot.helped = false; }
  state.mission.session = snapshot;
  save();
}
const basicQuestion = question;
question = function () {
  const resumedSupport = session?.resumeHelped;
  if (session) delete session.resumeHelped;
  basicQuestion();
  if (resumedSupport) session.helped = true;
  if (document.getElementById('spell-form')) {
    const item = session.deck[session.index];
    document.getElementById('explain').textContent = 'Study this word';
    // Label supports by the actual word's topic, including in mixed daily practice.
    const helpText = item.review ? 'A familiar word! See what you remember. My hints are still here.' : 'Say it, listen for the sounds, then have a go. We can work it out together.';
    document.querySelector('.question').insertAdjacentHTML('beforebegin', `${dailyActive ? missionSteps('spell') : ''}${coach(helpText)}`);
    document.getElementById('exit').onclick = () => { checkpointSpelling(); home(); };
  }
};
const basicStudy = studyWord;
studyWord = function (item) {
  const originalId = session.topic.id;
  session.topic.id = item.topic;
  basicStudy(item);
  session.topic.id = originalId;
};
const basicAnswer = answer;
answer = function (value, button) {
  const wasFinished = session.finished;
  basicAnswer(value, button);
  if (!wasFinished && session.finished) {
    const item = session.deck[session.index];
    if (item.kind === 'spell') rememberWord(item.word);
    document.querySelector('.question')?.classList.add('little-win');
    checkpointSpelling();
  }
};
const basicFinish = finish;
finish = function () {
  if (dailyActive && session?.daily && state.mission?.stage === 'spell') {
    state.mission.stage = 'discover';
    state.mission.session = JSON.parse(JSON.stringify(session));
    save();
    view(`<section class="session stage-complete"><span class="stamp">✓</span><span class="eyebrow">First stop complete</span><h1>You’ve packed your words.</h1>${coach(`Let’s take “${state.mission.anchor}” to the river. Can you find it hiding among the letters?`)}${missionSteps('discover')}<button class="btn gold" id="next-stage">Discover hidden words →</button><button class="btn quiet" id="stage-home">Save & leave</button></section>`);
    document.getElementById('next-stage').onclick = resumeDiscovery;
    document.getElementById('stage-home').onclick = home;
    return;
  }
  basicFinish();
};
function resumeDiscovery() {
  dailyActive = true;
  rack = state.mission.rack.split('');
  found = [...state.mission.found];
  used = []; built = []; wordHelped = false; wordAwarded = false; wordHint = '';
  wordPlay();
}
function checkpointDiscovery() {
  if (dailyActive && state.mission?.stage === 'discover') {
    state.mission.found = [...found];
    save();
  }
}
function finishDailyDiscovery() {
  checkpointDiscovery();
  state.mission.stage = 'create';
  save();
  view(`<section class="session stage-complete"><span class="stamp">✦</span><span class="eyebrow">Second stop complete</span><h1>Look what you discovered.</h1><div class="row word-pocket">${found.map(w => `<span class="word-chip">${esc(w)}</span>`).join('')}</div>${coach('Now the best bit. Let’s turn one of those words into a little adventure of our own.')}${missionSteps('create')}<button class="btn gold" id="create-next">Make a mini story →</button><button class="btn quiet" id="stage-home">Save & leave</button></section>`);
  document.getElementById('create-next').onclick = dailyWriting;
  document.getElementById('stage-home').onclick = home;
}
const basicCheckWord = checkWord;
checkWord = function () {
  const attempt = built.join('').toLowerCase();
  const previousCount = found.length;
  basicCheckWord();
  if (found.length > previousCount) {
    rememberWord(attempt);
    checkpointDiscovery();
  }
};
wordPlay = function () {
  // Keep the board in place on tile input: no scroll reset or lost keyboard focus.
  if (!document.getElementById('discovery-board')) {
    view(`<section class="session"><div class="session-head"><button class="btn quiet" id="leave">Save & leave</button><span class="pill">${dailyActive ? 'Daily adventure · Discover' : 'Word discovery'}</span><span id="word-count"></span></div>${dailyActive ? missionSteps('discover') : ''}
      ${coach(dailyActive ? `Find “${state.mission.anchor}” again, then discover two more words. You can rearrange the letters.` : 'Little words count too. Try moving the letters around. A clue is always here.')}
      <article class="question discovery-board" id="discovery-board"><span class="eyebrow">A pocketful of letters</span><h1>What’s hiding here?</h1><div class="word-built" aria-label="Your word" aria-live="polite" id="built-display"></div><div class="tiles" id="rack-tiles"></div><div class="row"><button class="btn" id="check-word">Found a word!</button><button class="btn quiet" id="back">⌫ Undo</button><button class="btn secondary" id="word-hint">A little clue</button></div><div class="feedback" id="feedback" role="status"></div><div class="found-heading">Your discoveries</div><div class="row" id="found-chips"></div></article><p class="caption">Use each tile once per word · Two or more letters · Keyboard or touch</p></section>`);
    document.getElementById('leave').onclick = () => { checkpointDiscovery(); home(); };
    document.getElementById('check-word').onclick = checkWord;
    document.getElementById('back').onclick = () => { used.pop(); built.pop(); wordPlay(); };
    document.getElementById('word-hint').onclick = () => {
      const possibilities = WordDictionary.filter(w => canBuild(w, rack) && !found.includes(w));
      const suggestion = dailyActive && !found.includes(state.mission.anchor) ? state.mission.anchor : possibilities.sort((a, b) => a.length - b.length)[0];
      wordHelped = true;
      wordHint = suggestion ? `Try ${suggestion.length} letters, starting with “${suggestion[0]}”. ${WordClues[suggestion] || 'Say it aloud as you move the letters.'}` : 'You found every word in this collection.';
      feedback(wordHint, 'help');
    };
  }
  document.getElementById('word-count').textContent = `${found.length} / ${wordGoal()} words`;
  document.getElementById('built-display').textContent = built.join('') || '…';
  document.getElementById('rack-tiles').innerHTML = rack.map((l, i) => `<button class="tile" data-tile="${i}" aria-label="Letter ${l}" ${used.includes(i) ? 'disabled' : ''}>${l}</button>`).join('');
  document.getElementById('found-chips').innerHTML = found.map(w => `<span class="word-chip">${esc(w)}</span>`).join('') || '<span class="muted">Your first discovery goes here.</span>';
  document.getElementById('check-word').disabled = built.length < 2;
  main.querySelectorAll('[data-tile]').forEach(b => b.onclick = () => { const i = Number(b.dataset.tile); used.push(i); built.push(rack[i]); wordPlay(); });
};

function dailyWriting() {
  dailyActive = true;
  const m = state.mission;
  view(`<section class="session"><div class="session-head"><button class="btn quiet" id="draft-leave">Save & leave</button><span class="pill">Daily adventure · Create</span></div>${missionSteps('create')}${coach('Your story can be funny, surprising or wonderfully strange. You’re the author.')}
    <article class="question"><span class="eyebrow">Your mini story</span><h1>${esc(m.story)}</h1><p class="muted">Write at least 20 words. Use one of your discoveries, then read your story back.</p><div class="row">${m.found.map(w => `<span class="word-chip">${esc(w)}</span>`).join('')}</div><label for="daily-story" class="sr-only">Your mini story</label><textarea id="daily-story" class="field" placeholder="Capy took a deep breath and…">${esc(m.draft)}</textarea><p id="writing-count" class="muted"></p><p><label><input type="checkbox" id="read-back"> I read it back and checked my spelling and punctuation.</label></p><button class="btn gold" id="finish-adventure">Finish my adventure ✦</button><div class="feedback" id="feedback" role="status"></div></article></section>`);
  const field = document.getElementById('daily-story');
  const update = () => { m.draft = field.value; save(); document.getElementById('writing-count').textContent = `${countWords(m.draft)} words · ${saveAvailable ? 'Draft saved' : 'Saving unavailable — copy your story somewhere safe'}`; };
  field.oninput = update;
  update();
  document.getElementById('draft-leave').onclick = home;
  document.getElementById('finish-adventure').onclick = () => {
    const words = m.draft.toLowerCase().match(/[a-z]+(?:['’][a-z]+)?/g) || [];
    if (countWords(m.draft) < 20) { feedback('Add a little more detail. Who is there? What happens next? Aim for at least 20 words.', 'help'); return; }
    if (!m.found.some(w => words.includes(w))) { feedback('Bring one of your discovered words into the story. Your word pocket above can help.', 'help'); return; }
    if (!document.getElementById('read-back').checked) { feedback('Read your story back once, then tick the check. You can improve any part you like.', 'help'); return; }
    finishAdventure();
  };
}
function countWords(text) { return (text.trim().match(/\S+/g) || []).length; }
function finishAdventure() {
  const m = state.mission;
  if (m.stage === 'done') return;
  m.stage = 'done';
  state.stories.push({ date: m.date, title: m.title, text: m.draft });
  if (!state.badges.includes(m.badge)) state.badges.push(m.badge);
  const p = state.skills.daily || { independent: 0, supported: 0, completed: 0 };
  p.completed++;
  state.skills.daily = p;
  complete();
  dailyActive = false;
  view(`<section class="session stage-complete"><div class="earned-stamp" aria-label="Explorer stamp">✦</div><span class="eyebrow">Adventure complete</span><h1>You made a little magic.</h1><p>You spelled, discovered and created. Your story and <strong>${esc(m.badge)}</strong> stamp are waiting in your nook.</p>${missionSteps('done')}<div class="row celebration-rewards"><span class="pill">+5 practice stars</span><span class="pill">${streak()}-day streak</span></div><button class="btn gold" id="see-nook">See what I collected →</button></section>`);
  document.getElementById('see-nook').onclick = collection;
}

const basicCollection = collection;
collection = function () {
  dailyActive = false;
  const themes = [['River', 0, '#147b73'], ['Ocean', 10, '#126baf'], ['Sunset', 25, '#ad481f'], ['Forest', 50, '#247443']];
  view(`<div class="section-title"><div><span class="eyebrow">Your words. Your stories. Your place.</span><h1>${esc(state.nookName)}</h1></div><span class="counter">✦ ${state.stars} stars</span></div>
    <section class="nook-banner"><img src="capy-garden-v2.png" alt="Capy’s riverside treehouse"><div><h2>Look what we’ve collected.</h2><p>${state.pocket.length} words · ${state.stories.length} adventure stories · ${state.badges.length} explorer stamps</p></div></section>
    <div class="adventure-columns"><section><h2>My word pocket</h2><p class="muted">Words you practised or discovered. Finding a word is the start of getting to know it.</p><div class="row word-pocket">${state.pocket.map(w => `<span class="word-chip">${esc(w)}</span>`).join('') || '<p>Your first word is waiting on an adventure.</p>'}</div>
    <h2>My story shelf</h2>${state.stories.length ? [...state.stories].reverse().map(s => `<details><summary>${esc(s.title)} <span class="muted">· ${s.date}</span></summary><p class="saved-story">${esc(s.text)}</p></details>`).join('') : '<p class="muted">Finish a daily adventure to save your first mini story here.</p>'}
    ${state.story ? `<details><summary>My story workshop draft</summary><p class="saved-story">${esc(state.story)}</p></details>` : ''}
    <button class="btn secondary" id="nook-write">Visit story workshop</button></section>
    <aside><h2>Explorer stamps</h2><div class="stamp-collection">${dailyPlaces.map(p => `<div class="collect-stamp ${state.badges.includes(p.badge) ? 'earned' : ''}"><span>✦</span><strong>${p.badge}</strong><small>${state.badges.includes(p.badge) ? 'Collected' : 'A future adventure'}</small></div>`).join('')}</div>
    <h2>Make it yours</h2><label for="nook-name">Name your nook</label><form id="nook-form" class="row"><input id="nook-name" class="field" maxlength="45" value="${esc(state.nookName)}"><button class="btn secondary">Save name</button></form><div id="nook-status" role="status"></div>
    <p class="muted">Choose a colour. Stars are collected, never spent.</p><div class="theme-grid">${themes.map(([name, cost, colour]) => `<button class="theme-choice ${state.theme === name ? 'selected' : ''}" data-theme="${name}" ${state.stars < cost ? 'disabled' : ''}><span class="colour-swatch" style="background:${colour}"></span><strong>${name}</strong><small>${state.stars < cost ? cost + ' stars' : state.theme === name ? 'Selected' : 'Choose'}</small></button>`).join('')}</div></aside></div>${notice()}`, 'collection');
  document.getElementById('nook-write').onclick = () => start('writing');
  document.getElementById('nook-form').onsubmit = e => { e.preventDefault(); state.nookName = document.getElementById('nook-name').value.trim() || 'My riverside nook'; save(); collection(); document.getElementById('nook-status').textContent = saveAvailable ? 'Your nook has its new name.' : 'Name changed for now. Saving is unavailable.'; };
  main.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => { state.theme = b.dataset.theme; save(); theme(); collection(); });
};
const basicGrownups = grownups;
grownups = function () {
  dailyActive = false;
  basicGrownups();
  main.insertAdjacentHTML('afterbegin', `<p><button class="btn secondary" id="adult-journal">View learning journal</button></p>`);
  document.getElementById('adult-journal').onclick = progress;
  main.insertAdjacentHTML('beforeend', `<details><summary>Daily adventures and combined progress</summary><p>A daily adventure links three spelling words, a related letter rack and a short original story. It saves completed spelling answers, discovered words and the story draft so the child can leave and resume. The complete adventure earns five stars once. Stories are self-reviewed, not automatically graded.</p><p>Tile-building results are separate from independent spelling recall. Capy progress from the earlier preview is imported once when both apps use this same browser and web origin. Existing source records are retained. Progress on a different device or origin cannot be imported automatically.</p><p>Explorer stamps are collected from three rotating story prompts. Other trails remain open without completing the daily adventure.</p></details>`);
};
wordHome = function () {
  dailyActive = false;
  view(`<section class="nook-banner discovery-banner"><img src="capy-garden-v2.png" alt="A river full of places to explore with Capy"><div><span class="eyebrow">Word discovery</span><h1>Follow the letters.</h1><p>Pick a place. Find five words. Bring your discoveries back to your nook.</p></div></section><div class="section-title"><h2>Where shall we go?</h2><span class="pill">No timer · Clues anytime</span></div><div class="rack-map">${WordRacks.map(([name, letters], i) => `<button class="rack-island" data-rack="${i}"><div class="row"><span class="island-number">${String(i+1).padStart(2,'0')}</span><span><strong>${name}</strong><small>${letters.length} letters to explore</small></span></div><div class="sample-tiles" aria-hidden="true">${letters.split('').map(l=>`<span>${l}</span>`).join('')}</div><span class="island-action">Let’s look around →</span></button>`).join('')}</div>${notice()}`, 'discovery');
  main.querySelectorAll('[data-rack]').forEach(b=>b.onclick=()=>{rack=WordRacks[Number(b.dataset.rack)][1].split('');found=[];used=[];built=[];wordAwarded=false;wordHelped=false;wordHint='';wordPlay()});
};

// Neutralise daily mode whenever a navigation action takes the child elsewhere.
document.querySelector('.brand').onclick = home;
document.querySelectorAll('nav button').forEach(b => b.onclick = () => {
  checkpointSpelling(); checkpointDiscovery(); dailyActive = false;
  ({ play: home, discovery: wordHome, progress, collection, grownups }[b.dataset.nav])();
});
theme();
if (window.location.hash === '#discovery') wordHome(); else home();

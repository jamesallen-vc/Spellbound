/* Browser speech API: no app account, recording or API key. */
const voiceEngine=window.speechSynthesis;
let speechRequest=0;
state.voice=typeof state.voice==='string'?state.voice:'';
state.voiceRate=[0.75,0.9,1].includes(state.voiceRate)?state.voiceRate:0.9;
function englishVoices(){return voiceEngine?voiceEngine.getVoices().filter(v=>/^en(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>voiceScore(b)-voiceScore(a)||a.name.localeCompare(b.name)):[]}
function voiceScore(v){return (/^en[-_]AU$/i.test(v.lang)?100:0)+(/enhanced|premium|natural/i.test(v.name)?30:0)+(v.localService?200:0)+(v.default?5:0)}
function selectedVoice(){const voices=englishVoices();return voices.find(v=>v.voiceURI===state.voice)||voices[0]}
function voiceMessage(text){const target=document.getElementById('voice-status')||document.getElementById('feedback');if(target)target.textContent=text}
speak=function(text){
 if(!voiceEngine){voiceMessage('This browser cannot read aloud. You can study the word, then cover it and try.');return}
 const request=++speechRequest;
 voiceEngine.cancel();
 const utterance=new SpeechSynthesisUtterance(text);
 const voice=selectedVoice();if(voice){utterance.voice=voice;utterance.lang=voice.lang}else utterance.lang='en-AU';
 utterance.rate=state.voiceRate;utterance.pitch=1;utterance.volume=1;
 utterance.onerror=e=>{if(request===speechRequest&&!['interrupted','canceled'].includes(e.error))voiceMessage('The voice could not play. Try another voice, or study the word and cover it.')};
 // Keep the utterance alive until the device finishes speaking.
 window.spellboundUtterance=utterance;
 utterance.onend=()=>{if(request===speechRequest)window.spellboundUtterance=null};
 voiceEngine.speak(utterance);
};
function voiceControls(){return `<details class="voice-settings"><summary>Voice and speed</summary><p>Pick the voice that sounds clearest to you.</p><label for="voice-choice">Reading voice</label><select id="voice-choice" class="field"></select><label for="voice-speed">Reading speed</label><select id="voice-speed" class="field"><option value="0.75">Slow</option><option value="0.9">Steady</option><option value="1">Normal</option></select><button class="btn secondary" type="button" id="voice-preview">Try this voice</button><p id="voice-status" role="status" aria-live="polite"></p><p class="muted">Voice choices vary by device. Choose “on device” for offline use.</p></details>`}
function updateVoiceChoices(){const select=document.getElementById('voice-choice');if(!select)return;const voices=englishVoices();select.innerHTML='<option value="">Choose for me · Australian English first</option>'+voices.map(v=>`<option value="${esc(v.voiceURI)}">${esc(v.name)} · ${esc(v.lang)} · ${v.localService?'on device':'may need internet'}</option>`).join('');select.value=voices.some(v=>v.voiceURI===state.voice)?state.voice:'';select.disabled=!voiceEngine;const status=document.getElementById('voice-status');if(status&&!voices.length)status.textContent=voiceEngine?'Your device’s default voice will be used. More choices may appear when it finishes loading.':'Reading aloud is not available in this browser.'}
function wireVoiceControls(){updateVoiceChoices();document.getElementById('voice-speed').value=String(state.voiceRate);document.getElementById('voice-choice').onchange=e=>{state.voice=e.target.value;save()};document.getElementById('voice-speed').onchange=e=>{state.voiceRate=Number(e.target.value);save()};document.getElementById('voice-preview').onclick=()=>speak('Hello! Let’s take our time and learn a new word together.')}
if(voiceEngine)voiceEngine.addEventListener('voiceschanged',updateVoiceChoices);
const voiceQuestion=question;
question=function(){voiceQuestion();const button=document.getElementById('hear');if(!button)return;const item=session.deck[session.index];button.textContent='Hear the word';button.onclick=()=>speak(item.word);button.insertAdjacentHTML('afterend',' <button class="btn quiet" type="button" id="hear-sentence">Hear the sentence</button>');document.getElementById('hear-sentence').onclick=()=>speak(item.sentence);document.querySelector('.question').insertAdjacentHTML('beforeend',voiceControls());wireVoiceControls()};
const voiceGrownups=grownups;
grownups=function(){voiceGrownups();main.insertAdjacentHTML('afterbegin',voiceControls());wireVoiceControls()};

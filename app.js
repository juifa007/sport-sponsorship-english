(function(){
'use strict';if(location.hash==='#teacher')return;
const C=COURSE,E=QuizEngine,app=document.getElementById('app');
const preview=false;
let unit=null,session=null,storageKey='',screen='home',timer=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roc=d=>{const [y,m,day]=d.split('-');return `${Number(y)-1911}/${m}/${day}`;};
const time=t=>new Intl.DateTimeFormat('zh-TW',{timeZone:C.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(t));
const pre=()=>preview?'<div class="notice"><strong>教師預覽・不可繳交</strong><br>可提前檢查所有單元；所有成績卡都有預覽標記。此入口不是身分驗證。</div>':'';
function read(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
function save(){if(!session)return;try{localStorage.setItem(storageKey,JSON.stringify(session));}catch{const el=document.getElementById('live');if(el)el.textContent='裝置無法儲存進度，請勿關閉網頁；完成後立即截圖。';}}
function top(){window.scrollTo({top:0,behavior:'instant'});}
function header(){return `${pre()}<button class="plain no-print" id="home">← 返回單元列表</button><p class="eyebrow">第${unit.week}週 / 單元 ${unit.id} · ${roc(unit.date)}</p><h1>${esc(unit.title)}</h1>`;}
function wireHome(){document.getElementById('home')?.addEventListener('click',()=>{save();home();});}
function available(){return preview||E.isOpen(unit);}
function home(){screen='home';unit=null;session=null;clearTimeout(timer);
 const records=[C.orientation,...C.units,...C.exams].sort((a,b)=>a.week-b.week);
 app.innerHTML=`${pre()}<p class="eyebrow">每週 8 個必背字 + 7 個認讀字</p><h1>這週，學會一點英文。</h1><p class="muted">選擇當週單元，先學單字與文法，再開始測驗。<br>必背、文法各答對7題，認讀答對6題，即可通過。</p><div class="grid">${records.map(u=>{
 const isExam=!u.id,open=u.id===1||preview||E.isOpen(u);return `<article class="week ${isExam?'exam':open?'open':''}"><div class="row between"><span class="eyebrow">第${u.week}週 · ${roc(u.date)}</span><span class="pill">${isExam?'考試週':u.id===1?'課程導覽':open?'可開始測驗':'尚未開放'}</span></div><h3>${u.id?'單元'+u.id+'：':''}${esc(u.title)}</h3><p>${isExam?'依老師安排，無新增英文題庫。':u.id===1?'熟悉操作與課堂規則，不列入正式成績。':esc(u.grammar)}</p>${!isExam?`<div class="row"><button class="${open?'':'secondary'}" data-unit="${u.id}">${u.id===1?'查看導覽':open?'進入單元':'尚未開放'}</button></div>${!open?`<p>將於 ${roc(u.date)} 13:00 開放</p>`:''}`:''}</article>`;}).join('')}</div>`;
 
 app.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>{
   if(b.dataset.unit==='1'){
     orientation();
   }else{
     const u=records.find(x=>x.id===+b.dataset.unit);
     if(!preview&&!E.isOpen(u)){
       alert(`此單元尚未到開放時間（${roc(u.date)} 13:00），目前無法進入。`);
       return;
     }
     unit=u;
     study();
   }
   top();
 });
}
function orientation(){screen='orientation';app.innerHTML=`${pre()}<button id="home" class="plain">← 返回單元列表</button><h1>單元1：課程導覽</h1><div class="panel"><h2>每週怎麼學？</h2><ol><li>學習8個必背字：認識意思，練習拼寫。</li><li>認識7個認讀字：看懂意思，不要求默寫。</li><li>閱讀一個文法重點與例句。</li><li>完成8題雙空格、7題四選一。</li><li>未通過的部分重考; 每次多一點提示。</li><li>通過後確認姓名、學號，截圖上傳作業區。</li></ol><p>認讀選項每次重考會換順序，請看單字意思。</p><p>本週不計分。課程成績比例、出缺席與作業規則由老師課堂說明。</p></div><div class="panel"><h2>基礎句型</h2><p class="sentence">I <strong>am</strong> a student.</p><p>我是一位學生。I 搭配 am；he / she / it 搭配 is；you / we / they 搭配 are。</p><p>下週開始正式測驗。手機若有自動選字，練習時請盡量自己拼寫。</p></div>`;wireHome();}
function speak(word){if(!('speechSynthesis' in window)){alert('這部裝置目前不支援發音。請跟著老師練習。');return;}speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(word);utterance.lang='en-US';utterance.rate=.8;speechSynthesis.speak(utterance);}
function study(){screen='study';const identity=read('sport115-identity')||{};
 app.innerHTML=header()+`<div class="panel"><h2>先認識單字</h2><p>必背字要練習拼寫；認讀字使用4選1。發音由裝置提供。</p><h3>必背 8 字</h3><div class="word-list">${unit.core.map(w=>wordCard(w)).join('')}</div><h3 style="margin-top:25px">認讀 7 字</h3><div class="word-list">${unit.rec.map(w=>wordCard(w)).join('')}</div></div><div class="panel"><span class="pill">${esc(unit.grammar)}</span><h2 style="margin-top:14px">這週的文法</h2><p>${esc(unit.rule)}</p><p class="sentence">${esc(unit.example)}</p><details><summary>查看本週8個完整例句</summary>${unit.core.map(q=>`<p><strong>${esc(full(q))}</strong><br><span class="muted">${esc(q.translation)}</span></p>`).join('')}</details></div><form id="start" class="panel"><h2>準備開始</h2><div class="fields"><label>姓名<input name="student" type="text" required maxlength="40" autocomplete="name" value="${esc(identity.name||'')}"></label><label>學號<input name="studentId" type="text" required maxlength="40" autocomplete="off" value="${esc(identity.id||'')}"></label></div><p class="subtle">姓名與學號只存於此裝置，用於成績卡，請勿輸入其他人的資料。</p><p id="gate" class="muted"></p><p class="error" id="error" role="alert"></p><button id="startButton" type="submit">開始／繼續測驗</button></form>`;
 wireHome();app.querySelectorAll('[data-speak]').forEach(b=>b.onclick=()=>speak(b.dataset.speak));updateGate();
 document.getElementById('start').onsubmit=ev=>{ev.preventDefault();if(!available()){updateGate();return;}const form=new FormData(ev.target),name=form.get('student').trim(),id=form.get('studentId').trim();if(!name||!id){document.getElementById('error').textContent='請填寫姓名與學號。';return;}
 try{localStorage.setItem('sport115-identity',JSON.stringify({name,id}));}catch{}
 storageKey=`sport115:${C.version}:${preview?'preview':'official'}:${unit.id}:${encodeURIComponent(id)}`;
 const old=read(storageKey);session=old&&old.unitId===unit.id&&old.name===name?old:createSession(name,id);save();if(session.scores)results();else quiz();top();};
}
function wordCard(w){return `<div class="word"><div><strong lang="en">${esc(w.word)}</strong><span>${esc(w.zh)}</span></div><button class="sound" data-speak="${esc(w.word)}" aria-label="聆聽 ${esc(w.word)}">發音</button></div>`;}
function full(q){return q.sentence.replace('{v}',q.word).replace('{g}',q.answer);}
function updateGate(){const g=document.getElementById('gate'),b=document.getElementById('startButton');if(!g||!unit)return;const open=available();g.textContent=preview?'教師預覽可提前測試，成績不可繳交。':open?'測驗已開放；目前不設截止時間。':`尚未開放，將於 ${roc(unit.date)} 13:00 開放（臺灣時間）。`;b.disabled=!open;}
function createSession(name,id){return {unitId:unit.id,name,id,attempts:1,rounds:{v:1,g:1,r:1},known:unit.core.map(()=>[]),v:[],g:[],r:[],choices:unit.rec.map(q=>{
 const distractors=E.shuffle([...new Set(unit.rec.filter(x=>x.zh!==q.zh).map(x=>x.zh))]).slice(0,3);return E.shuffle([q.zh,...distractors]);}),scores:null,first:null,locked:{v:false,g:false,r:false},completedAt:null};}
function sentence(q){return esc(q.sentence).replace('{v}',session.locked.v?`<strong>${esc(q.word)}</strong>`:'<span class="blank">單字</span>').replace('{g}',session.locked.g?`<strong>${esc(q.answer)}</strong>`:'<span class="blank">文法</span>');}
function quiz(){screen='quiz';if(!available()){study();return;}
 app.innerHTML=header()+`<div class="panel"><div class="row between"><strong>${esc(session.name)} · ${esc(session.id)}</strong><span class="pill">第 ${session.attempts} 次作答</span></div><p>只重考尚未通過的部分。請按中文句意填答，英文不分大小寫。</p>${Object.entries(session.locked).filter(([,v])=>v).map(([k])=>`<span class="pill pass">${label(k)}已通過</span> `).join('')}<p id="live" class="subtle" aria-live="polite"></p></div><form id="quizForm">${!session.locked.v||!session.locked.g?`<h2>必背字與文法</h2>${unit.core.map((q,i)=>`<fieldset class="question"><legend>第 ${i+1} 題</legend><p>${esc(q.translation)}</p><p class="sentence" lang="en">${sentence(q)}</p>${!session.locked.v?vocabInput(q,i):''}${!session.locked.g?grammarInput(q,i):''}</fieldset>`).join('')}`:''}${!session.locked.r?`<h2>認讀字：4選1</h2><p>選出本週指定意思。選項位置會在重考時改變。</p>${unit.rec.map((q,i)=>`<fieldset class="question"><legend>認讀第 ${i+1} 題</legend><h3 lang="en" style="font-size:28px">${esc(q.word)}</h3>${session.choices[i].map((option,j)=>`<label class="choice"><input type="radio" name="r${i}" value="${esc(option)}" required ${session.r[i]===option?'checked':''}><span>${j+1}. ${esc(option)}</span></label>`).join('')}</fieldset>`).join('')}`:''}<div class="sticky-actions"><button type="submit">送出並查看成績</button><span class="subtle"> 必背7/8・文法7/8・認讀6/7</span></div></form>`;
 wireHome();const f=document.getElementById('quizForm');
 f.addEventListener('input',()=>{collect();clearTimeout(timer);timer=setTimeout(save,250);});
 f.querySelectorAll('[data-letter]').forEach(el=>{el.addEventListener('input',()=>{el.value=el.value.replace(/[^a-z]/gi,'').slice(-1).toLowerCase();if(el.value){const next=el.parentElement.querySelector(`[data-index="${+el.dataset.index+1}"]`)||[...el.parentElement.querySelectorAll('input')].find(x=>+x.dataset.index>+el.dataset.index);next?.focus();}});el.addEventListener('keydown',ev=>{if(ev.key==='Backspace'&&!el.value){const prev=[...el.parentElement.querySelectorAll('input')].filter(x=>+x.dataset.index<+el.dataset.index).pop();prev?.focus();}});});
 f.onsubmit=ev=>{ev.preventDefault();if(!available()){alert('目前不在測驗開放時間內，作答尚未計分。');study();return;}collect();session.scores=E.grade(unit,session);session.first??={...session.scores};session.locked={...session.scores.pass};if(Object.values(session.locked).every(Boolean))session.completedAt=new Date().toISOString();save();results();top();};
}
function vocabInput(q,i){const known=session.known[i];if(!known.length)return `<label>單字（${esc(q.zh)}）<input type="text" name="v${i}" value="${esc(session.v[i]||'')}" required autocomplete="off" autocapitalize="none" spellcheck="false" lang="en" aria-label="第${i+1}題單字"></label>`;
 return `<label>單字（${esc(q.zh)}）</label><p class="subtle">填入剩下的字母；已顯示 ${known.length} 個字母。</p><div class="letter-row">${Array.from(q.word,(ch,j)=>known.includes(j)?`<span class="letter" aria-label="第${j+1}個字母 ${ch}">${ch}</span>`:`<input type="text" data-letter="${i}" data-index="${j}" name="v${i}_${j}" maxlength="1" pattern="[a-zA-Z]" value="${esc((session.v[i]||'')[j]||'')}" required autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="第${i+1}題第${j+1}個字母">`).join('')}</div>`;
}
function grammarInput(q,i){return `<label style="margin-top:16px">文法<input type="text" name="g${i}" value="${esc(session.g[i]||'')}" required autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="第${i+1}題文法"></label>${session.rounds.g>1?`<div class="hint">候選形式：<strong>${esc(q.options.join(' / '))}</strong>${session.rounds.g>2?`<br>${esc(unit.rule)}`:''}${session.rounds.g>3?`<br>例句：${esc(unit.example)}`:''}</div>`:''}`;}
function collect(){const form=document.getElementById('quizForm');if(!form||!session)return;const f=new FormData(form);unit.core.forEach((q,i)=>{if(!session.locked.v){session.v[i]=session.known[i].length?Array.from(q.word,(ch,j)=>session.known[i].includes(j)?ch:(f.get(`v${i}_${j}`)||' ')).join(''):f.get('v'+i)||'';}if(!session.locked.g)session.g[i]=f.get('g'+i)||'';});if(!session.locked.r)unit.rec.forEach((q,i)=>session.r[i]=f.get('r'+i)||'');}
function label(k){return {v:'必背拼寫',g:'文法填空',r:'認讀選擇'}[k];}
function metrics(s){return `<div class="score-grid">${['v','g','r'].map(k=>`<div class="metric"><span>${label(k)}</span><strong class="${s.pass[k]?'ok':'bad'}">${s[k]} / ${k==='r'?7:8}</strong><span>${s.pass[k]?'通過':'再練習'}</span></div>`).join('')}</div>`;}
function results(){screen='results';const s=session.scores,pass=Object.values(s.pass).every(Boolean);
 app.innerHTML=header()+`${pass?`<section class="panel result-card ${preview?'preview-card':''}" id="certificate"><p class="eyebrow">SPORT SPONSORSHIP · ${C.version}</p><h2>${preview?'預覽測驗已完成':'恭喜通過，請記得截圖、上傳到作業區'}</h2><p>第${unit.week}週｜單元${unit.id}：${esc(unit.title)}</p><div class="big">${s.percent}<span style="font-size:23px"> 分</span></div>${metrics(s)}<dl><dt>姓名</dt><dd>${esc(session.name)}</dd><dt>學號</dt><dd>${esc(session.id)}</dd><dt>課程日期</dt><dd>${roc(unit.date)}</dd><dt>完成時間</dt><dd>${time(session.completedAt)}（臺灣）</dd><dt>首次成績</dt><dd>${session.first.percent}分</dd><dt>作答次數</dt><dd>${session.attempts}次</dd><dt>分項次數</dt><dd>拼寫${session.rounds.v}／文法${session.rounds.g}／認讀${session.rounds.r}</dd><dt>提示紀錄</dt><dd>拼寫最多揭露${Math.max(...session.known.map(x=>x.length))}字母；文法提示第${Math.min(3,session.rounds.g-1)}級</dd></dl><p class="subtle">${preview?'教師預覽，不是正式繳交成績。':'各部分保留達標成績；總分為23格／題的答對比例。'}</p></section><div class="row no-print" style="justify-content:center"><button id="screenshot">截圖提醒</button>${C.assignmentUrl&&!preview?`<a class="button secondary" href="${esc(C.assignmentUrl)}" target="_blank" rel="noopener">前往作業區</a>`:''}</div>`:`<section class="panel"><h2>再練習一下，就更熟了。</h2>${metrics(s)}<p>目前 ${s.percent} 分。三個部分都需達標：必背7題、文法7題、認讀6題。</p><p>已通過的部分保留。重考時，必背字累積顯示1–2個字母，認讀選項重新排列。</p><button id="retry">請再考一次</button></section>`}<details class="panel no-print" ${pass?'':'open'}><summary>查看答案與本週規則</summary><p>${esc(unit.rule)}</p>${unit.core.map((q,i)=>`<div class="feedback"><strong>${esc(full(q))}</strong><p>${esc(q.translation)}</p><p class="subtle">拼寫：${E.normalize(session.v[i])===q.word?'✓':'✗'} ${esc(session.v[i])} → ${esc(q.word)}；文法：${E.normalize(session.g[i])===E.normalize(q.answer)?'✓':'✗'} ${esc(session.g[i])} → ${esc(q.answer)}</p></div>`).join('')}${unit.rec.map((q,i)=>`<p>${session.r[i]===q.zh?'✓':'✗'} <strong>${esc(q.word)}</strong>：${esc(q.zh)}</p>`).join('')}</details>`;
 wireHome();document.getElementById('retry')?.addEventListener('click',retry);document.getElementById('screenshot')?.addEventListener('click',()=>{document.getElementById('certificate').scrollIntoView({block:'start'});alert('請使用手機截圖功能。若一張截不完整，可使用長截圖或分成兩張，務必包含姓名、學號、單元、成績及完成時間。');});
}
function retry(){if(!available()){study();return;}['v','g','r'].forEach(k=>{if(!session.locked[k]){session.rounds[k]++;session[k]=[];}});if(!session.locked.v)unit.core.forEach((q,i)=>session.known[i]=E.reveal(q.word,session.known[i]));if(!session.locked.r)session.choices=session.choices.map(opts=>E.reordered(opts,opts));session.attempts++;session.scores=null;save();quiz();top();}
setInterval(()=>{if(screen==='study')updateGate();},15000);
home();
})();
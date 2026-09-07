(function(){
'use strict';if(location.hash!=='#teacher')return;
const app=document.getElementById('app');let token='',expiryTimer=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base=String(window.SITE_CONFIG?.teacherApiUrl||'').replace(/\/$/,'');
function configured(){try{const u=new URL(base);return u.protocol==='https:'||(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname));}catch{return false;}}
function login(message=''){
 token='';clearTimeout(expiryTimer);
 app.innerHTML=`<p class="eyebrow">TEACHER LOGIN</p><h1>教師管理者</h1><p>登入後查閱每週單元、單字、文法、例句與教材檔名。</p><a class="button plain" href="index.html">← 返回學生學習</a><section class="panel" style="max-width:560px;margin-top:24px">${configured()?`<form id="loginForm"><label>教師帳號<input type="text" name="username" autocomplete="username" required maxlength="100"></label><label style="margin-top:16px">密碼<input type="password" name="password" autocomplete="current-password" required maxlength="256" style="width:100%"></label><p id="loginError" class="error" role="alert">${esc(message)}</p><button id="loginButton" type="submit">登入</button></form>`:'<h2>教師登入服務尚未設定</h2><p>學生功能可以使用。請先依安裝說明設定教師服務，再把服務網址填入 config.js。</p><p>帳號密碼由老師在教師服務設定，不會放在GitHub網站檔案。</p>'}</section>`;
 const f=document.getElementById('loginForm');if(!f)return;
 f.onsubmit=async ev=>{ev.preventDefault();const button=document.getElementById('loginButton'),error=document.getElementById('loginError');button.disabled=true;button.textContent='正在驗證…';error.textContent='';const values=new FormData(f);
 try{const response=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:values.get('username').trim(),password:values.get('password')}),cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(15000)});const data=await response.json();if(!response.ok)throw Error(data.error||'登入失敗，請稍後再試。');token=data.token;f.reset();await loadTeacher(data.expiresAt);}catch(e){token='';error.textContent=e.name==='TimeoutError'?'連線逾時，請稍後重試。':e.message==='Failed to fetch'?'無法連接教師服務，請檢查網路或服務網址。':e.message;}finally{button.disabled=false;button.textContent='登入';}};
}
async function loadTeacher(expiresAt){
 const response=await fetch(base+'/api/teacher',{headers:{Authorization:'Bearer '+token},cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(15000)});
 if(!response.ok){throw Error('登入已失效，請重新登入。');}const data=await response.json();renderTeacher(data.course,data.teacher);
 expiryTimer=setTimeout(()=>login('登入已逾時，請重新登入。'),Math.max(0,expiresAt-Date.now()));
}
function block(title,body){return `<section class="panel"><h2>${title}</h2>${body}</section>`;}
function renderTeacher(C,T){
 app.innerHTML=`<div class="row between"><h1>教師管理者</h1><button id="logout" class="plain">登出</button></div><p>每週課程資料查閱；簡報另行製作。</p><div class="panel"><label for="unitSelect">選擇週次</label><select id="unitSelect"></select></div><div id="lesson"></div>`;
 document.getElementById('logout').onclick=()=>login('已登出。');
 const select=document.getElementById('unitSelect'),panel=document.getElementById('lesson');
 const records=[C.orientation,...C.units,...C.exams].sort((a,b)=>a.week-b.week);
 const roc=d=>{const [y,m,day]=d.split('-');return `${+y-1911}/${m}/${day}`;};
 select.innerHTML=records.map(u=>`<option value="${u.week}">第${u.week}週｜${u.id?'單元'+u.id+' ':''}${esc(u.title)}（${roc(u.date)}）</option>`).join('');
 function render(){const u=records.find(x=>x.week===+select.value)||records[0];let text=block(`第${u.week}週｜${esc(u.title)}`,`<p>${roc(u.date)}（二）13:00–15:45</p>`);
 if(!u.id){panel.innerHTML=text+block('考試週','<p>不新增單字與文法。考試方式由老師課堂說明。</p>');return;}
 if(u.id===1){panel.innerHTML=text+block('課程導覽','<p>上課規則、成績、作業繳交方式及程式操作。不新增指定單字，不計正式成績。教材：教師自編。</p>')+block('Unit 1 · am / is / are',`<p>I am a student. 我是一位學生。</p><p>${esc(T.grammarFolder)}<br>${esc(T.grammarFile)}</p>`);return;}
 text+=block('課程重點',`<p>${esc(u.lesson)}</p>`);
 text+=block('必背8字・認讀7字',`<h3>必背：練習拼寫</h3><div class="word-list">${u.core.map(q=>`<p><strong>${esc(q.word)}</strong>　${esc(q.zh)}</p>`).join('')}</div><h3>認讀：4選1</h3><div class="word-list">${u.rec.map(q=>`<p><strong>${esc(q.word)}</strong>　${esc(q.zh)}</p>`).join('')}</div>`);
 text+=block(esc(u.grammar),`<p>${esc(u.rule)}</p><p>${esc(u.example)}</p><p class="subtle">${esc(T.grammarFolder)}<br>${esc(T.grammarFile)}</p>`);
 text+=block('測驗例句與答案',u.core.map((q,i)=>`<div class="feedback"><strong>${i+1}. ${esc(q.sentence.replace('{v}',q.word).replace('{g}',q.answer))}</strong><p>${esc(q.translation)}</p><p class="subtle">單字：${esc(q.word)}；文法：${esc(q.answer)}</p></div>`).join(''));
 text+=block('參考教材：資料夾與檔名',T.refs[u.id].map(key=>{const [folder,file]=T.files[key];return `<div class="feedback"><strong>${esc(T.folders[folder])}</strong><p>${esc(file)}</p></div>`;}).join(''));panel.innerHTML=text;
 }select.onchange=render;render();
}
login();
})();

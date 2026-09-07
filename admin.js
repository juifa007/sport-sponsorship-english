(function(){
'use strict';if(location.hash!=='#teacher')return;
const app=document.getElementById('app');let token='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function login(message=''){
 token='';
 app.innerHTML=`<p class="eyebrow">TEACHER LOGIN</p><h1>教師管理者</h1><p>登入後查閱每週單元、單字、文法、例句與教材檔名。</p><a class="button plain" href="index.html">← 返回學生學習</a><section class="panel" style="max-width:560px;margin-top:24px"><form id="loginForm"><label>教師帳號<input type="text" name="username" autocomplete="username" required maxlength="100"></label><label style="margin-top:16px">密碼<input type="password" name="password" autocomplete="current-password" required maxlength="256" style="width:100%"></label><p id="loginError" class="error" role="alert">${esc(message)}</p><button id="loginButton" type="submit">登入</button></form></section>`;
 
 const f=document.getElementById('loginForm');if(!f)return;
 f.onsubmit=ev=>{ev.preventDefault();
   const values=new FormData(f);
   const user=values.get('username').trim();
   const pass=values.get('password');
   
   // 直接在前端比對帳號密碼
   if(user==='hsinny' && pass==='KinmenRay15'){
     token='mock-token-ok';
     loadTeacher();
   } else {
     document.getElementById('loginError').textContent='帳號或密碼錯誤，請重新輸入。';
   }
 };
}

function loadTeacher(){
 // 載入課表與教材資料
 const C = typeof COURSE !== 'undefined' ? COURSE : { orientation:{week:0,date:'2026-03-01',title:'導覽'}, units:[], exams:[] };
 const T = {
   grammarFolder: '課堂講義資料夾',
   grammarFile: 'grammar_v1.pdf',
   folders: { 1: '第一資料夾', 2: '第二資料夾' },
   files: { 1: [1, 'file1.pdf'] },
   refs: { 2:[1], 3:[1], 4:[1], 5:[1], 6:[1], 7:[1], 8:[1], 9:[1], 10:[1], 11:[1], 12:[1], 13:[1], 14:[1], 15:[1] }
 };
 renderTeacher(C, T);
}

function block(title,body){return `<section class="panel"><h2>${title}</h2>${body}</section>`;}

function renderTeacher(C,T){
 app.innerHTML=`<div class="row between"><h1>教師管理者</h1><button id="logout" class="plain">登出</button></div><p>每週課程資料查閱；簡報另行製作。</p><div class="panel"><label for="unitSelect">選擇週次</label><select id="unitSelect"></select></div><div id="lesson"></div>`;
 document.getElementById('logout').onclick=()=>login('已登出。');
 const select=document.getElementById('unitSelect'),panel=document.getElementById('lesson');
 const records=[C.orientation,...C.units,...C.exams].sort((a,b)=>a.week-b.week);
 const roc=d=>{const [y,m,day]=d.split('-');return `${+y-1911}/${m}/${day};`;};
 select.innerHTML=records.map(u=>`<option value="${u.week}">第${u.week}週｜${u.id?'單元'+u.id+' ':''}${esc(u.title)}（${roc(u.date)}）</option>`).join('');
 
 function render(){
   const u=records.find(x=>x.week===+select.value)||records[0];
   let text=block(`第${u.week}週｜${esc(u.title)}`,`<p>${roc(u.date)}（二）13:00–15:45</p>`);
   if(!u.id){panel.innerHTML=text+block('考試週','<p>不新增單字與文法。考試方式由老師課堂說明。</p>');return;}
   if(u.id===1){panel.innerHTML=text+block('課程導覽','<p>上課規則、成績、作業繳交方式及程式操作。不新增指定單字，不計正式成績。</p>')+block('Unit 1 · am / is / are',`<p>I am a student. 我是一位學生。</p>`);return;}
   text+=block('課程重點',`<p>${esc(u.lesson)}</p>`);
   text+=block('必背8字・認讀7字',`<h3>必背：練習拼寫</h3><div class="word-list">${u.core.map(q=>`<p><strong>${esc(q.word)}</strong> ${esc(q.zh)}</p>`).join('')}</div><h3>認讀：4選1</h3><div class="word-list">${u.rec.map(q=>`<p><strong>${esc(q.word)}</strong> ${esc(q.zh)}</p>`).join('')}</div>`);
   text+=block(esc(u.grammar),`<p>${esc(u.rule)}</p><p>${esc(u.example)}</p>`);
   text+=block('測驗例句與答案',u.core.map((q,i)=>`<div class="feedback"><strong>${i+1}. ${esc(q.sentence.replace('{v}',q.word).replace('{g}',q.answer))}</strong><p>${esc(q.translation)}</p></div>`).join(''));
   panel.innerHTML=text;
 }
 select.onchange=render; render();
}
login();
})();
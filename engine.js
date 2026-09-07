(function(root){
'use strict';
function shuffle(items,rng=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function reordered(items,previous,rng=Math.random){let next=shuffle(items,rng);if(previous&&next.every((v,i)=>v===previous[i])&&next.length>1)next=[...next.slice(1),next[0]];return next;}
function reveal(word,known=[],rng=Math.random){const available=Array.from(word,(_,i)=>i).filter(i=>!known.includes(i));const n=Math.min(1+Math.floor(rng()*2),word.length-1-known.length);return [...known,...shuffle(available,rng).slice(0,Math.max(0,n))].sort((a,b)=>a-b);}
function normalize(s){return String(s||'').trim().toLowerCase().replace(/[’‘]/g,"'");}
function marks(answers,expected){return expected.reduce((n,a,i)=>n+(normalize(answers[i])===normalize(a)?1:0),0);}
function passed(n,total){return n/total>=.8;}
function grade(unit,answers){const v=marks(answers.v,unit.core.map(x=>x.word));const g=marks(answers.g,unit.core.map(x=>x.answer));const r=marks(answers.r,unit.rec.map(x=>x.zh));return {v,g,r,pass:{v:passed(v,8),g:passed(g,8),r:passed(r,7)},percent:Math.round((v+g+r)/23*100)};}
function isOpen(unit,now=Date.now()){return now>=Date.parse(unit.opens)&&(!unit.closes||now<=Date.parse(unit.closes));}
const api={shuffle,reordered,reveal,normalize,marks,passed,grade,isOpen};root.QuizEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

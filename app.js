
(() => {
'use strict';
// Dimensions réelles de la carte : une seule logique de redimensionnement,
// y compris après chargement des polices/images et dans Safari iOS.
const approvedMap=document.getElementById('approved-map');
if(approvedMap){
  let observer=null;
  const applyMapHeight=(raw)=>{
    const n=Number(raw);
    if(!Number.isFinite(n)||n<200)return;
    const h=Math.max(300,Math.min(Math.ceil(n)+1,1900));
    if(Math.abs(approvedMap.getBoundingClientRect().height-h)>2)approvedMap.style.height=h+'px';
  };
  const inspectChild=()=>{
    try{
      const doc=approvedMap.contentDocument;
      const section=doc&&doc.querySelector('.section');
      if(!section)return;
      // La vraie hauteur du contenu, indépendante de la hauteur de l'iframe.
      const measure=()=>applyMapHeight(section.getBoundingClientRect().height);
      measure();
      if(observer)observer.disconnect();
      if('ResizeObserver' in window){observer=new ResizeObserver(measure);observer.observe(section)}
      if(doc.fonts&&doc.fonts.ready)doc.fonts.ready.then(measure).catch(()=>{});
      doc.querySelectorAll('img').forEach(img=>{if(!img.complete)img.addEventListener('load',measure,{once:true})});
    }catch(_){ /* Si l'iframe est isolée, le message du document interne prend le relais. */ }
  };
  window.addEventListener('message',e=>{
    if(e.source!==approvedMap.contentWindow||!e.data||e.data.type!=='julie-map-height')return;
    applyMapHeight(e.data.height);
  });
  approvedMap.addEventListener('load',inspectChild);
  window.addEventListener('resize',inspectChild);
  // Une iframe srcdoc peut être chargée avant le gestionnaire dans certains navigateurs.
  if(approvedMap.contentDocument?.readyState==='complete')inspectChild();
}

const preview=document.body.dataset.demo==='true';
const seriesGrid=document.getElementById('series-grid'),episodesGrid=document.getElementById('episodes-grid');
const defaultSeries=[{id:'nuit-etoile',title:'Nuit étoilé',description:'Contes, légendes et récits populaires venus d’ici et d’ailleurs.',image:null,episodesCount:0}];
let shows=defaultSeries,episodes=[],selected=null;
const E=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
const validUrl=(x)=>{try{const u=new URL(x);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}};
const duration=(x)=>{if(!x)return 'Durée non indiquée';const str=String(x);if(/^\d+$/.test(str))return Math.ceil(+str/60)+' min';if(/^\d+:\d+(?::\d+)?$/.test(str)){const p=str.split(':').map(Number),sec=p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1];return Math.ceil(sec/60)+' min'}return str.slice(0,30)};
const date=(d)=>{const x=new Date(d);return !d||isNaN(x)?'À écouter':new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(x)};
function art(i){const a=E('div','series-art abstract-art '+(i%2?'art-next-one':'art-next-two'));a.append(E('span','next-symbol','✧'),E('span','next-art-text',i%2?'Une nouvelle série':'D’autres histoires'));return a}
function renderSeries(){seriesGrid.replaceChildren();seriesGrid.style.setProperty('--series-columns',Math.min(4,Math.max(3,shows.length)));shows.forEach((s,i)=>{const item=E('article','series-item');const wrap=E('div','series-art');if(validUrl(s.image)){const im=E('img');im.src=s.image;im.alt='Pochette de '+s.title;im.loading='lazy';im.onerror=()=>{im.src='images/serie-illustration.jpg'};wrap.append(im)}else if(i===0){const im=E('img');im.src='images/serie-illustration.jpg';im.alt='Illustration provisoire de '+s.title;wrap.append(im)}item.append(wrap.childNodes.length?wrap:art(i));item.append(E('h3','',s.title),E('p','',s.description||'Une nouvelle série à découvrir.'));if(s.episodesCount){const link=E('a','series-listen','Écouter les épisodes →');link.href='#episodes';link.addEventListener('click',()=>{selected=s.id;renderEpisodes()});item.append(link)}else{item.append(E('span','series-coming','♫  Bientôt disponible'))}seriesGrid.append(item)});for(let i=shows.length;i<3;i++){const item=E('article','series-item');item.append(art(i),E('h3','',i%2?'Une prochaine série':'Et d’autres histoires…'),E('p','',i%2?'Un nouvel univers à découvrir prochainement.':'La suite de l’aventure est en préparation.'),E('span','series-coming','♫  Bientôt disponible'));seriesGrid.append(item)}}
function renderEpisodes(){episodesGrid.replaceChildren();let list=selected?episodes.filter(x=>x.seriesId===selected):episodes;if(preview){episodesGrid.append(E('p','preview-label','APERÇU UNIQUEMENT — épisodes fictifs, aucun audio publié'))}if(!list.length){const wrap=E('div','upcoming-episode');wrap.append(E('span','upcoming-illustration','✧'));const txt=E('div');txt.append(E('span','episode-series-name','NUIT ÉTOILÉ'),E('h3','',selected?'Les épisodes de cette série arrivent bientôt':'Les premières histoires arrivent bientôt'),E('p','','Ils apparaîtront ici automatiquement dès leur publication sur Acast.'));wrap.append(txt,E('span','upcoming-pill','En préparation'));episodesGrid.append(wrap);return}if(selected){const reset=E('button','reset-filter','← Voir tous les épisodes');reset.type='button';reset.onclick=()=>{selected=null;renderEpisodes()};episodesGrid.append(reset)}list.slice(0,6).forEach(x=>{const row=E('article','episode-row'),cover=E('div','episode-cover');if(validUrl(x.image)){const img=E('img');img.src=x.image;img.alt='Pochette de '+x.title;img.loading='lazy';cover.append(img)}else{cover.append(E('span','preview-cover','✧'))}const info=E('div','episode-info');info.append(E('span','episode-series-name',x.seriesTitle),E('h3','',x.title),E('div','episode-metadata',date(x.date)+' · '+duration(x.duration)));const url=validUrl(x.url);const a=E(url?'a':'span','episode-link'+(url?'':' is-disabled'));if(url){a.href=url;a.rel='noopener noreferrer';a.target='_blank'}a.append(E('span','','▶'),document.createTextNode(' Écouter'));row.append(cover,info,a);episodesGrid.append(row)})}
if(preview){shows=[{...defaultSeries[0],episodesCount:3}];episodes=[{id:'test1',seriesId:'nuit-etoile',seriesTitle:'Nuit étoilé',title:'Les remparts et leurs secrets',date:'2026-10-17',duration:'38:00',image:'images/ambiance-carte.jpg'}, {id:'test2',seriesId:'nuit-etoile',seriesTitle:'Nuit étoilé',title:'Une histoire au bord du Pacifique',date:'2026-10-10',duration:'35:00'},{id:'test3',seriesId:'nuit-etoile',seriesTitle:'Nuit étoilé',title:'Une histoire venue d’Afrique',date:'2026-10-01',duration:'41:00'}];const notice=E('p','preview-label','APERÇU DE PRÉSENTATION — épisodes fictifs, aucun audio publié');episodesGrid.prepend(notice)}
renderSeries();renderEpisodes();
if(!preview&&location.protocol!=='file:')fetch('/.netlify/functions/acast',{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error('Acast indisponible');return r.json()}).then(data=>{if(Array.isArray(data.podcasts)&&data.podcasts.length)shows=data.podcasts;if(Array.isArray(data.episodes))episodes=data.episodes;renderSeries();renderEpisodes()}).catch(()=>{ /* garde une page accessible lorsque l'API est indisponible */ });
})();

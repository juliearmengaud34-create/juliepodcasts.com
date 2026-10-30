/** Synchronisation RSS Acast vers un fichier public statique pour GitHub Pages.
 * Réutilise le parseur et le catalogue de pays déjà présents dans le site.
 * Aucun secret, aucun abonnement à un service externe.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {parseFeed} from './lib/rss-utils.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const configs=JSON.parse(await readFile(path.join(root,'data/podcasts.json'),'utf8'));
const outputFile=path.join(root,'data/acast.json');
const previous=await readFile(outputFile,'utf8').then(JSON.parse).catch(()=>({podcasts:[],episodes:[]}));
if(!Array.isArray(configs)||!configs.length)throw Error('Aucun podcast configuré dans data/podcasts.json');

const fallbackShow=cfg=>({
  id:cfg.id,
  title:cfg.previewTitle||cfg.id,
  description:cfg.previewDescription||'',
  image:null,
  link:null,
  episodesCount:0
});

async function getFeed(cfg){
  if(!cfg.id||!/^https:\/\/feeds\.acast\.com\//i.test(cfg.rss||''))throw Error(`RSS Acast invalide pour ${cfg.id||'un podcast'}`);
  let error;
  for(let attempt=1;attempt<=2;attempt++){
    try{
      const response=await fetch(cfg.rss,{
        headers:{Accept:'application/rss+xml, application/xml, text/xml, */*'},
        signal:AbortSignal.timeout(20000)
      });
      if(!response.ok)throw Error(`HTTP ${response.status}`);
      const xml=await response.text();
      if(xml.length>6_000_000)throw Error('RSS trop volumineux');
      const parsed=parseFeed(xml,cfg);
      if(!parsed.podcast||!Array.isArray(parsed.episodes))throw Error('RSS incomplet');
      return parsed;
    }catch(e){error=e;}
  }
  throw error;
}

const shows=[];
const episodes=[];
const failures=[];
let successful=0;
for(const cfg of configs){
  try{
    const parsed=await getFeed(cfg);
    successful++;
    shows.push(parsed.podcast);
    episodes.push(...parsed.episodes);
    console.log(`OK ${cfg.id}: ${parsed.episodes.length} épisode(s)`);
  }catch(e){
    // Ne jamais effacer les épisodes déjà enregistrés en cas d'une panne Acast.
    failures.push(cfg.id);
    shows.push(previous.podcasts?.find(x=>x.id===cfg.id)||fallbackShow(cfg));
    episodes.push(...(previous.episodes||[]).filter(x=>x.seriesId===cfg.id));
    console.warn(`Flux ${cfg.id} indisponible. Conservation des données antérieures. ${e.message}`);
  }
}

// Tri stable : ne pas générer un nouveau commit si rien n'a réellement changé.
episodes.sort((a,b)=>(Date.parse(b.date||0)||0)-(Date.parse(a.date||0)||0)||String(a.guid||a.title).localeCompare(String(b.guid||b.title)));
const next={podcasts:shows,episodes};
const normalized=JSON.stringify(next,null,2)+'\n';
await mkdir(path.dirname(outputFile),{recursive:true});
const oldText=await readFile(outputFile,'utf8').catch(()=>null);
if(oldText!==normalized){
  await writeFile(outputFile,normalized,'utf8');
  console.log(`data/acast.json mis à jour : ${episodes.length} épisode(s).`);
}else{
  console.log('Aucun changement dans les épisodes.');
}
if(failures.length){
 console.warn('Échec temporaire pour : '+failures.join(', '));
 // Signale une anomalie au journal, mais conserve les données existantes.
}
if(!successful){
 console.warn('Aucun flux accessible pendant cette exécution : ancien catalogue conservé.');
}

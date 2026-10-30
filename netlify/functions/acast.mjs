import podcasts from '../../data/podcasts.json' with { type: 'json' };
import { parseFeed } from './rss-utils.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=0, s-maxage=900, stale-while-revalidate=3600'}});
export default async function handler(request) {
  if(request.method!=='GET')return json({error:'Méthode non autorisée'},405);
  const results=await Promise.all(podcasts.map(async cfg=>{
    // Aucun flux issu d'une requête utilisateur : évite la récupération d'URL arbitraires.
    if(!/^https:\/\/feeds\.acast\.com\//.test(cfg.rss||''))return {error:'Flux non Acast',id:cfg.id};
    try {
      const response=await fetch(cfg.rss,{headers:{'accept':'application/rss+xml, application/xml, text/xml'},signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const rss=await response.text();
      if(rss.length>6_000_000)throw new Error('Flux trop volumineux');
      return parseFeed(rss,cfg);
    } catch(err) {return {error:'Flux temporairement indisponible',id:cfg.id};}
  }));
  const series=results.map((result,i)=>result.podcast||{id:podcasts[i].id,title:podcasts[i].previewTitle,description:podcasts[i].previewDescription,image:null,link:null,episodesCount:0});
  const episodes=results.flatMap(r=>r.episodes||[]).sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
  const errors=results.filter(r=>r.error).map(r=>({id:r.id,message:r.error}));
  return json({podcasts:series,episodes,errors});
}

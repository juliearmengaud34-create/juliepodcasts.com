import { locationFromDescription, cleanDescription } from './geo.mjs';
/** Extraction ciblée des champs standards d'un flux RSS Acast, sans dépendance externe. */
export function decodeXml(str='') {
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,code)=>{try{return String.fromCodePoint(code[0].toLowerCase()==='x'?parseInt(code.slice(1),16):parseInt(code,10))}catch{return ''}}).replace(/&(amp|lt|gt|quot|apos|nbsp);/gi,(_,x)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[x.toLowerCase()]));
}
export function tag(xml, name) {
  const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const m=xml.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}\\s*>`,'i'));
  return m?decodeXml(m[1].trim()):'';
}
export function attr(xml, name, attribute='href') {
  const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const m=xml.match(new RegExp(`<${escaped}\\b([^>]*)\\/?>`,'i'));
  if(!m)return '';
  const pattern=new RegExp(`(?:^|\\s)${attribute}\\s*=\\s*(["'])(.*?)\\1`,'i');
  const a=m[1].match(pattern);return a?decodeXml(a[2]):'';
}
export function stripHtml(text='') {
  return decodeXml(text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
}
export function parseFeed(xml, cfg) {
  if(!/<rss\b|<rdf:RDF\b/i.test(xml))throw new Error('Format RSS invalide');
  const rawItems=[...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item\s*>/gi)].map(x=>x[1]);
  const channel=xml.replace(/<item(?:\s[^>]*)?>[\s\S]*?<\/item\s*>/gi,'');
  const showTitle=stripHtml(tag(channel,'title')) || cfg.previewTitle;
  const showDescription=stripHtml(tag(channel,'description')) || cfg.previewDescription;
  const showImage=attr(channel,'itunes:image','href') || tag(tag(channel,'image'),'url');
  const showLink=tag(channel,'link') || null;
  const episodes=rawItems.map(item=>{
    const rawDate=tag(item,'pubDate');const date=new Date(rawDate);const episodeImage=attr(item,'itunes:image','href')||attr(item,'media:thumbnail','url')||showImage;
    return {seriesId:cfg.id,seriesTitle:showTitle,guid:tag(item,'guid')||tag(item,'link')||tag(item,'title'),title:stripHtml(tag(item,'title')),
      description:cleanDescription(tag(item,'description')||tag(item,'itunes:summary')||tag(item,'content:encoded')),
      location:locationFromDescription(tag(item,'description')||tag(item,'itunes:summary')||tag(item,'content:encoded')),
      date:Number.isFinite(date.valueOf())?date.toISOString():null,url:tag(item,'link')||showLink,image:episodeImage,
      duration:tag(item,'itunes:duration')||null};
  }).filter(x=>x.title);
  return {podcast:{id:cfg.id,title:showTitle,description:showDescription,link:showLink,image:showImage,episodesCount:episodes.length},episodes};
}

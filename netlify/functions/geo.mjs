
const countries = {
'france':[46.6,2.3],'ecosse':[56.9,-4.2],'angleterre':[52.7,-1.5],'pays de galles':[52.1,-3.7],'irlande':[53.3,-8.0],'irlande du nord':[54.7,-6.7],
'royaume uni':[54.3,-2.2],'cornouailles':[50.27,-4.9],'allemagne':[51.2,10.4],'espagne':[40.4,-3.7],'portugal':[39.5,-8.0],'italie':[42.5,12.5],'belgique':[50.5,4.5],
'pays bas':[52.1,5.3],'suisse':[46.8,8.2],'autriche':[47.6,14.1],'pologne':[52,19],'republique tcheque':[49.8,15.5],'slovaquie':[48.7,19.7],
'hongrie':[47.2,19.4],'roumanie':[45.9,24.9],'bulgarie':[42.7,25.5],'grece':[39.1,22.9],'croatie':[45.1,15.2],'serbie':[44,21],
'slovenie':[46.2,14.9],'bosnie herzegovine':[44.2,17.7],'montenegro':[42.7,19.3],'albanie':[41.2,20],'macedoine du nord':[41.6,21.7],
'ukraine':[49,32],'russie':[55,37],'norvege':[60.5,8.5],'suede':[62,15],'finlande':[64,26],'danemark':[56,10],
'islande':[64.9,-18.5],'iles feroe':[62,-6.8],'estonie':[58.6,25],'lettonie':[56.9,24.6],'lituanie':[55.2,24],
'canada':[57,-106],'etats unis':[39,-99],'usa':[39,-99],'etats unis d amerique':[39,-99],'mexique':[23.6,-102.5],
'guatemala':[15.8,-90.2],'cuba':[21.5,-79.4],'haiti':[19,-72.5],'republique dominicaine':[19,-70.5],
'bresil':[-11,-51],'argentine':[-35,-64],'chili':[-33,-71],'perou':[-10,-75],'bolivie':[-17,-65],'colombie':[4,-73.9],
'venezuela':[7,-66],'equateur':[-1.8,-78],'uruguay':[-33,-56],
'japon':[36.2,138.3],'chine':[35,103],'coree du sud':[36,128],'coree du nord':[40.4,127],'mongolie':[46,104],
'inde':[22,79],'pakistan':[30,69],'nepal':[28.4,84],'bhoutan':[27.5,90.5],'bangladesh':[23.7,90.3],
'sri lanka':[7.9,80.7],'thailande':[15.9,101],'vietnam':[16.5,106],'cambodge':[12.6,104.9],
'laos':[19.9,102.6],'birmanie':[21.9,96],'myanmar':[21.9,96],'malaisie':[4.2,102],'singapour':[1.35,103.8],
'indonesie':[-2,118],'philippines':[12.8,122.8],'taiwan':[23.7,121],'australie':[-25,134],'nouvelle zelande':[-41,173],
'egypte':[26.8,30.8],'maroc':[31.8,-7.1],'algerie':[28,2.6],'tunisie':[34,9],'libye':[27,17],
'senegal':[14.5,-14.5],'mali':[17,-4],'mauritanie':[20.2,-10.5],'cote d ivoire':[7.5,-5.5],
'ghana':[8,-1],'nigeria':[9,8],'cameroun':[5.7,12.7],'republique democratique du congo':[-3,23],
'congo':[-1,15],'kenya':[0,38],'tanzanie':[-6,35],'ethiopie':[9,40],'soudan':[15.6,30],
'afrique du sud':[-29,25],'namibie':[-22.6,17],'botswana':[-22.3,24.7],'madagascar':[-19,47],
'arabie saoudite':[24,45],'israel':[31.5,35],'palestine':[31.8,35.2],'jordanie':[31,36.1],
'liban':[33.9,35.8],'syrie':[35,38],'turquie':[39,35],'iran':[32,54],'irak':[33,44],
'emirats arabes unis':[24.3,54.3],'yemen':[15.5,48],'oman':[21,57],'kazakhstan':[48,67],
};
export const normalize = (s='')=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
function plain(s=''){return String(s).replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/p\s*>/gi,'\n').replace(/<\/div\s*>/gi,'\n').replace(/<\/li\s*>/gi,'\n').replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&#(\d+);/gi,(_,n)=>String.fromCodePoint(+n)).replace(/\r/g,'');}
const field=(s,label)=>{const re=new RegExp('(?:^|\\n)\\s*'+label+'\\s*[:：]\\s*([^\\n]+)','im');const m=s.match(re);return m?m[1].trim().slice(0,120):''};
export function cleanDescription(raw=''){return plain(raw).split('\n').filter(line=>!/^\s*(?:Pays|Country|Lieu|Place|Ville|Latitude|Lat|Longitude|Lon|Lng)\s*[:：]/i.test(line)).join(' ').replace(/\s+/g,' ').trim();}
export function locationFromDescription(raw=''){
 const description=plain(raw);
 const country=field(description,'(?:Pays|Country)');
 const place=field(description,'(?:Lieu|Place|Ville)');
 const latRaw=field(description,'(?:Latitude|Lat)');const lonRaw=field(description,'(?:Longitude|Lon|Lng)');
 const lat=latRaw?Number(latRaw.replace(',','.')):NaN,lon=lonRaw?Number(lonRaw.replace(',','.')):NaN;
 if(!country&&!place) return null;
 let coords=Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?[lat,lon]:countries[normalize(country)];
 return {country,place:place||country,lat:coords?.[0]??null,lon:coords?.[1]??null,approximate:!(Number.isFinite(lat)&&Number.isFinite(lon))};
}

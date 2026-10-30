/* Fotos de licencia abierta cuando están verificadas; silueta original si falta la foto.
 * Los datos del draft son originales e ilustrativos, nunca fichas oficiales.
 */
const photoFiles={
 'Lionel Messi':'Lionel Messi WC2022.jpg',
 'Cristiano Ronaldo':'Cristiano Ronaldo 2018.jpg',
 'Ronaldo Nazário':'Ronaldo Nazário.jpg',
 'Andrés Iniesta':'Andres Iniesta 2018 (edited).jpg',
 'Xavi Hernández':'2012 2013 - 06 Xavi Hernández.jpg',
 'Ronaldinho':'Ronaldinho in 2019.jpg',
 'Luka Modrić':'Luka Modric.jpg',
 'Mohamed Salah':'Mohamed Salah 2018.jpg',
 'Neymar':'Neymar 2018.jpg',
 'Erling Haaland':'Erling Haaland 2023.jpg',
 'Robert Lewandowski':'Robert Lewandowski 2018.jpg',
 'Harry Kane':'Harry Kane 2018.jpg',
 'Vinícius Júnior':'Vinicius Junior WC2022.jpg',
 'Kevin De Bruyne':'2021-12-07 Fußball, Männer, UEFA Champions League, RB Leipzig - Manchester City FC 1DX 2723 by Stepro (cropped).jpg'
};
export function legendPhoto(name){const file=photoFiles[name];return file?`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=500`:null;}
export function legendPhotoCredit(name){return photoFiles[name]?`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(photoFiles[name].replaceAll(' ','_'))}`:null;}
export function legendIllustration(name,tier='figura'){
 let seed=7;for(const c of name)seed=(seed*33+c.charCodeAt(0))%360;
 const palette={icono:['#cfa57b','#65435d'],figura:['#7cb9de','#263d6e'],profesional:['#91b2a5','#34485b']}[tier]||['#8bb4cf','#253f59'];
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="520" height="650" viewBox="0 0 520 650"><defs><radialGradient id="halo"><stop stop-color="${palette[0]}" stop-opacity=".75"/><stop offset="1" stop-color="${palette[1]}" stop-opacity=".12"/></radialGradient><linearGradient id="kit" x2="1" y2="1"><stop stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/></linearGradient></defs><rect width="520" height="650" fill="${palette[1]}"/><circle cx="255" cy="260" r="290" fill="url(#halo)"/><g fill="none" stroke="#ffffff" stroke-opacity=".09" stroke-width="2"><circle cx="260" cy="275" r="180"/><circle cx="260" cy="275" r="225"/><path d="M15 580 505 120 M0 455 380 0"/></g><g transform="translate(4 16)"><path d="M162 396Q126 405 96 438L35 590 98 622 167 513 178 650 345 650 357 510 413 618 482 590 425 438Q388 398 351 395L323 372 188 371Z" fill="url(#kit)" stroke="#f1f4ff" stroke-opacity=".30" stroke-width="5"/><path d="M214 363 214 410 260 452 304 410 304 358" fill="#9f7668" opacity=".85"/><ellipse cx="258" cy="250" rx="98" ry="118" fill="#b28a77"/><path d="M161 241Q151 120 249 116Q343 115 353 237L321 200 268 184 221 201 193 230Z" fill="#18273c"/><path d="M193 266Q225 285 242 267 M273 267Q303 284 324 267" stroke="#253044" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M230 332Q260 341 287 329" stroke="#65483e" stroke-width="6" fill="none"/><path d="M188 395Q258 468 327 395" stroke="#e6ecf4" stroke-opacity=".5" stroke-width="9" fill="none"/></g><rect x="20" y="20" width="480" height="610" rx="18" stroke="#fff" stroke-opacity=".16" fill="none" stroke-width="3"/></svg>`;
 return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

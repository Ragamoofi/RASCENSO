/* Fotografías de Wikimedia Commons enlazadas como recursos externos, con crédito en README.
 * Cuando falta la foto o falla la red, queda la ilustración original de la tarjeta.
 */
const photoFiles={
 'Lionel Messi':'Lionel Messi WC2022.jpg',
 'Cristiano Ronaldo':'Cristiano Ronaldo 2018.jpg',
 'Ronaldo Nazário':'Ronaldo Nazário.jpg',
 'Andrés Iniesta':'Andres Iniesta 2018 (edited).jpg',
 'Xavi Hernández':'2012 2013 - 06 Xavi Hernández.jpg',
 'Ronaldinho':'Ronaldinho in 2019.jpg',
 'Luka Modrić':'Luka Modric.jpg',
};
export function legendPhoto(name){const file=photoFiles[name];return file?`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=500`:null;}
export function legendPhotoCredit(name){return photoFiles[name]?`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(photoFiles[name].replaceAll(' ','_'))}`:null;}

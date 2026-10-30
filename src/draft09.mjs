/* RASCENSO — Referentes del fútbol para el draft. Todas las valoraciones son ficticias:
 * expresan estilos de juego y NO equivalen a estadísticas oficiales de EA, FIFA o clubes.
 * La diversidad de niveles impide que todos los futbolistas comiencen con el mismo techo.
 */
const icons = [
 ['Ronaldo Nazário',[92,98,76,95,27,87,5,4]],['Zinedine Zidane',[75,84,98,96,67,79,5,5]],
 ['Lionel Messi',[89,96,94,99,35,67,5,4]],['Cristiano Ronaldo',[94,98,78,92,40,95,5,4]],
 ['Pelé',[95,97,88,95,45,88,5,5]],['Marta',[91,92,88,96,37,76,5,4]],
 ['Andrés Iniesta',[77,77,97,95,68,70,4,4]],['Xavi Hernández',[68,73,99,94,70,67,4,4]],
 ['Ronaldinho',[91,91,91,99,30,80,5,4]],['Paolo Maldini',[81,51,80,74,99,90,3,4]],
 ['Sergio Ramos',[77,78,71,70,96,95,3,3]],['Kaká',[91,90,88,93,42,78,4,4]],
 ['Luka Modrić',[77,76,97,93,79,73,4,4]],['Thierry Henry',[96,96,83,92,45,84,4,4]],
 ['Roberto Carlos',[94,88,84,85,92,91,4,4]],['Manuel Neuer',[68,29,83,69,96,89,2,4]],
 ['Mia Hamm',[91,91,88,91,54,79,4,4]],['Iker Casillas',[64,20,71,51,98,82,2,3]],
 ['Diego Maradona',[89,92,96,98,36,70,5,4]],['Andrea Pirlo',[55,68,97,86,57,68,3,5]],
 ['Gianluigi Buffon',[54,19,70,42,97,84,1,3]],['Carles Puyol',[70,45,72,65,96,91,2,3]],
 ['Samuel Eto’o',[96,94,78,87,43,86,4,3]],['Didier Drogba',[80,95,76,81,48,98,3,3]],
 ['Neymar',[89,87,90,97,30,61,5,5]],['Alexis Sánchez',[88,85,83,91,38,75,4,4]]
];
const stars = [
 ['Erling Haaland',[85,95,61,78,34,92,3,3]],['Kevin De Bruyne',[73,85,97,88,63,77,4,5]],
 ['Robert Lewandowski',[73,93,74,82,39,86,4,4]],['Mohamed Salah',[92,89,83,91,42,73,4,3]],
 ['Son Heung-min',[91,88,79,88,40,74,4,5]],['Rodri',[70,73,89,78,91,84,3,4]],
 ['Virgil van Dijk',[74,60,77,71,94,92,2,3]],['Jude Bellingham',[82,82,86,87,81,88,4,4]],
 ['Kylian Mbappé',[98,92,80,94,39,78,5,4]],['Vinícius Júnior',[96,83,78,96,36,66,5,4]],
 ['Pedri',[74,69,91,93,68,65,4,4]],['Federico Valverde',[89,83,88,84,83,89,3,4]],
 ['Antoine Griezmann',[78,83,91,86,57,74,4,4]],['Lautaro Martínez',[78,90,72,81,47,83,4,4]],
 ['Bruno Fernandes',[72,83,91,83,63,73,4,4]],['Bernardo Silva',[75,77,89,92,55,65,4,4]],
 ['Arturo Vidal',[70,79,81,72,84,89,3,3]],['Claudio Bravo',[51,18,84,39,90,73,1,3]],
 ['Alisson Becker',[62,20,83,45,92,79,1,3]],['Ederson',[65,21,94,48,90,75,2,4]],
 ['Harry Kane',[69,94,85,80,47,87,3,5]],['Declan Rice',[74,65,83,73,88,87,3,3]]
];
const pros = [
 ['Darío Osorio',[81,74,70,80,30,60,4,3]],['Ben Brereton Díaz',[78,76,63,71,35,81,3,3]],
 ['Paulo Díaz',[68,43,73,61,81,78,2,3]],['Marcelino Núñez',[70,71,82,78,65,68,3,3]],
 ['Felipe Loyola',[76,65,71,70,74,81,3,3]],['Lucas Assadi',[75,64,69,79,34,58,4,3]],
 ['Erick Pulgar',[58,65,81,63,78,79,2,3]],['Charles Aránguiz',[61,69,84,77,74,69,3,4]],
 ['Alexis Mac Allister',[73,76,86,82,72,76,3,4]],['Enzo Fernández',[70,69,85,75,73,73,3,4]],
 ['Julián Álvarez',[83,82,76,79,49,74,4,4]],['Ángel Correa',[79,77,74,81,40,60,4,3]],
 ['Giorgian de Arrascaeta',[72,77,85,83,47,63,4,4]],['Gabriel Martinelli',[87,76,67,83,43,72,4,3]],
 ['Richarlison',[76,81,65,73,44,82,3,3]],['Raphinha',[84,78,76,86,46,72,4,3]],
 ['Ollie Watkins',[82,79,65,73,43,78,3,3]],['Dominic Solanke',[77,80,66,70,37,82,3,3]],
 ['Dominik Szoboszlai',[78,80,83,79,63,73,3,4]],['Mason Mount',[74,73,81,78,61,71,3,3]],
 ['Kaoru Mitoma',[84,68,68,85,34,55,4,3]],['Christian Pulisic',[82,77,72,82,34,62,4,4]],
 ['Jonathan David',[82,79,67,75,32,70,3,4]],['Santiago Giménez',[70,80,59,67,39,78,3,3]],
 ['Takefusa Kubo',[82,68,76,86,31,57,4,3]],['Hwang Hee-chan',[82,75,64,75,35,71,3,3]],
 ['João Palhinha',[58,59,69,61,87,87,2,3]],['Emiliano Martínez',[55,14,66,42,89,81,1,3]],
 ['David Raya',[58,17,79,47,86,71,1,3]],['Youssouf Fofana',[70,62,71,69,77,79,3,3]]
];
export const DRAFT_REFERENTS=[...icons.map(([name,values])=>({name,values,tier:'icono',ceiling:0})),...stars.map(([name,values])=>({name,values,tier:'figura',ceiling:1})),...pros.map(([name,values])=>({name,values,tier:'profesional',ceiling:3}))];
export const DRAFT_TIERS={icono:{label:'Ícono histórico',detail:'Talento inmediato; menos espacio de mejora.'},figura:{label:'Figura destacada',detail:'Equilibrio de presente y proyección.'},profesional:{label:'Trayectoria profesional',detail:'Atributo más moderado; mayor margen de desarrollo.'}};
export function draftPotentialAdjustment(picks=[]){const professional=picks.filter(x=>x.tier==='profesional').length;const figures=picks.filter(x=>x.tier==='figura').length;return Math.min(8,professional*2+figures);}

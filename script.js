// 1. Chargement du fichier CSV contenant les traités et les informations recueillies
const data = await d3.csv("./Tableau_traités.csv");
console.log(data); //Vérifier que le chargement des données s'est bien déroulé

//2. Importation du geo.JSON
const geoData = await d3.json("./EU.USA.geo.json");
console.log(geoData); //Vérifier que le chargement des données s'est bien déroulé 

//3. Projection et Path Generation
//3.1 Déclaration variables 
const width = window.innerWidth;
const height = window.innerHeight; 
const pad = 50; 

const svg = d3.select("#map-europe")
  .attr("width", width)
  .attr("height", height);

//3.2 Projection et Path Generation
const projection = d3.geoMercator().fitExtent(
    [
        [pad, pad],
        [width - pad, height - pad],
    ],
    geoData
);
const pathGenerator = d3.geoPath().projection(projection);

//4. Visualisation carte du monde
//4.1 je veux ajouter un zoom et je vais créer un g pour tout regrouper
const g = svg.append("g");

//4.2 dessiner les différentes nations à l'intérieur des "g"
g.selectAll("path")
    .data(geoData.features)
    .enter()
    .append("path")
    .attr("d", pathGenerator) 
    .style("fill", "lightgreen") 
    .style("stroke", "black"); 

//4.3 définition du zoom 
//pour la création de cette partie du code: voir dans le README
let zoom = d3.zoom()
    .scaleExtent([1,12])
    .on("zoom", function(event) {
        g.attr("transform", event.transform);
    });

svg.call(zoom);

//5. Création de points sur la carte 
g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => projection([d.long, d.lat])[0])
    .attr("cy", d => projection([d.long, d.lat])[1])
    .attr("r", 2)
    .style("fill", "deeppink"); 

//6. Ajouter le "click" pour visualiser le contenu
//6.1 Corriger les noms de certains pays par rapport au fichier CSV. Pour cette partie, j'ai demandé de l'aide à l'IA « Gemini », cf. README
const dictionnairePays = {
    "URSS": ["Russie", "Ukraine", "Biélorussie", "Estonie", "Lettonie", "Lituanie", "Moldavie"],
    "Tchécoslovaquie": ["Tchéquie", "Slovaquie"],
    "Grande-Bretagne": ["Royaume-Uni"],
    "Empire Ottoman": ["Turquie"],
    "URSS et pays du bloc soviétique": [
        "Russie", "Ukraine", "Biélorussie", "Estonie", "Lettonie", "Lituanie", "Moldavie", 
        "Pologne", "Tchéquie", "Slovaquie", "Hongrie", "Roumanie", "Bulgarie", "Albanie", "Allemagne"
    ],
    "USA": ["États-Unis"],
    "Pays Bas": ["Pays-Bas"]
};


d3.selectAll("circle")
    .on('click', function (e,d){ //ajouter un event listener
// 6.2 Parte del codice che serve per colorare i paesi coinvolti nella stipulazione del trattato. 
        // i paesi devono tornare al colore base "lightgreen" quando si clicca 
        g.selectAll("path").style("fill", "lightgreen");

        //Leggere e coloare i paesi coinvolti. Per questa parte ho chiesto alcuni consigli all'IA "Gemini" perché alcuni passaggi erano troppo complessi per le mie conoscenze (cf. README).
        // Prendiamo la lista degli attori dal CSV e la dividiamo usando la virgola
        let acteursList = d.acteurs.split(',').map(p => p.trim());
        // Creiamo una lista finale vuota dove metteremo i nomi da cercare sulla mappa
        let paysAColorer = [];
        // Utilizzare un forEach per percorrere tutti gli attori. Se è nel dizionario verrà "tradotto"
        acteursList.forEach(acteur => {
            if (dictionnairePays[acteur]) {
                // Se è nel dizionario (es. "URSS"), aggiungi "Russie", "Ukraine", ecc.
                paysAColorer = paysAColorer.concat(dictionnairePays[acteur]);
            } else {
                // Altrimenti aggiungi semplicemente il nome (es. "France")
                paysAColorer.push(acteur);
            }
        });

        // Ultima parte per colorare i paesi sulla mappa
        g.selectAll("path")
            .style("fill", function(geoFeature) {
                // Leggiamo il nome in francese direttamente dal tuo file geo.json
                let nomDuPaysMap = geoFeature.properties.name_fr; 
                
                // Se il nome sulla mappa è nella nostra lista dei paesi da colorare, lo facciamo arancione
                if (paysAColorer.includes(nomDuPaysMap)) {
                    return "orange";
                } else {
                    return "lightgreen";
                }
            });

      
        d3.select("#traités")
        .style("display", "block")
        .style("left", e.pageX + "px")
        .style("top", e.pageY + "px")
        .html(`
        <button style="position: absolute; right: 10px; top: 10px; cursor: pointer;" onclick="this.parentNode.style.display='none'">X</button>
            <b>${d.nom_traité}</b><br>
                Date: ${d.année}<br>
                Lieu: ${d.lieu}<br>
                Pays: ${d.pays}<br>
                Acteurs: ${d.acteurs}<br>
                Description: ${d.description}<br>
                Source: ${d.source}
            `); /*j'ai trouvé cette proprieté [.html] sur: https://devdocs.io/d3~7/d3-selection#selection_html. Je n'arrivais pas à 
 bien réaliser ce travail avec .text et des balises <rect>, et j'ai découvert qu'il était possible de le faire à l'aide des propriétés HTML*/
    }); 





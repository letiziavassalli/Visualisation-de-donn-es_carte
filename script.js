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
// 6.2 Extrait du code permettant de colorer les pays ayant participé à la conclusion du traité. 
        // Les pays doivent revenir à la couleur de base « lightgreen » lorsqu'on clique dessus 
        g.selectAll("path").style("fill", "lightgreen");

        //Lire et colorier les pays concernés. Pour cette partie, j'ai demandé aide à l'IA « Gemini », car certaines étapes étaient trop complexes pour m es connaissances (cf. README).
        // Nous récupérons la liste des acteurs depuis le fichier CSV et nous la séparons à l'aide de la virgule
        let acteursList = d.acteurs.split(',').map(p => p.trim());
        // Créons une liste finale vide dans laquelle nous ajouterons les noms à rechercher sur la carte
        let paysAColorer = [];
        // Utilisez une boucle « forEach » pour parcourir tous les acteurs. S'il figure dans le dictionnaire, il sera « traduit »
        acteursList.forEach(acteur => {
            if (dictionnairePays[acteur]) {
                //Si le terme figure dans le dictionnaire (par ex. « URSS »), ajoute « Russie », « Ukraine », etc.
                paysAColorer = paysAColorer.concat(dictionnairePays[acteur]);
            } else {
                // Sinon, ajoute simplement le nom (par ex. « France »)
                paysAColorer.push(acteur);
            }
        });

        //  Dernière partie : colorier les pays sur la carte
        g.selectAll("path")
            .style("fill", function(geoFeature) {
                // Nous lisons le nom en français directement à partir du fichier geo.json
                let nomDuPaysMap = geoFeature.properties.name_fr; 
                // Si le nom figurant sur la carte figure dans notre liste des pays à colorier, nous le colorions en orange
                if (paysAColorer.includes(nomDuPaysMap)) {
                    return "orange";
                } else {
                    return "lightgreen";
                }
            });

    // 6.3 Création de l'encadré blanc dans lequel apparaîtra le texte relatif au traité sélectionné
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





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
d3.selectAll("circle")
    .on('click', function (e,d){ //ajouter un event listener
         d3.select("#traités")
        .style("display", "block")
        .style("left", e.pageX + "px")
        .style("top", e.pageY + "px")
        .html(`
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





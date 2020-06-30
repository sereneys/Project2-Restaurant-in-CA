
// Creating initial map object
myMap = L.map("map", {
    center: [40, -120],
    zoom: 12,
});

// Adding initial tile layer
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {   
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
}).addTo(myMap);

// Create function to update markers based on search result
function updateMarkers(response) {

    // Create varibale to store location of first returning result to use as center of map
    var lat = response[0].latitude;
    var lng = response[0].longtitude;

    centerLocation = [lat, lng];
    
    // Initialize an array to hold markers
    restaurantMarkers = [];

    // Loop through the stations array
    for (var i = 0; i < response.length; i++) {

        restaurant = response[i];

        // For each station, create a marker and bind a popup with the station's name
        var location = [restaurant.latitude, restaurant.longtitude];
        var name = restaurant.business_name;
        var reviews = restaurant.review_count;
        var rating = restaurant.average_rating;
        var category = restaurant.category;
        var address = restaurant.address;
        var phone = restaurant.phone_number;

        // Add the marker to the array
        if (location) {
            restaurantMarkers.push(
                L.marker(location)
                    .bindPopup("<h4>" + name + "</h4><hr># of Reviews: " 
                        + reviews + "<br>Rating: " + rating + "<br>Category: " + category
                        + "<br>Address: " + address + "<br>Phone#: " + phone));
        };
    };
    
    var restaurantLayer = L.layerGroup(restaurantMarkers);

    // remove aprevious map container
    myMap.remove();

    // Creating new map object
    myMap = L.map("map", {
        center: centerLocation,
        zoom: 12,
    });

    // Adding tile layer
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {   
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    }).addTo(myMap);

    try {
        restaurantLayer.addTo(myMap);
    }
    catch (e) {
         console.log("can not add marker")
    };
    
};

// Create function to generate chart showing top 10 rated
function createChart(response) {

    // remove the previous chart
    d3.select("#top10-chart svg").remove()

    // set the dimensions and margins of the graph
    var margin = {top: 15, right: 25, bottom: 90, left: 30};

    var width = document.getElementById('top10-chart').offsetWidth - margin.left - margin.right;
    var height = document.getElementById('top10-chart').offsetHeight  - margin.top - margin.bottom;


    // append the svg object to the body of the page
    var svg = d3.select("#top10-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

    // filter returned data with # of reviews greater than our threshold
    //filtered_result = response.filter(function(d){return d.review_count > 1000 });
    filtered_result = response;


    // sort data based on rating
    filtered_result.sort(function(b, a) {
        return a.average_rating - b.average_rating;
    });

    // Obtain top 10 results and store to a list
    top10 = filtered_result.slice(0,10);
    console.log(top10)

    // X axis
    var x = d3.scaleBand()
        .domain(top10.map(d => d.business_name))
        .range([ 0, width ])
        .paddingInner(0.2);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-65)")
            .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0,d3.max(top10.map( d=> d.average_rating))])
        .range([ height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));


    // Bars
    var bars = svg.selectAll("rect")
        .data(top10)
        .enter()
        .append("rect")
        .attr("x", d=> x(d.business_name))
        .attr("y", d=> y(d.average_rating))
        .attr("width", x.bandwidth())
        .attr("height", d => (height - y(d.average_rating)))
        .attr("fill", "#69b3a2")
};

// Create function to generate tables showing top10 with most reviews and their ratings
function createTable(response) {
    // sort data
    response.sort(function(b, a) {
        return a.review_count - b.review_count;
    });

    console.log(response);

    // Obtain top 10 results and store to a list
    top10 = response.slice(0,10);
    console.log(top10);

    // clean table
    $("#table-body tr").remove(); 
    console.log("table cleared")

    // Create table for top 10 results
    d3.select("tbody").selectAll("tr")
        .data(top10)
        .enter()
        .append("tr")
        .html(function(d) {
            return `<td class = "name">${d.business_name}</td><td class = "category">${d.category}</td><td class = "reviews">${d.review_count}</td><td class = "rating">${d.average_rating}</td>`
    });
    
    // Create sort function
    var options = {
        valueNames: ["name", "rating"]
    };

    var userList = new List("top10-table", options);
    
};

//define initial city and category variable as global variables
selectedCity = "San Francisco"
selectedCategory = "All"

// define function to obtain selected city based on user input
function getCity(city) {
    selectedCity = city;
}

// define function to obtain selected category based on user input
function getCategory(category) {
    selectedCategory = category;
}

// read and update based on search results
function optionChanged() {
    
    city = selectedCity;
    category = selectedCategory;
    
    // set query url
    url = "http://127.0.0.1:5000/"+city+"/"+category;

    console.log(url)
    // fetch data and update website maps and charts
    d3.json(url, function(response) {

        if (response.length) {
            console.log(response);
            updateMarkers(response);
            createChart(response);
            createTable(response);
        } else {
            alert("No restaurants match your searching!")
        };
    });
};

// Init function

function init() {

    // Set up city and category drop down menu
    var selector1 = d3.select("#selDataset");
    var selector2 = d3.select("#category");

    var cities = ["San Francisco", "Belmont", "Brisbane", "Burlingame", "Colma", "Daly City", "East Palo Alto", "Foster City",  
                "Half Moon Bay", "Menlo Park", "Millbrae", "Pacifica", "Portola Valley", "Redwood City", 
                "San Bruno", "San Carlos", "San Mateo", "South San Francisco", "Woodside", 
                "Campbell", "Cupertino", "Gilroy", "Los Altos", "Milpitas", "Morgan Hill", "Mountain View", 
                "Palo Alto", "San Jose",  "Santa Clara", "Saratoga", "Sunnyvale"];

    var categories = ["All", "Mexican", "Chinese", "Pizza", "Japanese", "Vietnamese", "Indian", "Sandwiches",
                    "American (New)", "Italian", "Korean"];

    cities.forEach((city) => {
        selector1.append("option").property("value", city).text(city); 
    });

    categories.forEach((category) => {
        selector2.append("option").property("value", category).text(category); 
    });

    defaultCity = "San Francisco"
    defaultCategory = "All"

    //Set API url
    url = "http://127.0.0.1:5000/"+defaultCity+"/"+defaultCategory;

    d3.json(url, function(response) {    
        updateMarkers(response);
        createChart(response);
        createTable(response);
    });
};

init();




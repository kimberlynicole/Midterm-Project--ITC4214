var weatherDiv = document.querySelector("#weatherResult");

function loadWeather() {
    var city = "Athens"; 
    var apiKey = "e0c31c7e38da80f190907226f3d53396"; //  API key

    var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + apiKey;

    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.cod !== 200) {
                weatherDiv.innerHTML = "<i class='bi bi-exclamation-triangle'></i> Unable to load weather.";
                return;
            }

            // show weather simply with Bootstrap icons
            weatherDiv.innerHTML = 
                "<i class='bi bi-globe'></i> " + data.name + "<br>" +
                "<i class='bi bi-thermometer-half'></i> " + data.main.temp + " °C<br>" +
                "<i class='bi bi-cloud-sun'></i> " + data.weather[0].description;
        })
        .catch(function(error) {
            weatherDiv.innerHTML = "<i class='bi bi-x-circle'></i> Error loading weather.";
            console.log(error);
        });
}

window.onload = loadWeather;
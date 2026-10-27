const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");
const recentBox = document.getElementById("recent");
const result = document.getElementById("result");

let unit = localStorage.getItem("unit") || "C";
let lastData = null;

searchBtn.addEventListener("click", function () {
    searchCity(searchInput.value);
});

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchCity(searchInput.value);
    }
});

locationBtn.addEventListener("click", useMyLocation);

celsiusBtn.addEventListener("click", function () {
    setUnit("C");
});

fahrenheitBtn.addEventListener("click", function () {
    setUnit("F");
});


// weather code from the api -> theme + emoji
function getLook(code) {
    code = Number(code);

    if (code === 113) return { theme: "sunny", icon: "☀️" };
    if (code === 116) return { theme: "sunny", icon: "⛅" };
    if ([119, 122].includes(code)) return { theme: "cloudy", icon: "☁️" };
    if ([143, 248, 260].includes(code)) return { theme: "cloudy", icon: "🌫️" };
    if ([200, 386, 389, 392, 395].includes(code)) return { theme: "storm", icon: "⛈️" };

    if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 353, 356, 359].includes(code)) {
        return { theme: "rain", icon: "🌧️" };
    }

    if ([179, 182, 185, 227, 230, 281, 284, 311, 314, 317, 320, 323, 326, 329,
        332, 335, 338, 350, 362, 365, 368, 371, 374, 377].includes(code)) {
        return { theme: "snow", icon: "❄️" };
    }

    return { theme: "sunny", icon: "🌤️" };
}


function setUnit(newUnit) {
    unit = newUnit;
    localStorage.setItem("unit", unit);

    celsiusBtn.classList.toggle("active", unit === "C");
    fahrenheitBtn.classList.toggle("active", unit === "F");

    // no need to fetch again, just redraw
    if (lastData) {
        showWeather(lastData);
    }
}

// gives the number in the selected unit, like 28°
function temp(c, f) {
    return (unit === "C" ? c : f) + "°";
}


function showMessage(text) {
    result.innerHTML = "";

    const p = document.createElement("p");
    p.className = "message";
    p.textContent = text;
    result.appendChild(p);
}


async function searchCity(name) {
    name = name.trim();

    if (name === "") {
        showMessage("Please type a city name first.");
        return;
    }

    const ok = await getWeather(name);

    if (ok) {
        saveRecent(lastData.nearest_area[0].areaName[0].value);
    }
}


async function getWeather(place) {
    showMessage("Loading...");
    searchBtn.disabled = true;

    try {
        const url = "https://wttr.in/" + encodeURIComponent(place) + "?format=j1";
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Request failed: " + response.status);
        }

        const data = await response.json();

        if (!data.current_condition || !data.nearest_area) {
            throw new Error("No weather data");
        }

        lastData = data;
        showWeather(data);
        return true;

    } catch (error) {
        console.log(error);
        document.body.className = "";
        showMessage("Couldn't get the weather. Check the city name and your internet.");
        return false;

    } finally {
        searchBtn.disabled = false;
    }
}


function showWeather(data) {
    const now = data.current_condition[0];
    const area = data.nearest_area[0];
    const today = data.weather[0];

    const city = area.areaName[0].value;
    const region = area.region[0].value;
    const country = area.country[0].value;
    const condition = now.weatherDesc[0].value;
    const look = getLook(now.weatherCode);

    document.body.className = look.theme;

    // show the region only when it is different from the city
    let place = country;
    if (region && region !== city) {
        place = region + ", " + country;
    }

    const details = [
        ["Humidity", now.humidity + "%"],
        ["Wind", now.windspeedKmph + " km/h " + now.winddir16Point],
        ["Visibility", now.visibility + " km"],
        ["UV index", now.uvIndex],
        ["Sunrise", today.astronomy[0].sunrise],
        ["Sunset", today.astronomy[0].sunset]
    ];

    let detailsHTML = "";
    details.forEach(function (item) {
        detailsHTML += `
            <div class="detail">
                <p class="detail-name">${item[0]}</p>
                <p class="detail-value">${item[1]}</p>
            </div>`;
    });

    let forecastHTML = "";
    data.weather.forEach(function (day, i) {
        // hourly[4] is around 12 noon
        const noon = day.hourly[4] || day.hourly[0];
        const dayLook = getLook(noon.weatherCode);

        let dayName = "Today";
        if (i > 0) {
            dayName = new Date(day.date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short" });
        }

        forecastHTML += `
            <div class="day">
                <p class="day-name">${dayName}</p>
                <p class="day-icon">${dayLook.icon}</p>
                <p class="day-temp">${temp(day.maxtempC, day.maxtempF)}
                    <span>${temp(day.mintempC, day.mintempF)}</span></p>
            </div>`;
    });

    result.innerHTML = `
        <div class="place">
            <h2>${city}</h2>
            <p>${place}</p>
        </div>

        <div class="now">
            <div class="now-icon">${look.icon}</div>
            <div>
                <p class="now-temp">${temp(now.temp_C, now.temp_F)}${unit}</p>
                <p class="now-text">${condition} · Feels like ${temp(now.FeelsLikeC, now.FeelsLikeF)}</p>
            </div>
        </div>

        <div class="details">${detailsHTML}</div>

        <h3 class="section-title">Next 3 days</h3>
        <div class="forecast">${forecastHTML}</div>

        <p class="updated">Updated: ${now.localObsDateTime}</p>
    `;
}


function useMyLocation() {
    if (!navigator.geolocation) {
        showMessage("Your browser doesn't support location.");
        return;
    }

    showMessage("Getting your location...");

    navigator.geolocation.getCurrentPosition(
        function (position) {
            getWeather(position.coords.latitude + "," + position.coords.longitude);
        },
        function () {
            showMessage("Couldn't get your location. Allow location access or search by city name.");
        }
    );
}


function getRecent() {
    return JSON.parse(localStorage.getItem("recent")) || [];
}

function saveRecent(city) {
    let list = getRecent().filter(function (c) {
        return c.toLowerCase() !== city.toLowerCase();
    });

    list.unshift(city);
    list = list.slice(0, 5);

    localStorage.setItem("recent", JSON.stringify(list));
    showRecent();
}

function showRecent() {
    recentBox.innerHTML = "";

    getRecent().forEach(function (city) {
        const chip = document.createElement("button");
        chip.className = "chip";
        chip.textContent = city;

        chip.addEventListener("click", function () {
            searchInput.value = city;
            searchCity(city);
        });

        recentBox.appendChild(chip);
    });
}


// runs when the page opens
setUnit(unit);
showRecent();
showMessage("Search for a city, or tap 📍 to use your location.");

# Mausam - Weather App

A weather app made with HTML, CSS and JavaScript. You type a city name and it shows the current weather and a 3 day forecast. "Mausam" means weather in Hindi.

![Screenshot of the weather app](screenshot.png)

Live demo: https://your-username.github.io/mausam-weather-app/

## Features

- Search any city (press Enter or click Search)
- Use my location button
- Switch between °C and °F (the choice is remembered)
- Shows humidity, wind, visibility, UV index, sunrise and sunset
- 3 day forecast
- Last 5 searches are saved as buttons so you can search again quickly
- Background colour changes with the weather (sunny, cloudy, rain, storm, snow)
- Shows a message if the city is not found or there is no internet
- Works on mobile screens

## How it works

1. The app calls the [wttr.in](https://wttr.in) API with the city name (free, no API key needed).
2. The API sends back JSON data.
3. JavaScript reads the data and builds the page using template strings.
4. Unit choice and recent searches are stored in `localStorage`.

## Files

- `index.html` - page structure
- `style.css` - styling
- `script.js` - fetching data and updating the page
- `screenshot.png` - preview for this README

## How to run

Download the folder and open `index.html` in a browser. You need internet because the data comes from the API.

## Things I want to add later

- Hourly forecast
- Dark mode
- Search suggestions while typing

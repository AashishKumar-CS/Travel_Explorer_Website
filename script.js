const UNSPLASH_ACCESS_KEY = config.UNSPLASH_ACCESS_KEY;
const WEATHER_API_KEY = config.WEATHER_API_KEY;

const destinationInput = document.getElementById('destinationInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('results');
const weatherInfo = document.getElementById('weatherInfo');
const photoGallery = document.getElementById('photoGallery');

searchBtn.addEventListener('click', exploreDestination);
destinationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') exploreDestination();
});

async function exploreDestination() {
    const destination = destinationInput.value.trim();
    if (!destination) {
        alert('Please enter a destination!');
        return;
    }

    resultsSection.style.display = 'grid';
    showLoading();

    try {
        // Fetch weather
        const weatherData = await fetchWeather(destination);
        displayWeather(weatherData);

        // Fetch photos
        const photos = await fetchPhotos(destination);
        displayPhotos(photos);
    } catch (error) {
        console.error('Error:', error);
        weatherInfo.innerHTML = '<p style="color: red;">Error loading data. Please try again.</p>';
        photoGallery.innerHTML = '<p style="color: red;">Error loading photos.</p>';
    }
}

async function fetchWeather(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Weather data not found');
    return await response.json();
}

function displayWeather(data) {
    const { name, main, weather } = data;
    const temp = Math.round(main.temp);
    const description = weather[0].description;
    const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}.png`;

    weatherInfo.innerHTML = `
        <h3>${name}</h3>
        <img src="${iconUrl}" alt="Weather icon" style="width: 50px; height: 50px;">
        <p>${temp}°C - ${description.charAt(0).toUpperCase() + description.slice(1)}</p>
        <p>Feels like: ${Math.round(main.feels_like)}°C</p>
        <p>Humidity: ${main.humidity}%</p>
    `;
}

async function fetchPhotos(query) {
    const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    if (!response.ok) throw new Error('Photos not found');
    const data = await response.json();
    return data.results;
}

function displayPhotos(photos) {
    photoGallery.innerHTML = '';
    photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.urls.small;
        img.alt = photo.alt_description || 'Travel photo';
        img.title = `Photo by ${photo.user.name}`;
        img.addEventListener('click', () => window.open(photo.links.html, '_blank'));
        photoGallery.appendChild(img);
    });
}

function showLoading() {
    weatherInfo.innerHTML = 'Loading weather...';
    photoGallery.innerHTML = 'Loading photos...';
}
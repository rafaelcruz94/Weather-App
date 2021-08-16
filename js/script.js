'use strict';

const apiKey = '10b99dec4458355aa9313d213650c776';
let search = document.getElementById('search');

//Fetch data through long and lat - Current Weather
async function getCurrentWeather(lat, long) {
	let api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}&units=metric`;
	try {
		const resp = await fetch(api);
		const data = await resp.json();
		updateInfo(data);
	} catch (error) {
		console.log('error: cannot fetch the data of the current weather');
	}
}

//Fetch data through long and lat for the next 7 days
async function getForecastWeather(lat, long) {
	let api = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=current,minutely,hourly,alerts&appid=${apiKey}&units=metric`;
	try {
		const resp = await fetch(api);
		const data = await resp.json();
		updateForecastInfo(data);
	} catch (error) {
		console.log('erro: cannot fetch the data of the forecast weather');
	}
}

//Fetch data through user input
async function getWeatherThroughInput(city) {
	let api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
	try {
		const resp = await fetch(api);
		if (resp.status !== 200) {
			alert('City not found!');
			return;
		}
		const data = await resp.json();
		let zone = data.name;
		saveLocalCities(data);
		updateInfo(data);
		updateListBtn(zone);
		let lat = data.coord.lat;
		let long = data.coord.lon;
		getForecastWeather(lat, long);
	} catch (error) {
		console.log('error: cannot fetch data through user input');
	}
}

//Allow the user to press Enter to get information
search.addEventListener('keydown', ({ key }) => {
	let town = search.value;
	if (key === 'Enter' && town === '') {
		alert('Enter a city');
	} else if (key === 'Enter') {
		getWeatherThroughInput(town);
	}
});

//Allow the user to get info through the submit button
let btn = document.getElementById('submit');

btn.addEventListener('click', function (e) {
	e.preventDefault();
	let town = search.value;
	if (town === '') {
		alert('Enter a city');
	} else {
		getWeatherThroughInput(town);
	}
});

//He asks the user permission to use the geolocation. If he accepts, the function will get the user's location.
function success(position) {
	getCurrentWeather(position.coords.latitude, position.coords.longitude);
	getForecastWeather(position.coords.latitude, position.coords.longitude);
}

//The default city is Porto - When the user doesn't allow the use of geolocation
function error(err) {
	let lat = 41.1496;
	let long = -8.611;
	alert('Unable to retrieve your location. Default: Porto');
	getCurrentWeather(lat, long);
	getForecastWeather(lat, long);
}

//Update the current weather information and clear input field
function updateInfo(data) {
	document.getElementById('city').innerHTML = data.name;
	document.getElementById('country').innerHTML = ', ' + data.sys.country;
	document.getElementById('temperature').innerHTML =
		data.main.temp.toFixed(0) + '<b>°C</b>';
	document.getElementById('details').innerHTML = data.weather[0].description;
	document.getElementById(
		'weatherIcon',
	).innerHTML = `<img class="weatherIcon" src="icons/${data.weather[0].icon}.svg" alt="Weather icon">`;
	document.getElementById('search').value = '';
}

//Update the forecast weather for the next 7 days
function updateForecastInfo(data) {
	for (let i = 1; i <= 7; i++) {
		let dayName = new Date(data.daily[i].dt * 1000).toLocaleDateString('en', {
			weekday: 'short',
			day: '2-digit',
			month: 'short',
		});
		document.getElementById('day' + i).innerHTML = dayName + '.';
		document.querySelector(
			'.img-day' + i,
		).innerHTML = `<img class="weatherIcon1" src="icons/${data.daily[i].weather[0].icon}.svg" alt="Forecast weather icon">`;
		let minTxt = data.daily[i].temp.min.toFixed(0);
		document.getElementById('min-max-' + i).innerHTML =
			data.daily[i].temp.max.toFixed(0) +
			'°C' +
			' | ' +
			`<p class="min">${minTxt}ºC</p>`;
	}
}

//Create an element with the name of the city and a delete button next to it
function addElement(name) {
	let cityBtn = document.createElement('button');
	cityBtn.setAttribute('id', name);
	cityBtn.setAttribute('class', 'city-button');
	cityBtn.setAttribute('name', `${name}`);
	cityBtn.setAttribute('onclick', `getWeatherThroughInput("${name}")`);

	let delBtn = document.createElement('button');
	delBtn.setAttribute('id', 'del' + name);
	delBtn.setAttribute('class', 'delete-button');
	delBtn.setAttribute('onclick', `deleteCity("${name}")`);

	let newContentBtn = document.createTextNode(name);
	let newContentDelBtn = document.createTextNode('x');

	cityBtn.appendChild(newContentBtn);
	delBtn.appendChild(newContentDelBtn);

	document.getElementById('list').appendChild(cityBtn);
	document.getElementById('list').appendChild(delBtn);

	if (name === null) {
		const w = document.getElementById('null');
		const z = document.getElementById(`del${name}`);
		w.remove();
		z.remove();
	}
}

//When the user press 'Enter' or 'add' button, this function will save the cities in the LocalStorage and prevent adding repeated cities
function saveLocalCities(data) {
	let cities;
	if (localStorage.getItem('cities') === null) {
		cities = [];
	} else {
		cities = JSON.parse(localStorage.getItem('cities'));
	}
	if (cities.indexOf(data.name) == -1) {
		cities.push(data.name);
		localStorage.setItem('cities', JSON.stringify(cities));
	}
}

//When the page is reopened, it automatically updates the list of cities.
function updateList() {
	let cities;
	if (localStorage.getItem('cities') === null) {
		cities = [];
	} else {
		cities = JSON.parse(localStorage.getItem('cities'));
	}
	cities.forEach(function (name) {
		addElement(name);
	});
}

//Adds new buttons with the name of the previously searched cities.
function updateListBtn(zone) {
	let cityBtn = document.getElementById(zone);
	let delBtn = document.getElementById(`del${zone}`);
	if (!cityBtn) {
		addElement(zone);
	} else {
		cityBtn.remove();
		delBtn.remove();
		addElement(zone);
	}
}

//Deletes city & del buttons, and removes cities from the localstorage
function deleteCity(city) {
	removeLocalStorage(city);
	let cityBtn = document.getElementById(city);
	let delBtn = document.getElementById('del' + city);
	cityBtn.remove();
	delBtn.remove();
}

function removeLocalStorage(city) {
	let cities;
	if (localStorage.getItem('cities') === null) {
		cities = [];
	} else {
		cities = JSON.parse(localStorage.getItem('cities'));
	}
	cities.splice(cities.indexOf(city), 1);
	localStorage.setItem('cities', JSON.stringify(cities));
}

//Autocomplete predictions in the search bar - teleport api
search.addEventListener('input', async () => {
	let teleportApi = 'https://api.teleport.org/api/cities/?search=';
	let result = await (await fetch(teleportApi + search.value)).json();

	let suggestions = document.getElementById('suggestions');
	suggestions.innerHTML = '';
	let cities = result._embedded['city:search-results'];
	let length = cities.length > 5 ? 5 : cities.length;
	for (let i = 0; i < length; i++) {
		let option = document.createElement('option');
		option.value = cities[i].matching_full_name;
		suggestions.appendChild(option);
	}
});

//Loads the application
navigator.geolocation.getCurrentPosition(success, error);
document.addEventListener('DOMContentLoaded', updateList);

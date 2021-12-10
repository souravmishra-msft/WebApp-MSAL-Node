let loc = document.getElementById('location');
let time = document.getElementById('dateTime');
let temp = document.getElementById('temperature');
let wind = document.getElementById('wind');
let needle = document.getElementById('needle').childNodes[1];
console.log(`Wind: ${wind}`);
window.addEventListener('load', () => {
    let lat;
    let lon;
    let lastAngle = "";
    const apiKey = "5b1eea9c98c123a8569847b9616bf6c7";

    const dateVal = () => {
        let date = new Date();
        let dateStr = date.toDateString();
        let timeStr = date.toLocaleTimeString();
        time.innerHTML = "Date/Time: " + dateStr + ' ' + timeStr; 
    };

    setInterval(dateVal, 1000);

    const windDirection = (windVal) => {
        lastAngle = +lastAngle + -windVal;
        //console.clear();
        //console.log(`\nCurrent last angle: ${lastAngle}`);
        //console.log(`\nWind value: ${-windVal}`);
        needle.style.transform = "rotateZ(" + lastAngle + "deg)";
    }

   
    if('geolocation' in navigator) {
        console.log('GeoLocation Status:  available');
        navigator.geolocation.getCurrentPosition(async (position) => {
            lat = position.coords.latitude; 
            lon = position.coords.longitude;

            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
            
            fetch(url)
                .then(response => { return response.json()})
                .then(data => {
                    console.log(`\nData: ${JSON.stringify(data)}\n`);
                    // Data destructuring
                    const {name} = data;
                    const {country} = data.sys;
                    const {feels_like, humidity} = data.main;
                    const {deg, speed} = data.wind;
                    const {id, main} = data.weather[0];

                    loc.innerHTML = `Location: ${name}, ${country}`;
                    let temp_val = Math.round(feels_like);
                    temp.innerHTML = "Temperature: " + temp_val + " &deg;C"; 
                    

                    wind.innerHTML = "Wind Direction/Speed: " + deg + "&deg; | " + speed + "m/sec" ;
                    windDirection(deg); 
                });
        });
    } else {
        console.log('GeoLocation Status:  not available');
    }

});



const redBtn = document.getElementById('red-btn');
const greenBtn = document.getElementById('green-btn');
const colorBox = document.getElementById('color-box');

let color = colorBox.dataset.api;
console.log(color);
colorBox.style.backgroundColor = color;


const redBtn = document.getElementById('red-btn');
const greenBtn = document.getElementById('green-btn');
const colorBox = document.getElementById('color-box');

let color = colorBox.dataset.api;
console.log(color);
colorBox.style.backgroundColor = color;


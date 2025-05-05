function parseDim(pathData) {
  const result = {};
  const commands = [];

  const moveCommandRegex = /^M([\d\.\-]+)\s+([\d\.\-]+)/i;
  const lineCommandRegex = /([vhl])([\d\.\-]+)/gi;

  const moveMatch = pathData.match(moveCommandRegex);
  if (moveMatch) {
    result.x = parseFloat(moveMatch[1]);
    result.y = parseFloat(moveMatch[2]);
  }

  let match;
  while ((match = lineCommandRegex.exec(pathData)) !== null) {
    const type = match[1].toLowerCase();
    const length = parseFloat(match[2]);
    let indent = 0;
    if (type === "h" && length < 0) {
      indent = length;
    } else if (type === "v" && length < 0) {
      indent = length;
    }

    commands.push({
      type: type,
      length: Math.abs(length),
    });
  }
  data = { x: result.x, y: result.y, c: commands };
  return data;
}

function processElement(element) {
  let currentElement = element.parentNode;
  const parentClasses = [];

  while (currentElement) {
    if (currentElement.classList && currentElement.classList.length > 0) {
      parentClasses.push(...currentElement.classList);
    }
    currentElement = currentElement.parentNode;
  }

  const regex = /(scale)(\d+)-(\d+)/;
  const match = parentClasses.join(", ").match(regex);
  let scale;

  if (match) {
    const scaleFull = match[0];
    const scaleStart = match[2];
    const scaleEnd = match[3];
    scale = match[3] / match[2];

    console.log("Полное совпадение:", scaleFull);
    console.log("scale:", scale);
  } else {
    console.log("Совпадений не найдено.");
    scale = 1;
  }
  return scale;
}

function replaceSquaresWithColoredTriangles() {
  const svgContainer = document.getElementsByTagName("svg")[0];

  const dimentions = document.querySelectorAll(".dim");

  dimentions.forEach((dim) => {
    const parentElement = dim.parentNode;
    const scale = processElement(dim);

    const d = dim.getAttribute("d");
    console.log(d);

    const data = parseDim(d);
    const angle = data.c[0].type === "v" ? 90 : 0;
    const triangleHTML = `<g transform="rotate(${angle},${data.x},${data.y} )">
      <path d="M ${data.x} ${data.y} v${data.c[1].length + 2} v-2 h${
      data.c[0].length
    } v2 v${-data.c[1].length - 2}" class="dim"/>
      <path class="anno" d="M ${data.x} ${
      data.y + data.c[1].length
    } l4 1 v-2 z" fill="red" transform="scale(${scale})"
       transform-origin="${data.x} ${data.y + data.c[1].length}"/>
      <path class="anno" d="M ${data.x + data.c[0].length} ${
      data.y + data.c[1].length
    } l-4 1 v-2 z" fill="red" transform="scale(${scale})"
       transform-origin="${data.x + data.c[0].length} ${
      data.y + data.c[1].length
    }" ;/>/>
      <text class="text" id="dynamicText" x="${
        data.x + data.c[0].length / 2
      }" y="${data.y + data.c[1].length - 2 * scale}">${
      data.c[0].length
    }</text></g>`;

    // // Додаємо новий трикутник перед видаленням квадрата (для збереження порядку, якщо це важливо)
    parentElement.insertAdjacentHTML("beforeend", triangleHTML);
    dim.remove();
  });
}

function parsePlate() {
  const svgContainer = document.getElementsByTagName("svg")[0];
  const plates = document.querySelectorAll("rect");
  const designations = document.querySelectorAll(".dim");
  console.log("name")
  console.log(plates)
  console.log(designations)
  plates.forEach((plate)=>{
    console.log("name")
    console.log(plate.dataset.markDet)
    if (plate.dataset.markDet){
      console.log(plate.dataset.markDet)
    }
  })
}

function makeTableDetailKMD() {
  const container = document.getElementById("draw");
  const textElement = `
  <g id="head" transform="translate(20, 5)">
          <rect class="line" x="0" y="0" width="185" height="15" />
          <path
            d="M 15 0 v15 m 55 0 v-15 m20 0 v15 m15 0 v-15 m0 7.5 h 35 m-20 0 v 7.5 m20 0 v-15 m20 0 v15"
            class="thin"
          />
          <text x="7.5" y="8" class="text">№</text>
          <text x="7.5" y="13" class="text">деталі</text>
          <text x="45" y="10" class="text">переріз</text>
          <text x="80" y="8" class="text">Довжина,</text>
          <text x="80" y="13" class="text">мм</text>
          <text x="98" y="8" class="text">Кіль-ть</text>
          <text x="98" y="13" class="text">шт.</text>
          <text x="112" y="13" class="text">1 елем.</text>
          <text x="130" y="13" class="text">всіх елем.</text>
          <text x="125" y="5" class="text">Маса, кг</text>
          <text x="151" y="5" class="text">
            <tspan x="151" dy="0">найменув.</tspan>
            <tspan x="151" dy="4">або марка</tspan>
            <tspan x="151" dy="4">металу</tspan>
           </text>
          <text x="173" y="8" class="text">Примітка</text>
        </g>
        <g class="row" transform="translate(20, ${5 + 15}) ">
          <rect class="line" x="0" y="0" width="185" height="8" />
          <path
            d="M 15 0 v8 m 55 0 v-8 m20 0 v8 m15 0 v-8 m15 0 v 8 m20 0 v-8 m20 0 v8"
            class="thin"
          />
          <text x="7.5" y="6" class="text">П1</text>
          <text x="44" y="6" class="text">-5х50</text>
          <text x="80" y="6" class="text">100</text>
          <text x="98" y="6" class="text">10</text>
          <text x="112" y="6" class="text">3.14</text>
          <text x="130" y="6" class="text">6.28</text>
          <text x="150" y="6" class="text">С235</text>
        </g>
        
      `;
  container.innerHTML += textElement;
}

function addDestions() {
  replaceSquaresWithColoredTriangles();
  makeTableDetailKMD();
  parsePlate();
}

document.addEventListener("DOMContentLoaded", addDestions);

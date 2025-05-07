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
  let data = { x: result.x, y: result.y, c: commands };
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
  } else {
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

  plates.forEach((plate) => {
    if (plate.dataset.markDet) {
      console.log(plate.dataset.markDet);
    }
  });
}

function getDataKmd() {
  const steel = document.querySelectorAll(".C235, .AISI204")[0];
  const classObj = steel.getAttribute("class");
  const width = steel.getAttribute("width");
  const height = steel.getAttribute("height");
  console.log(steel.getAttribute("height"));
  const markDet = steel.dataset.markDet;
  const regex = /\bt([1-9]|1[0-9]|20)\b/;
  const match = classObj.match(regex)[1];
  const regex2 = /count\s*(\d+(\.\d+)?)/;
  const count = classObj.match(regex2)[1];
  const min = width > height ? height : width;
  const max = width > height ? width : height;
  let weight;
  let mark;
  if (classObj.includes("C235")) {
    weight = (7.85 * match * min * max) / 10 ** 6;
    mark = "C235";
  }
  if (classObj.includes("AISI204")) {
    weight = (2.7 * match * min * max) / 10 ** 6;
    mark = "AISI204";
  }
  const allWeight = weight * count;
  return [
    markDet,
    "-" + match + "x" + min,
    max,
    count,
    weight,
    allWeight,
    mark,
  ];
}

function makeTableDetailKMD() {
  const data = getDataKmd();
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
          <text x="7.5" y="6" class="text">${data[0]}</text>
          <text x="44" y="6" class="text">${data[1]}</text>
          <text x="80" y="6" class="text">${data[2]}</text>
          <text x="98" y="6" class="text">${data[3]}</text>
          <text x="112" y="6" class="text">${data[4]}</text>
          <text x="130" y="6" class="text">${data[5]}</text>
          <text x="150" y="6" class="text">${data[6]}</text>
        </g>
        
      `;

  const table = document.querySelectorAll(".tableKMD");
  table.forEach((table) => {
    const parentElement = table.parentNode;
    parentElement.insertAdjacentHTML("beforeend", textElement);
    table.remove();
  });
}

function addStamp(data) {
  console.log("atrClass");

  const svgContainer = document.getElementsByTagName("svg")[0];
  const atrClass = svgContainer.getAttribute("class");
  if (atrClass.includes("A4")) {
    const textElement = `
    <g class="stamp">
        <rect class="line" x="20" y="5" width="185" height="287" />
        <rect class="line" x="0" y="0" width="210" height="297" />
        <g transform="translate(20, 237)">
          <rect class="line" x="0" y="0" width="185" height="55" />
          <path
            class="thin"
            d="m0 5 h65 m0 5 h-65 m0 5 h65 m0 5 h-65 m0 5 h65 m0 5 h-65 m0 5 h65 m0 5 h-65 m0 5 h65 m0 5 h-65 m0 5 h65"
          />
          <path
            class="thin"
            d="m7 0 v25 m10 -25 v55 m10 -55 v25 m10 -25 v55 m15 -55 v55 m13 -55 v55 "
          />
          <path
            class="thin"
            d="m65 10 h120 m0 15 h-120 m0 15 h120  m0 -10 h-50 m0 -5 v30 m15 -15 v-15 m15 0 v15"
          />
          <text x="130" y="7" text-anchor="middle" style="font-size:5">
            ${data.cipher}
          </text>
          <text x="143" y="37" text-anchor="middle" style="font-size:5">Р</text>
          <text x="157" y="37" text-anchor="middle" style="font-size:5">${data.page}</text>
          <text x="125" y="20" >${data.address}</text>
          <text x="101" y="34" class="text">${data.department}</text>
          <text x="101" y="48" >${data.name}</text>
          <text x="3.5" y="24" >Зм.</text>
          <text x="12" y="24" >Кільк.</text>
          <text x="22" y="24" >Арк.</text>
          <text x="32" y="24" >№док.</text>
          <text x="44" y="24" >Підпис</text>
          <text x="58" y="24" >Дата</text>
          <text x="8" y="29" >Розробив</text>
          <text x="27" y="29" >${data.developer}</text>
          <text x="8" y="34" >Перевірив</text>
          <text x="27" y="34" >${data.inspector}</text>
          <text x="8" y="39" >Т. контр.</text>
          <text x="8" y="49" class="stamp">Н. контр.</text>
          <text x="8" y="54" class="stamp">Затвердив.</text>
          <text x="142" y="29" class="stamp">Стадія</text>
          <text x="157" y="29" class="stamp">Аркуш</text>
          <text x="174" y="29" >Аркушів</text>
          <text x="160" y="53" >Департамент алюміньевих конструкцій</text>
        </g>
      </g>
  `;
  svgContainer.insertAdjacentHTML("beforeend", textElement);
  }
}

function addDestions() {
  replaceSquaresWithColoredTriangles();
  makeTableDetailKMD();
  parsePlate();
}

document.addEventListener("DOMContentLoaded", addDestions);

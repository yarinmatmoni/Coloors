const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
let initialColor;

sliders.forEach((slider) => {
    slider.addEventListener("input",hslControls);
});

colorDivs.forEach((div,index) => {
    div.addEventListener("change", () =>{
        updateTextUi(index);
    });
});

function generateHex() {
    const hexColor = chroma.random();
    return hexColor;
}

function randomColors() {
    initialColor = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        initialColor.push(chroma(randomColor).hex());
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        checkTextContrast(randomColor,hexText);

        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color,hue,brightness,saturation);
    });
}

function checkTextContrast(color,text){
    const luminance = chroma(color).luminance();
    (luminance > 0.5) ? text.style.color = "black" : text.style.color = "white";
}

function colorizeSliders(color,hue,brightness,saturation){
    const noSat = color.set('hsl.s',0);
    const fullSat = color.set('hsl.s',1);
    const scaleSat = chroma.scale([noSat,color,fullSat]);
    const midBright = color.set('hsl.l',0.5);
    const scaleBright = chroma.scale(["black",midBright,"white"]);
    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)},${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0)},${scaleBright(0.5)},${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75)
        ,rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204)
        ,rgb(204,75,75))`;
}

function hslControls(e){
    const index =
        e.target.getAttribute("data-bright")
        || e.target.getAttribute("data-sat")
        || e.target.getAttribute("data-hue");
    
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    const bgColor = initialColor[index];

    let color = chroma(bgColor)
        .set("hsl.s",saturation.value)
        .set("hsl.l",brightness.value)
        .set("hsl.h",hue.value);
    
    colorDivs[index].style.backgroundColor = color;
}

function updateTextUi(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button");
    textHex.innerText = color.hex();

    checkTextContrast(color,textHex);
    icons.forEach((icon) => {
        console.log(icon);
        checkTextContrast(color,icon);
    })
}

randomColors();
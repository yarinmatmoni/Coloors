const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-continer");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjusment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColor;
let savedpalettes= [];

sliders.forEach((slider) => {
    slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
        updateTextUi(index);
    });
});

currentHexes.forEach((hex) => {
    hex.addEventListener("click", () => {
        copyToClipboard(hex);
    });
});

popup.addEventListener("transitionend", () => {
    const popupBox = popup.children[0];
    popup.classList.remove("active");
    popupBox.classList.remove("active");
});

adjustButton.forEach((button, index) => {
    button.addEventListener("click", () => {
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach((button, index) => {
    button.addEventListener("click", () => {
        closeAdjustmentPanel(index);
    });
});

lockButton.forEach((button,index) => {
    button.addEventListener("click", () => {
        lockColor(index);
    });
});

function generateHex() {
    const hexColor = chroma.random();
    return hexColor;
}

generateBtn.addEventListener("click",randomColors);

function randomColors() {
    initialColor = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        
        if(div.classList.contains("locked")){
            initialColor.push(hexText.innerText);
            return;
        }else {
            initialColor.push(chroma(randomColor).hex());
        }

        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        checkTextContrast(randomColor, hexText);

        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color, hue, brightness, saturation);
    });
    resetInputs();
    adjustButton.forEach((button,index) => {
        checkTextContrast(initialColor[index],button);
        checkTextContrast(initialColor[index],lockButton[index]);
    });
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    (luminance > 0.5) ? text.style.color = "black" : text.style.color = "white";
}

function colorizeSliders(color, hue, brightness, saturation) {
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);
    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)},${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0)},${scaleBright(0.5)},${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75)
        ,rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204)
        ,rgb(204,75,75))`;
}

function hslControls(e) {
    const index =
        e.target.getAttribute("data-bright")
        || e.target.getAttribute("data-sat")
        || e.target.getAttribute("data-hue");

    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    const bgColor = initialColor[index];
    let color = chroma(bgColor).set('hsl.s', saturation.value).set('hsl.l', brightness.value).set('hsl.h', hue.value);
    colorDivs[index].style.backgroundColor = color;
    colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUi(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button");
    textHex.innerText = color.hex();

    checkTextContrast(color, textHex);
    icons.forEach((icon) => {
        console.log(icon);
        checkTextContrast(color, icon);
    })
}

function resetInputs() {
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach((slider) => {
        if (slider.name === 'hue') {
            const hueColor = initialColor[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if (slider.name === 'brightness') {
            const brightnessColor = initialColor[slider.getAttribute("data-bright")];
            const brightnessValue = chroma(brightnessColor).hsl()[2];
            slider.value = Math.floor(brightnessValue * 100) / 100;
        }
        if (slider.name === 'saturation') {
            const saturationColor = initialColor[slider.getAttribute("data-sat")];
            const saturationValue = chroma(saturationColor).hsl()[1];
            slider.value = Math.floor(saturationValue * 100) / 100;
        }
    });
}

function copyToClipboard(hex) {
    const el = document.createElement("textarea");
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    const popupBox = popup.children[0];
    popup.classList.add("active");
    popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove("active");
}

function lockColor(index) {
    colorDivs[index].classList.toggle("locked");
    lockButton[index].children[0].classList.toggle("fa-lock-open");
    lockButton[index].children[0].classList.toggle("fa-lock");
}

// Imlempent save to palette 

const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-continer");
const saveInput = document.querySelector(".save-continer input");

saveBtn.addEventListener("click",openPalette);
closeSave.addEventListener("click",closePalette);

function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add("active");
    popup.classList.add("active");
}

function closePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
}

randomColors();
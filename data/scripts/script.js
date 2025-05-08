function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function getDominantColors(imageData, numColors = 5, precision = 24) {
  const data = imageData.data;
  const colorMap = {};

  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i] / precision) * precision;
    const g = Math.round(data[i + 1] / precision) * precision;
    const b = Math.round(data[i + 2] / precision) * precision;
    const key = `${r},${g},${b}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }

  const sorted = Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, numColors);

  return sorted.map(([rgb]) => {
    const [r, g, b] = rgb.split(",").map(Number);
    return rgbToHex(r, g, b);
  });
}

function getBrightness(hexColor) {
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

const upload = document.getElementById("upload");
const uploadMain = document.getElementById("uploadMain");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorsContainer = document.getElementById("colors");
const copyAllBtn = document.getElementById("copyAllBtn");
const preview = document.getElementById("preview");
const btnBack = document.querySelector(".main__back button");
import { imagePaths } from "./images.js";

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const img = new Image();

  reader.onload = (event) => {
    img.src = event.target.result;
    preview.src = event.target.result;
    preview.style.display = "block";
    uploadMain.style.display = "none";
    btnBack.style.display = "flex";
  };

  img.onload = () => {
    const size = 100;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    const topHexColors = getDominantColors(imageData);

    colorsContainer.innerHTML = "";
    topHexColors.forEach((hex) => {
      const box = document.createElement("div");
      box.className = "color-box";
      box.style.backgroundColor = hex;

      const label = document.createElement("span");
      label.className = "labelH";
      label.textContent = hex;
      label.style.cursor = "pointer";
      label.title = "Нажми, чтобы скопировать";

      const brightness = getBrightness(hex);
      label.style.color = brightness > 186 ? "#000" : "#fff";

      label.addEventListener("click", () => {
        navigator.clipboard.writeText(hex);
        const oldText = label.textContent;
        label.textContent = "Скопировано!";
        setTimeout(() => (label.textContent = oldText), 600);
      });

      box.appendChild(label);
      colorsContainer.appendChild(box);
    });

    copyAllBtn.style.display = "inline-block";
    copyAllBtn.onclick = () => {
      navigator.clipboard.writeText(topHexColors.join(", "));
      copyAllBtn.textContent = "Скопировано!";
      setTimeout(() => (copyAllBtn.textContent = "Скопировать все HEX"), 1500);
    };
  };

  reader.readAsDataURL(file);
});

btnBack.addEventListener("click", () => {
  btnBack.style.display = "none";
  preview.style.display = "none";
  preview.src = "";
  uploadMain.style.display = "block";
  colorsContainer.innerHTML = "";
  copyAllBtn.style.display = "none";
  upload.value = "";
});

const dropZone = document.querySelector(".main__upload-input");

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("dragover");
  });
});

dropZone.addEventListener("drop", (e) => {
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    upload.files = files;
    upload.dispatchEvent(new Event("change"));
  }
});

function renderImageWithColors(imageSrc) {
  const img = new Image();
  img.crossOrigin = "Anonymous"; // нужно для внешних изображений

  img.onload = () => {
    const size = 100;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    const topHexColors = getDominantColors(imageData);

    // Создаём структуру
    const pack = document.createElement("div");
    pack.className = "pack__content";

    // Блок с изображением
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "pack__content-img";
    const newImg = document.createElement("img");
    newImg.src = imageSrc;
    newImg.alt = "";
    imgWrapper.appendChild(newImg);
    pack.appendChild(imgWrapper);

    // Блок с цветами
    const colorWrapper = document.createElement("div");
    colorWrapper.className = "pack__content-color";

    topHexColors.forEach((hex) => {
      const colorDiv = document.createElement("div");
      colorDiv.className = "color__packing";
      colorDiv.style.backgroundColor = hex;

      const textDiv = document.createElement("div");
      textDiv.className = "color__packing-text";
      const span = document.createElement("span");
      span.textContent = hex;
      textDiv.appendChild(span);
      textDiv.addEventListener("click", () => {
        navigator.clipboard
          .writeText(hex)
          .then(() => {
            let oldText = textDiv.textContent;

            // Находим родительский div с классом color__packing
            const colorPackingDiv = textDiv.closest(".color__packing");

            // Добавляем классы для анимации фона
            colorPackingDiv.classList.add("changed");
            setTimeout(() => {
              textDiv.textContent = "Скопировано!";
              setTimeout(() => {
                textDiv.textContent = oldText;
              }, 800);
            }, 200);

            setTimeout(() => {
              colorPackingDiv.classList.remove("changed");
            }, 900);
          })
          .catch((err) => {
            console.error("Ошибка при копировании: ", err);
          });
      });

      const btnDiv = document.createElement("div");
      btnDiv.className = "color__packing-btn";
      btnDiv.innerHTML = "<button></button>";

      colorDiv.appendChild(textDiv);
      colorDiv.appendChild(btnDiv);
      colorWrapper.appendChild(colorDiv);
    });

    pack.appendChild(colorWrapper);

    // ВСТАВКА В .main__readyColor-pack
    const target = document.querySelector(".main__readyColor-pack");
    if (target) {
      target.appendChild(pack);
    } else {
      console.warn("Контейнер .main__readyColor-pack не найден");
    }
  };

  img.onerror = () => {
    console.warn("Ошибка загрузки изображения:", imageSrc);
  };

  img.src = imageSrc;
}

// Автозапуск генерации по imagePaths
imagePaths.forEach(renderImageWithColors);

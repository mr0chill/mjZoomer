<template>
  <div>
      <div id="loading"></div>
    <h1 class="hideOnLoad">SLIDE</h1>
    <p>Better on desktop.</p>
    <canvas ref="canvas" width="500" height="500" :class="{ 'hideOnLoad': isLoading }"></canvas>
    <input type="range" min="0" :max="maxSliderValue" v-model="sliderValue" class="slider" :class="{ 'hideOnLoad': isLoading }">
    <div>
      <button @click="skip(-10)">⏮️</button>
      <button @click="skip(-1)">⏪</button>
      <button @click="randomize">⁇</button>
      <button @click="saveImage">📸</button>
      <input type="file" ref="uploadInput" @change="uploadImages" multiple accept="image/*" style="display: none;">
      <label for="uploadInput">🔼</label>
      <button @click="skip(1)">⏩</button>
      <button @click="skip(10)">⏭️</button>
    </div>
    <div v-if="isLoading">Loading...</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const canvas = ref(null);
    const uploadInput = ref(null);
    const isLoading = ref(true);
    const sliderValue = ref(0);
    const images = ref([]);
    const totalImages = ref(270);
    const imageExtensions = ['jpeg'];
    const maxSliderValue = ref((totalImages.value - 1) * 10);

    const loadImage = async (path, extension) => {
      // Implement your fetch request here...
      let img = new Image();
      img.src = `/images/${path}.${extension}`;
      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    };

    const loadImages = async () => {
      let loadingPromises = [];
      displayImage(0, 2);

      for (let i = 0; i < totalImages.value; i++) {
        for (let ext of imageExtensions) {
          loadingPromises.push(
            loadImage((i + 1).toString().padStart(3, '0'), ext)
              .then(img => {
                images.value[i] = img;
                if ((i + 1).toString().padStart(3, '0') === '001') {
                  displayImage(0, 2);
                }
              })
              .catch(err => {
                console.error(err.message);
                totalImages.value = i;
                throw err;
              })
          );
        }
        if (totalImages.value === i) break;
      }

      try {
        await Promise.all(loadingPromises);
      } catch (err) {
        console.error(err);
      }

      maxSliderValue.value = (totalImages.value - 1) * 10;
      isLoading.value = false;
    };

    const displayImage = (index, zoom) => {
      let context = canvas.value.getContext('2d');
      context.clearRect(0, 0, canvas.value.width, canvas.value.height);
      context.save();
      context.translate(canvas.value.width / 2, canvas.value.height / 2);
      context.scale(zoom, zoom);
      context.translate(-canvas.value.width / 2, -canvas.value.height / 2);
      if (images.value[index]) {
        context.drawImage(images.value[index], 0, 0, canvas.value.width, canvas.value.height);
      } else {
        context.fillStyle = 'gray';
        context.fillRect(0, 0, canvas.value.width, canvas.value.height);
        context.fillStyle = 'white';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText('Loading...', canvas.value.width / 2, canvas.value.height / 2);
      }
      context.restore();
    };

    const saveImage = () => {
      let dataUrl = canvas.value.toDataURL('image/png');
      let a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'SLIDE ' + sliderValue.value + '.png';
      a.click();
    };

    const randomize = () => {
      let randomValue = Math.floor(Math.random() * (maxSliderValue.value - sliderValue.value + 1)) + Number(sliderValue.value);
      sliderValue.value = randomValue;
      updateImageAndZoom();
    };

    const skip = (value) => {
      let newValue = value > 0 
        ? Math.min(Number(sliderValue.value) + value, maxSliderValue.value)
        : Math.max(Number(sliderValue.value) + value, 0);
      sliderValue.value = newValue;
      updateImageAndZoom();
    };

    const updateImageAndZoom = () => {
      let val = sliderValue.value;
      let imageIndex = Math.floor(val / 10);
      let zoom = 2 - (val % 10) * 0.1;
      imageIndex = Math.min(imageIndex, images.value.length - 1);
      displayImage(imageIndex, zoom);
    };

    const uploadImages = (event) => {
      let uploadedFiles = Array.from(event.target.files);
      images.value = [];
      uploadedFiles.sort((a, b) => a.name.localeCompare(b.name));
      uploadedFiles.forEach((file, index) => {
        let img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          images.value[index] = img;
          if (index === 0) {
            displayImage(0, 2);
          }
        };
      });
      totalImages.value = uploadedFiles.length;
      maxSliderValue.value = (totalImages.value - 1) * 10;
      sliderValue.value = 0;
      displayImage(0, 2);
    };

    onMounted(() => {
      loadImages();
    });

    return {
      canvas,
      uploadInput,
      isLoading,
      sliderValue,
      loadImages,
      displayImage,
      saveImage,
      randomize,
      skip,
      uploadImages,
      maxSliderValue
    };
  }
};
</script>

<style>
body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background: black;
    overflow: hidden;
    font-family: 'Source Sans Pro', sans-serif;
    color: white;
}

h1{
    font-size: 64px;
    margin-top: -32px;
    margin-bottom: -16px;
}

canvas {
    border: 1px solid black;
}

.slider {
    width: 100%;
    height: 10px;
    margin: 20px 0;
    background: #111111;
    outline: none;
    -webkit-appearance: none;
    max-width: 500px;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    background: #cf0;
    border-radius: 50%;
    cursor: pointer;

}


#loading {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 2em;
    display: none; /* hidden by default */
}


a {
    color: white;
    margin-top: 16px;
    font-size: .8rem;
}

button{
    border: none;
}

.toggle-switch {
    position: relative;
    width: 40px;
    display: inline-block;
    vertical-align: middle;
}

.toggle-switch-checkbox {
    display: none;
}

.toggle-switch-label {
    display: block;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid #999999;
    border-radius: 20px;
    background-color: #eeeeee;
}

.toggle-switch-inner {
    width: 0;
    padding: 0;
    position: absolute;
    opacity: 0;
}

.toggle-switch-switch {
    display: block;
    width: 18px;
    margin: 3px;
    background: #FFFFFF;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 19px;
    border: 1px solid #999999;
    border-radius: 20px;
    transition: all 0.3s ease-in 0s; 
}

.toggle-switch-checkbox:checked + .toggle-switch-label .toggle-switch-switch {
    right: 3px; 
}


#uploadLabel {
    appearance: auto;
    text-rendering: auto;
    color: buttontext;
    letter-spacing: normal;
    word-spacing: normal;
    line-height: normal;
    text-transform: none;
    text-indent: 0px;
    text-shadow: none;
    display: inline-block;
    text-align: center;
    align-items: flex-start;
    cursor: default;
    box-sizing: border-box;
    background-color: buttonface;
    margin: 0em;
    padding: 1px 6px;
    font-size: 13.33px;
    cursor: pointer;

 
}
button{
    cursor: pointer;
}
</style>

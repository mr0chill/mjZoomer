let slider = document.getElementById("myRange");
let canvas = document.getElementById("imageCanvas");
let context = canvas.getContext("2d");
let loading = document.getElementById("loading");

let images = [];
let totalImages = 270; // Initial estimated total images
let retryCount = 2; // Number of retries before giving up

// List of image paths (replace these with your actual image paths)
let imagePaths = Array.from({ length: totalImages }, (_, i) => `${(i + 1).toString().padStart(3, '0')}`);
let imageExtensions = ['jpeg']; // Adjust this as needed

// Helper function to load image
const loadImage = (path, extension) => {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        fetch(`./images/${path}.${extension}`)
            .then(response => {
                if(response.ok) {
                    img.src = `./images/${path}.${extension}`;
                    images.push(img);
                } else {
                    reject(new Error(`Failed to load image ./images/${path}.${extension}`));
                }
            });
    });
};

// Load images
let loadImages = async () => {
    let failedCount = 0;
    for (let i = 0; i < totalImages; i++) {
        for(let ext of imageExtensions){
            try {
                await loadImage(imagePaths[i], ext);
            } catch (err) {
                console.error(err.message);
                failedCount++;
                if (failedCount < retryCount) {
                    i--; // Retry
                } else {
                    // If reached max retries, assume it's the end of the sequence
                    totalImages = i;
                    break;
                }
            }
        }
        if(totalImages === i) break;
    }
    slider.max = (totalImages - 1) * 10; // update slider's max value
    slider.disabled = false; // enable slider after images are loaded
    loading.style.display = "none"; // hide loading screen
    displayImage(0, 2); // Display the first image
};

let displayImage = (index, zoom) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(zoom, zoom);
    context.translate(-canvas.width / 2, -canvas.height / 2);
    context.drawImage(images[index], 0, 0, canvas.width, canvas.height);
    context.restore();
};

loading.style.display = "flex"; // show loading screen
loadImages();

slider.oninput = function() {
    let val = this.value;
    let imageIndex = Math.floor(val / 10);
    let zoom = 2 - (val % 10) * 0.1;
    displayImage(imageIndex, zoom);
};

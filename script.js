let slider = document.getElementById("myRange");
let canvas = document.getElementById("imageCanvas");
let context = canvas.getContext("2d");
let loading = document.getElementById("loading");

let images = [];
let totalImages = 270; // Initial estimated total images

// List of image paths (replace these with your actual image paths)
let imagePaths = Array.from({ length: totalImages }, (_, i) => `${(i + 1).toString().padStart(3, '0')}`);
let imageExtensions = ['jpeg']; // Adjust this as needed

// Helper function to load image
const loadImage = async (path, extension) => {
    let response = await fetch(`./images/${path}.${extension}`, {mode: 'no-cors'});
    if (!response.ok) {
        throw new Error(`Failed to load image ./images/${path}.${extension}`);
    }
    let img = new Image();
    img.src = `./images/${path}.${extension}`;
    return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
};

// Load images
let loadImages = async () => {
    let loadingPromises = [];

    for (let i = 0; i < totalImages; i++) {
        for(let ext of imageExtensions){
            loadingPromises.push(loadImage(imagePaths[i], ext)
                .then(img => {
                    images[i] = img;
                })
                .catch(err => {
                    console.error(err.message);
                    // Reached the end of the sequence
                    totalImages = i;
                    throw err; // Rethrow to stop loading further images
                })
            );
        }
        if (totalImages === i) break;
    }

    try {
        await Promise.all(loadingPromises);
    } catch (err) {
        // Do nothing, this is expected when we've reached the end of the sequence
    }
    
    slider.max = (totalImages - 1) * 10; // update slider's max value
    slider.disabled = false; // enable slider after images are loaded
    loading.style.display = "none"; // hide loading screen
    displayImage(0, 2); // Display the first image
};

let displayImage = (index, zoom) => {
    if(images[index]){
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(zoom, zoom);
        context.translate(-canvas.width / 2, -canvas.height / 2);
        context.drawImage(images[index], 0, 0, canvas.width, canvas.height);
        context.restore();
    } else {
        // Image not loaded yet, do nothing
    }
};

loading.style.display = "flex"; // show loading screen
loadImages();

slider.oninput = function() {
    let val = this.value;
    let imageIndex = Math.floor(val / 10);
    let zoom = 2 - (val % 10) * 0.1;
    displayImage(imageIndex, zoom);
};

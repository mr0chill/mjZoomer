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

let loadImages = async () => {
    let loadingPromises = [];

    // Display the placeholder image initially
    displayImage(0, 2);

    for (let i = 0; i < totalImages; i++) {
        for (let ext of imageExtensions) {
            loadingPromises.push(
                loadImage(imagePaths[i], ext)
                    .then(img => {
                        images[i] = img;
                        // If the loaded image is the placeholder image, redraw the canvas
                        if (imagePaths[i] === '001') {
                            displayImage(0, 2);
                        }
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
};

let displayImage = (index, zoom) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(zoom, zoom);
    context.translate(-canvas.width / 2, -canvas.height / 2);
    if (images[index]) {
        context.drawImage(images[index], 0, 0, canvas.width, canvas.height);
    } else {
        context.fillStyle = 'gray';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText('Loading...', canvas.width / 2, canvas.height / 2);
    }
    context.restore();
};


loading.style.display = "flex"; // show loading screen

loadImages();

slider.oninput = function() {
    let val = this.value;
    let imageIndex = Math.floor(val / 10);
    let zoom = 2 - (val % 10) * 0.1;

    // Limit imageIndex to the length of the images array
    imageIndex = Math.min(imageIndex, images.length - 1);

    displayImage(imageIndex, zoom);
};


let saveButton = document.getElementById("saveButton");

saveButton.addEventListener('click', function () {
    let dataUrl = canvas.toDataURL('image/png');
    let a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'SLIDE ' + slider.value + '.png';
    a.click();
});


let randomButton = document.getElementById("randomButton");

randomButton.addEventListener('click', function () {
    // Generate a random integer between 0 and the slider's max value
    let randomValue = Math.floor(Math.random() * (slider.max - slider.min + 1)) + Number(slider.min);
    slider.value = randomValue;

    // Update the image and zoom based on the new slider value
    let imageIndex = Math.floor(randomValue / 10);
    let zoom = 2 - (randomValue % 10) * 0.1;
    imageIndex = Math.min(imageIndex, images.length - 1);
    displayImage(imageIndex, zoom);
});


let skipOneButton = document.getElementById("skipOne");
let skipTenButton = document.getElementById("skipTen");

skipOneButton.addEventListener('click', function() {
    // Ensure that the slider value does not exceed the max value
    let newValue = Math.min(Number(slider.value) + 1, slider.max);
    slider.value = newValue;
    
    // Update the image and zoom
    let imageIndex = Math.floor(newValue / 10);
    let zoom = 2 - (newValue % 10) * 0.1;
    imageIndex = Math.min(imageIndex, images.length - 1);
    displayImage(imageIndex, zoom);
});

skipTenButton.addEventListener('click', function() {
    // Ensure that the slider value does not exceed the max value
    let newValue = Math.min(Number(slider.value) + 10, slider.max);
    slider.value = newValue;
    
    // Update the image and zoom
    let imageIndex = Math.floor(newValue / 10);
    let zoom = 2 - (newValue % 10) * 0.1;
    imageIndex = Math.min(imageIndex, images.length - 1);
    displayImage(imageIndex, zoom);
});

let skipBackOneButton = document.getElementById("skipBackOne");
let skipBackTenButton = document.getElementById("skipBackTen");

skipBackOneButton.addEventListener('click', function() {
    // Ensure that the slider value does not drop below the min value
    let newValue = Math.max(Number(slider.value) - 1, slider.min);
    slider.value = newValue;

    // Update the image and zoom
    let imageIndex = Math.floor(newValue / 10);
    let zoom = 2 - (newValue % 10) * 0.1;
    imageIndex = Math.min(imageIndex, images.length - 1);
    displayImage(imageIndex, zoom);
});

skipBackTenButton.addEventListener('click', function() {
    // Ensure that the slider value does not drop below the min value
    let newValue = Math.max(Number(slider.value) - 10, slider.min);
    slider.value = newValue;

    // Update the image and zoom
    let imageIndex = Math.floor(newValue / 10);
    let zoom = 2 - (newValue % 10) * 0.1;
    imageIndex = Math.min(imageIndex, images.length - 1);
    displayImage(imageIndex, zoom);
});


let uploadButton = document.getElementById("uploadButton");

uploadButton.addEventListener('change', function() {
    let uploadedFiles = Array.from(this.files); // Convert FileList to Array

    // Reset the images array
    images = [];

    // Sort files alphabetically
    uploadedFiles.sort((a, b) => a.name.localeCompare(b.name));

    // Convert File objects to Image objects and add them to the images array
    uploadedFiles.forEach((file, index) => {
        let img = new Image();

        img.src = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(img.src); // Release memory
            images[index] = img;

            // If the first image was loaded, redraw the canvas
            if (index === 0) {
                displayImage(0, 2);
            }
        };
    });

    totalImages = uploadedFiles.length; // update total images count

    slider.max = (totalImages - 1) * 10; // update slider's max value
    slider.value = 0; // reset slider value

    // display the first image immediately
    displayImage(0, 2);
});

document.getElementById("uploadButton").addEventListener('change', (event) => {
    let uploadButton = document.getElementById("uploadButton");
    let fileName = document.getElementById("fileName");

    if(uploadButton.files.length > 0) {
        fileName.innerText = uploadButton.files.length + " file(s) selected";
    } else {
        fileName.innerText = "No file selected";
    }
});

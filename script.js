let slider = document.getElementById("myRange");
let canvas = document.getElementById("imageCanvas");
let context = canvas.getContext("2d");
let loading = document.getElementById("loading");
let viewDemoButton = document.getElementById("viewDemo");
let createOwnButton = document.getElementById("createOwn");
let appContainer = document.getElementById("appContainer");
let uploadButton = document.getElementById("uploadButton");


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
                        // Enable the slider and hide the loading screen once an image is loaded
                        slider.disabled = false; 
                        loading.style.display = "none";
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

    slider.max = (totalImages - 1) * 10; // update slider's max value after all images are loaded
};

loading.style.display = "flex"; // show loading screen

loadImages();


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
    let imageIndex = Math.min(Math.floor(val / 10), images.length - 1);

    let zoom;
    if (imageIndex === images.length - 1) {
        let lastProgress = val - (imageIndex * 10);
        zoom = 2 - lastProgress * 0.1;
    } else {
        let frameProgress = val % 10;
        zoom = 2 - frameProgress * 0.1;
    }

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



// Function to validate image sizes
const validateImageSizes = async (files) => {
    let width, height;
    for (let file of files) {
        let img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => {
            img.onload = () => {
                if (width && height) {
                    if (img.width !== width || img.height !== height) {
                        throw new Error('Images must all be the same frame size');
                    }
                } else {
                    width = img.width;
                    height = img.height;
                }
                resolve();
            };
        });
    }
    return [width, height];
};

// When 'View Demo' is clicked, show the app container and start loading images
viewDemoButton.addEventListener('click', function() {
    appContainer.style.display = "flex";
    appContainer.style.flexDirection = "column";
    this.style.display = "none";
    createOwnButton.style.display = "none";
    loadImages(); // start loading the images
});

// When 'Create my own' is clicked, trigger the file selection
createOwnButton.addEventListener('click', function() {
    uploadButton.click(); // simulate click on file input
});

uploadButton.addEventListener('change', async function() {
    let uploadedFiles = Array.from(this.files); // Convert FileList to Array

    // Validate image sizes and get their dimensions
    let [width, height] = await validateImageSizes(uploadedFiles);

    // Adjust canvas size
    canvas.width = width / 2;
    canvas.height = height / 2;

    // Show or hide the download button depending on the number of uploaded files
    if (uploadedFiles.length > 0) {
        appContainer.style.display = "flex";
        appContainer.style.flexDirection = "column";
        viewDemoButton.style.display = "none";
        createOwnButton.style.display = "none";
        if (uploadedFiles.length <= 50) {
            downloadButton.style.display = 'inline-block';
        } else {
            downloadButton.style.display = 'none';
        }
    }

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

    slider.max = totalImages  * 10; // update slider's max value
    slider.value = 0; // reset slider value

    // display the first image immediately
    displayImage(0, 2);
});

document.getElementById("uploadButton").addEventListener('change', (event) => {
    let uploadButton = document.getElementById("uploadButton");
    let fileName = document.getElementById("fileName");

    if(uploadButton.files.length > 0) {
        fileName.innerText = uploadButton.files.length + " images added";
    } else {
        fileName.innerText = "No images added";
    }
});


let downloadButton = document.getElementById("download");

downloadButton.addEventListener('click', async function () {
    let confirmation = confirm("Warning, this function can crash your browser if it can't handle the number of images. Proceed?");
    
    if (!confirmation) {
        return;
    }

    let zip = new JSZip();

    for (let i = 0; i < slider.max; i++) {
        slider.value = i;

        let imageIndex = Math.floor(i / 10);
        
        let zoom;
        if (imageIndex === images.length - 1) {
            let lastProgress = i - (imageIndex * 10);
            zoom = 2 - lastProgress * 0.1;
        } else {
            let frameProgress = i % 10;
            zoom = 2 - frameProgress * 0.1;
        }

        imageIndex = Math.min(imageIndex, images.length - 1);
        displayImage(imageIndex, zoom);

        let dataUrl = canvas.toDataURL('image/png');
        let base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
        zip.file(`SLIDE ${i}.png`, base64Data, {base64: true});
    }

    zip.generateAsync({type:"blob"}).then(function(content) {
        let a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = 'SLIDES.zip';
        a.click();
    });
});


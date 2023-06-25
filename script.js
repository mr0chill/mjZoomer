let slider = document.getElementById("myRange");
let canvas = document.getElementById("imageCanvas");
let context = canvas.getContext("2d");

let images = [];
let totalImages = 270; // Adjust this to match the number of images

// Adjust the slider's max value to correspond to the number of zoom steps
slider.max = totalImages * 10 - 1;

// List of image paths (replace these with your actual image paths)
let imagePaths = Array.from({ length: totalImages }, (_, i) => `${(i + 1).toString().padStart(3, '0')}`); 
let imageExtensions = ['jpeg']; // Adjust this as needed

// Load images
for (let i = 0; i < totalImages; i++) {
    let img = new Image();
    imageExtensions.forEach(extension => {
        fetch(`./images/${imagePaths[i]}.${extension}`).then(response => {
            if(response.ok) {
                img.src = `./images/${imagePaths[i]}.${extension}`;
            }
        });
    });
    images.push(img);
}

images[0].onload = function() {
    context.drawImage(images[0], -250, -250, 1000, 1000);
};

slider.oninput = function() {
    let val = this.value;
    let imageIndex = Math.floor(val / 10);
    let zoom = 2 - (val % 10) * 0.1; 

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(zoom, zoom);
    context.translate(-canvas.width / 2, -canvas.height / 2);
    context.drawImage(images[imageIndex], 0, 0, canvas.width, canvas.height);
    context.restore();
}

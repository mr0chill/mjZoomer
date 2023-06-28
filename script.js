document.getElementById('create-gif').addEventListener('click', async function() {
    let files = document.getElementById('image-input').files;

    let firstImage = await createImageBitmap(files[0]);
    let gif = new GIF({
        workers: 2,
        quality: 10,
        width: firstImage.width / 2,
        height: firstImage.height / 2
    });

    for (let file of files) {
        let img = await createImageBitmap(file);
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        let frameWidth = img.width / 2;
        let frameHeight = img.height / 2;

        let frames = [
            context.getImageData(0, 0, frameWidth, frameHeight),
            context.getImageData(frameWidth, 0, frameWidth, frameHeight),
            context.getImageData(0, frameHeight, frameWidth, frameHeight),
            context.getImageData(frameWidth, frameHeight, frameWidth, frameHeight)
        ];

        for (let frame of frames) {
            gif.addFrame(frame, {delay: 200});
        }
    }

    gif.on('finished', function(blob) {
        let url = URL.createObjectURL(blob);
        let link = document.getElementById('download-link');
        link.href = url;
        link.download = 'gifpanel.gif';
        link.style.display = 'block';
    });

    gif.render();
});

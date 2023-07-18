class SlideApp {
    constructor() {
        this.domElements = this.getDomElements();
        this.maxZoom = 2; 
        this.images = [];
        this.totalImages = 50;
        this.imagePaths = Array.from({ length: this.totalImages }, (_, i) => `${(i + 1).toString().padStart(3, '0')}`);
        this.imageExtensions = ['jpeg'];
        this.addEventListeners();
        this.loadImages();
    }

    getDomElements() {
        const ids = [
            "myRange", "imageCanvas", "loading", "viewDemo", "createOwn",
            "appContainer", "uploadButton", "zoomInput", "zoomControls",
            "heading", "subheading", "steal", "tutorialButton", "fileName",
            "download", "saveButton", "randomButton", "skipOne", "skipTen",
            "skipBackOne", "skipBackTen"
        ];
        return ids.reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});
    }

    addEventListeners() {
        this.domElements.myRange.addEventListener('input', this.handleSliderInput.bind(this));
        this.domElements.viewDemo.addEventListener('click', this.handleViewDemo.bind(this));
        this.domElements.createOwn.addEventListener('click', this.handleCreateOwn.bind(this));
        this.domElements.uploadButton.addEventListener('change', this.handleUpload.bind(this));
        this.domElements.zoomInput.addEventListener('change', this.handleZoomChange.bind(this));
        this.domElements.download.addEventListener('click', this.handleDownload.bind(this));
        this.domElements.saveButton.addEventListener('click', this.handleSave.bind(this));
        this.domElements.randomButton.addEventListener('click', this.handleRandom.bind(this));
        this.domElements.skipOne.addEventListener('click', this.handleSkipOne.bind(this));
        this.domElements.skipTen.addEventListener('click', this.handleSkipTen.bind(this));
        this.domElements.skipBackOne.addEventListener('click', this.handleSkipBackOne.bind(this));
        this.domElements.skipBackTen.addEventListener('click', this.handleSkipBackTen.bind(this));
    }

    handleSliderInput() {
        let val = this.domElements.myRange.value;
        let framesPerImage = Math.ceil(this.domElements.myRange.max / this.totalImages);
        let imageIndex = Math.min(Math.floor(val / framesPerImage), this.totalImages - 1);
        let frameProgress = val % framesPerImage;
        let zoomDecrement = (this.maxZoom - 1.1) / (framesPerImage - 1);
        let zoom;
        if (frameProgress === 0 && imageIndex !== this.totalImages - 1) {
            zoom = this.maxZoom;
        } else if (imageIndex === this.totalImages - 1 && frameProgress === 0) {
            if (val === this.domElements.myRange.max){
                zoom = 1.0
            } else {
                zoom = this.maxZoom;
            }   
        } else {
            zoom = this.maxZoom - frameProgress * zoomDecrement;
        }
        this.displayImage(imageIndex, zoom);
    }

    handleViewDemo() {
        this.domElements.appContainer.style.display = "flex";
        this.domElements.appContainer.style.flexDirection = "column";
        this.domElements.viewDemo.style.display = "none";
        this.domElements.createOwn.style.display = "none";
        this.domElements.tutorialButton.style.display = "none";
        this.domElements.subheading.style.display = "none";
        this.loadImages();
    }

    handleCreateOwn() {
        this.domElements.uploadButton.click();
    }

    async handleUpload() {
        let uploadedFiles = Array.from(this.domElements.uploadButton.files);
        let [width, height] = await this.validateImageSizes(uploadedFiles);
        this.domElements.imageCanvas.width = width / 2;
        this.domElements.imageCanvas.height = height / 2;
        if (uploadedFiles.length > 0) {
            this.domElements.appContainer.style.display = "flex";
            this.domElements.appContainer.style.flexDirection = "column";
            this.domElements.viewDemo.style.display = "none";
            this.domElements.zoomControls.style.display = "flex";
            this.domElements.createOwn.style.display = "none";
            this.domElements.subheading.style.display = "none";
            this.domElements.heading.style.display = "none";
            this.domElements.steal.style.display = "none";
            this.domElements.tutorialButton.style.display = "none";
            if (uploadedFiles.length <= 50) {
                this.domElements.download.style.display = 'inline-block';
            } else {
                this.domElements.download.style.display = 'none';
            }
        }
        this.images = [];
        uploadedFiles.sort((a, b) => a.name.localeCompare(b.name));
        uploadedFiles.forEach((file, index) => {
            let img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                this.images[index] = img;
                if (index === 0) {
                    this.displayImage(0, 2);
                }
            };
        });
        this.totalImages = uploadedFiles.length;
        this.domElements.myRange.max = this.totalImages * 10;
        this.domElements.myRange.value = 0;
        this.displayImage(0, 2);
    }

    handleZoomChange() {
        this.maxZoom = Number(this.domElements.zoomInput.value);
        this.domElements.myRange.max = (this.maxZoom - 1) * 10 * this.totalImages;
        this.displayImage(Math.floor(this.domElements.myRange.value / (10 * this.maxZoom)), this.maxZoom - (this.domElements.myRange.value % (10 * this.maxZoom)) * 0.1);
    }

    async handleDownload() {
        let confirmation = confirm("Warning, this function can crash your browser if it can't handle the number of images. Proceed?");
        if (!confirmation) {
            return;
        }
        let zip = new JSZip();
        for (let i = 0; i <= this.domElements.myRange.max; i++) {
            this.domElements.myRange.value = i;
            let framesPerImage = Math.ceil(this.domElements.myRange.max / this.totalImages);
            let imageIndex = Math.min(Math.floor(i / framesPerImage), this.totalImages - 1);
            let frameProgress = i % framesPerImage;
            let zoomDecrement = (this.maxZoom - 1.1) / (framesPerImage - 1);
            let zoom;
            if (frameProgress === 0 && imageIndex !== this.totalImages - 1) {
                zoom = this.maxZoom;
            } else if (imageIndex === this.totalImages - 1 && frameProgress === 0) {
                if (i === this.domElements.myRange.max){
                    zoom = 1;
                } else {
                    zoom = this.maxZoom
                }
            } else {
                zoom = this.maxZoom - frameProgress * zoomDecrement;
            }
            this.displayImage(imageIndex, zoom);
            let dataUrl = this.domElements.imageCanvas.toDataURL('image/png');
            let base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
            zip.file(`SLIDE ${i}.png`, base64Data, {base64: true});
        }
        zip.generateAsync({type:"blob"}).then(function(content) {
            let a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = 'SLIDES.zip';
            a.click();
        });
    }

    handleSave() {
        let dataUrl = this.domElements.imageCanvas.toDataURL('image/png');
        let a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'SLIDE ' + this.domElements.myRange.value + '.png';
        a.click();
    }

    handleRandom() {
        let randomValue = Math.floor(Math.random() * (this.domElements.myRange.max - this.domElements.myRange.min + 1)) + Number(this.domElements.myRange.min);
        this.domElements.myRange.value = randomValue;
        let imageIndex = Math.floor(randomValue / 10);
        let zoom = 2 - (randomValue % 10) * 0.1;
        imageIndex = Math.min(imageIndex, this.images.length - 1);
        this.displayImage(imageIndex, zoom);
    }

    handleSkipOne() {
        this.handleSkip(1);
    }

    handleSkipTen() {
        this.handleSkip(10);
    }

    handleSkipBackOne() {
        this.handleSkipBack(1);
    }

    handleSkipBackTen() {
        this.handleSkipBack(10);
    }

    handleSkip(skipAmount) {
        let newValue = Math.min(Number(this.domElements.myRange.value) + skipAmount, this.domElements.myRange.max);
        this.updateImageAndZoom(newValue);
    }

    handleSkipBack(skipAmount) {
        let newValue = Math.max(Number(this.domElements.myRange.value) - skipAmount, this.domElements.myRange.min);
        this.updateImageAndZoom(newValue);
    }

    updateImageAndZoom(newValue) {
        this.domElements.myRange.value = newValue;
        let val = newValue;
        let framesPerImage = Math.ceil(this.domElements.myRange.max / this.totalImages);
        let imageIndex = Math.min(Math.floor(val / framesPerImage), this.totalImages - 1);
        let frameProgress = val % framesPerImage;
        let zoomDecrement = (this.maxZoom - 1.1) / (framesPerImage - 1);
        let zoom;
        if (frameProgress === 0 && imageIndex !== this.totalImages - 1) {
            zoom = this.maxZoom;
        } else if (imageIndex === this.totalImages - 1 && frameProgress === 0) {
            if(val === this.domElements.myRange.max){
                zoom = 1.0
            } else {
                zoom = this.maxZoom;
            }   
        } else {
            zoom = this.maxZoom - frameProgress * zoomDecrement;
        }
        this.displayImage(imageIndex, zoom);
    }

    async loadImage(path, extension) {
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
    }

    async loadImages() {
        let loadingPromises = [];
        this.displayImage(0, 2);
        for (let i = 0; i < this.totalImages; i++) {
            for (let ext of this.imageExtensions) {
                loadingPromises.push(
                    this.loadImage(this.imagePaths[i], ext)
                        .then(img => {
                            this.images[i] = img;
                            if (this.imagePaths[i] === '001') {
                                this.displayImage(0, 2);
                            }
                            this.domElements.myRange.disabled = false; 
                            this.domElements.loading.style.display = "none";
                        })
                        .catch(err => {
                            console.error(err.message);
                            this.totalImages = i;
                            throw err;
                        })
                );
            }
            if (this.totalImages === i) break;
        }
        try {
            await Promise.all(loadingPromises);
        } catch (err) {
            // Do nothing
        }
        this.domElements.myRange.max = (this.maxZoom - 1) * 10 * this.totalImages;
    }

    displayImage(index, zoom) {
        let context = this.domElements.imageCanvas.getContext("2d");
        context.clearRect(0, 0, this.domElements.imageCanvas.width, this.domElements.imageCanvas.height);
        context.save();
        context.translate(this.domElements.imageCanvas.width / 2, this.domElements.imageCanvas.height / 2);
        context.scale(zoom, zoom);
        context.translate(-this.domElements.imageCanvas.width / 2, -this.domElements.imageCanvas.height / 2);
        if (this.images[index]) {
            context.drawImage(this.images[index], 0, 0, this.domElements.imageCanvas.width, this.domElements.imageCanvas.height);
        } else {
            context.fillStyle = 'gray';
            context.fillRect(0, 0, this.domElements.imageCanvas.width, this.domElements.imageCanvas.height);
            context.fillStyle = 'white';
            context.font = '24px Arial';
            context.textAlign = 'center';
            context.fillText('Loading...', this.domElements.imageCanvas.width / 2, this.domElements.imageCanvas.height / 2);
        }
        context.restore();
    }

    async validateImageSizes(files) {
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
    }
}

new SlideApp();

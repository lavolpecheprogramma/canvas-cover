(function() {
	var offlineCanvases = {};
	var callback = null;
	var lastFrame = 0;
	var imagesLoaded = {};
	var animationRequestAdded = false;
	var animationEnable = true;

	var animationOn = {
		sprite: null,
		image: null
	}

	var canvasElement = createCanvas(true);

	var animationOn = {
		sprite: null,
		image: null
	}

	preloadImage( 'mask-in', 'mask-in.png', true, {
		n: 25,
		mode: 'add',
		wait: 0,
		step: 0
	});

	preloadImage( 'mask-out', 'mask-in.png', true, {
		n: 25,
		mode: 'remove',
		wait: 0,
		step: 25
	});

	preloadImage( 'image', 'hulk.jpg' );

	window.addEventListener('resize', onResizeWindow , true);
	onResizeWindow()

	function createCanvas(append){
		var c = document.createElement('canvas');
		if(append){
			document.body.appendChild(c);
		}
		return {
			canvas: c,
			ctx: c.getContext("2d")
		}
	}

	function onLoadedImage(){
		if(this.isSprite){
			calculateSpriteOptions(this);
			var opts = calculateCoverDimension(this.sequenceOpts.sw, this.sequenceOpts.sh)
			this.sequenceOpts.cw = opts.cw;
			this.sequenceOpts.ch = opts.ch;
			this.sequenceOpts.offW = (opts.cw - window.innerWidth)/2;
			this.sequenceOpts.offH = (opts.ch - window.innerHeight)/2;
			//animationOn.sprite = this;
			offlineCanvases[this.id] = createCanvas(false);
			drawImageOffline(this);
		}else{
			var opts = calculateCoverDimension(this.width, this.height);
			this.cw = opts.cw;
			this.ch = opts.ch;
			this.offW = (opts.cw - window.innerWidth)/2;
			this.offH = (opts.ch - window.innerHeight)/2;
			//animationOn.image = this;
		}
		this.isLoaded = true;
		this.onload = null;
		console.log(imagesLoaded);
	}

	function preloadImage(id, src, isSprite, spriteOpts){
		var i = document.createElement('img');
		i.onload = onLoadedImage;
		i.isSprite = isSprite;
		if(spriteOpts){
			i.sequenceOpts = spriteOpts;
		}
		
		i.src = src;
		i.id = id;
		i.isLoaded = false;
		imagesLoaded[id] = i;
	}

	function onResizeWindow(){
		setCanvasFillWindow();
		for (var i = imagesLoaded.length - 1; i >= 0; i--) {
			if(imagesLoaded[i].isSprite){
				var opts = calculateCoverDimension(animationOn.sprite.sequenceOpts.sw, animationOn.sprite.sequenceOpts.sh)
				animationOn.sprite.sequenceOpts.cw = opts.cw;
				animationOn.sprite.sequenceOpts.ch = opts.ch;
				animationOn.sprite.sequenceOpts.offW = (opts.cw - window.innerWidth)/2;
				animationOn.sprite.sequenceOpts.offH = (opts.ch - window.innerHeight)/2;
			}else{
				var opts = calculateCoverDimension(animationOn.image.width, animationOn.image.height);
				animationOn.image.cw = opts.cw;
				animationOn.image.ch = opts.ch;
				animationOn.image.offW = (opts.cw - window.innerWidth)/2;
				animationOn.image.offH = (opts.ch - window.innerHeight)/2;
				if(animationEnable){
					canvasElement.ctx.globalCompositeOperation = "source-over";
					canvasElement.ctx.drawImage(animationOn.image,0,0, animationOn.image.width,animationOn.image.height,  -animationOn.image.offW, -animationOn.image.offH,animationOn.image.cw,animationOn.image.ch);
					canvasElement.ctx.globalCompositeOperation = "destination-in";
					canvasElement.ctx.drawImage(animationOn.sprite.offlineCanvas.canvas,0+animationOn.sprite.sequenceOpts.step*animationOn.sprite.sequenceOpts.sw,0, animationOn.sprite.sequenceOpts.sw,animationOn.sprite.sequenceOpts.sh, -animationOn.sprite.sequenceOpts.offW,-animationOn.sprite.sequenceOpts.offH,animationOn.sprite.sequenceOpts.cw,animationOn.sprite.sequenceOpts.ch );
				}
			}
		}
	}

	function setCanvasFillWindow(){
		canvasElement.canvas.width = window.innerWidth;
		canvasElement.canvas.height = window.innerHeight;
		canvasElement.ctx.width = window.innerWidth;
		canvasElement.ctx.height = window.innerHeight;
	}

	function calculateSpriteOptions(sprite){
		sprite.sequenceOpts.sw = sprite.width/sprite.sequenceOpts.n;
		sprite.sequenceOpts.sh = sprite.height;
	}

	function calculateCoverDimension(width,height){
		var imageRatio =width/height;
		var coverRatio = window.innerWidth/window.innerHeight;

		if (imageRatio >= coverRatio) {
		   var coverHeight = window.innerHeight;
		   var scale = (coverHeight / height);
		   var coverWidth =width * scale;
		} else {
		   var coverWidth = window.innerWidth;
		   var scale = (coverWidth / width);
		   var coverHeight = height * scale;
		}

		return {
			cw: coverWidth,
			ch: coverHeight
		}		
	}

	function drawImageOffline(image){

		offlineCanvases[image.id].canvas.width = image.width;
		offlineCanvases[image.id].canvas.height = image.height;
		offlineCanvases[image.id].ctx.width = image.width;
		offlineCanvases[image.id].ctx.height = image.height;

		offlineCanvases[image.id].ctx.drawImage(image,0,0);
		//offlineCanvases[image.id].ctx.fillRect(0, 0, offlineCanvases[image.id].canvas.width, offlineCanvases[image.id].canvas.height);
	}

	function animateIn(){
		//set variables
		animationOn.sprite = imagesLoaded['mask-in'];
		animationOn.image = imagesLoaded['image'];
		drawImageOffline(imagesLoaded['mask-in']);
		lastFrame = Date.now();
		animationEnable = true;
		callback = window.animateOut;
		if(!animationRequestAdded){
			//window.addRequestAnimation(animate);
			animate();
		}
	}

	function animateOut(){
		//set variables
		animationOn.sprite = imagesLoaded['mask-out'];
		animationOn.image = imagesLoaded['image'];
		drawImageOffline(imagesLoaded['mask-out'])
		lastFrame = Date.now();
		animationEnable = true;
		if(!animationRequestAdded){
			//window.addRequestAnimation(animate);
			animate();
		}
	}

	function animate(){
		if(!animationEnable){
			return;
		}
		reqAnim = requestAnimationFrame(animate);
		now = Date.now();
		if(now - lastFrame < 40){
			return;
		}
		lastFrame = now;

		if(animationOn.sprite == null || animationOn.image == null){
			return;
		}
		
		console.log('transition', 0+animationOn.sprite.sequenceOpts.step*animationOn.sprite.sequenceOpts.sw);
		canvasElement.ctx.clearRect(0, 0, canvasElement.canvas.width, canvasElement.canvas.height);
		canvasElement.ctx.globalCompositeOperation = "source-over";
		canvasElement.ctx.drawImage(animationOn.image,0,0, animationOn.image.width,animationOn.image.height,  -animationOn.image.offW, -animationOn.image.offH,animationOn.image.cw,animationOn.image.ch);
		canvasElement.ctx.globalCompositeOperation = "destination-in";
		canvasElement.ctx.drawImage(offlineCanvases[animationOn.sprite.id].canvas,0+animationOn.sprite.sequenceOpts.step*animationOn.sprite.sequenceOpts.sw,0, animationOn.sprite.sequenceOpts.sw,animationOn.sprite.sequenceOpts.sh, -animationOn.sprite.sequenceOpts.offW,-animationOn.sprite.sequenceOpts.offH,animationOn.sprite.sequenceOpts.cw,animationOn.sprite.sequenceOpts.ch );

		if(animationOn.sprite.sequenceOpts.mode == "add"){
			animationOn.sprite.sequenceOpts.step++;
			
			if(animationOn.sprite.sequenceOpts.step > animationOn.sprite.sequenceOpts.n){
				animationOn.sprite.sequenceOpts.step = 0;
				animationEnable = false;
				if(callback != null){
					callback();
				}
				// animationOn.sprite.sequenceOpts.mode = "remove"
				// animationOn.sprite.sequenceOpts.wait = 50;
			}
		}else{
			animationOn.sprite.sequenceOpts.step--;
			if(animationOn.sprite.sequenceOpts.step < 0){
				animationOn.sprite.sequenceOpts.step = 0;
				animationEnable = false;
				if(callback != null){
					callback();
				}
				// animationOn.sprite.sequenceOpts.step = 0;
				// animationOn.sprite.sequenceOpts.mode = "add";
				// animationOn.sprite.sequenceOpts.wait = 50;

			}
		}
	}
	window.animate = {
		animateIn: animateIn,
		animateOut: animateOut
	};
	setTimeout(window.animate.animateIn, 500);
	setTimeout(window.animate.animateOut, 2500);
}());

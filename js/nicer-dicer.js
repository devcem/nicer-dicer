var app = {
	canvas  : null,
	context : null,
	width   : 0,
	height  : 0,
	image   : null,
	table : {
		row : 0,
		col : 0,
		width : 0,
		height : 0
	},
	output : [],
	_output : [],
	init : function(){
		this.canvas  = document.getElementById('canvas');
		this.context = this.canvas.getContext('2d');

		document.getElementById('file').onchange = function(e){
			app.uploadImage(e.target.files[0]);
		}

		this.render();
	},
	render : function(){
		this.context.clearRect(0, 0, this.width, this.height);
		this.update();

		window.requestAnimationFrame(app.render.bind(this));
	},
	update : function(){
		//Draw image
		if(this.image){
			this.canvas.width  = this.width;
			this.canvas.height = this.height;

			this.context.drawImage(this.image, 0, 0);
		}

		//Apply zoom
		$('#canvas').css('zoom', parseFloat($('#zoom').val()));

		//Get information from elements
		app.table.col = $('#col_number').val();
		app.table.row = $('#row_number').val();

		app.table.width  = $('#sliced_width').val();
		app.table.height = $('#sliced_height').val();

		var slicedWidth  = app.table.width;
		var slicedHeight = app.table.height;

		var cellPaddingX = parseInt($('#cell_padding_x').val());
		var cellPaddingY = parseInt($('#cell_padding_y').val());

		var totalWidth = (slicedWidth * app.table.col) + cellPaddingX * app.table.col;
		var totalMarginLeft = (app.width/2 - totalWidth) + totalWidth/2;

		var marginTop = parseInt($('#margin_top').val());

		app.output = [];

		for(x = 0; x < app.table.col; x++){
			for(y = 0; y < app.table.row; y++){
				/*
				this.context.beginPath();
				this.context.moveTo(x * slicedWidth, y * slicedHeight);
				this.context.lineTo((x+1) * slicedWidth, (y+1) * slicedHeight);
				this.context.stroke();
				*/
				

				if(x > 0){
					var xPos = cellPaddingX*x + totalMarginLeft + (x * slicedWidth);
					var yPos = marginTop + (y * slicedHeight);
				}else{
					var xPos = totalMarginLeft + (x * slicedWidth);
					var yPos = marginTop + (y * slicedHeight);
				}

				this.context.rect(xPos, yPos, slicedWidth, slicedHeight);

				app.output.push({ x : xPos, y : yPos, width : slicedWidth, height : slicedHeight });

				this.context.stroke();
			}
		}
	},
	uploadImage : function(file){
		var reader = new FileReader();

		reader.onload = function(file){
			var image = new Image();
			image.src = file.target.result;

			image.onload = function(){
				app.drawImage(image);
			}
		}

		reader.readAsDataURL(file);
	},
	drawImage : function(image){
		this.width  = image.width;
		this.height = image.height;

		this.canvas.width  = this.width;
		this.canvas.height = this.height;

		this.image = image;
	},
	downloadOutput : function(){
		for(item in app.output){
			var slicedImage = app.output[item];

			var resizedCanvas = document.createElement("canvas");
			var resizedContext = resizedCanvas.getContext("2d");

			resizedCanvas.width  = slicedImage.width;
			resizedCanvas.height = slicedImage.height;

			var canvas  = app.canvas;
			var context = app.context;

			resizedContext.drawImage(canvas, -slicedImage.x, -slicedImage.y);
			var myResizedData = resizedCanvas.toDataURL();

			app._output.push(myResizedData);

			var a = $("<a>")
			    .attr("href", myResizedData)
			    .attr("download", "sliced_" + item + ".jpg")
			    .appendTo("body");

			a[0].click();

			a.remove();

		}
	}
};

window.onload = function(){
	app.init();
}
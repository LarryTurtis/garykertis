
        var notEveryTime = 0;
        var canvas = document.getElementById('sun');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
		
        var context = canvas.getContext('2d');
        var colors = ["96a8af", "c15420", 'a7bc6e', 'rgb(235,177,35)'];
		
		
        var barW = 50;
		
		var rand = [];
        for (var j = -5; j <= canvas.width+1 / barW; j++) {
			rand[j] = Math.ceil(Math.random()*100)+30;		
		}

        var y = 0;
		var gap = -10;
        var now = true;
        var increment = 2;
        animate();

	
	function fire() {
		gap = -10;
		now = true;
        for (j = -5; j <= canvas.width+1 / barW; j++) {
			rand[j] = Math.ceil(Math.random()*100)+30;
				
		}
	}


    function animate() {

        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
            };
        })();
        (function animloop() {
            requestAnimFrame(animloop);
            sunlight();

        })();
    }

    function sunlight() {
        x = 0;
 

         //if(--notEveryTime>0){ return; }; 

      
			
        context.lineWidth = 1;
        context.strokeStyle = '674e4d';
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (gap<canvas.height/3) gap+=15; else now=false;
        for (j = -5; j <= canvas.width+1 / barW; j++) {

            heit = canvas.height / 2;
			y = heit - gap + rand[j];
            

            if (x == colors.length - 1) x = 0; else x++;
            context.fillStyle = colors[x];
			
            context.beginPath();
			
			points1 = {
				a: {
					x: j*barW,
					y: 0,
				},
				b: {
					x: (y)*.35 + (j*barW),
					y: y
				},
				c: {
					x: (y)*.35 + ((j+1)*barW),
					y: y
				},
				d: {
					x: (j+1) * barW,
					y: 0
				}
			}
			
			y = heit + gap - rand[j];
		
						
			points2 = {
				a: {
					x: j*barW,
					y: canvas.height,
				},
				b: {
					x: (j*barW),
					y: y
				},
				c: {
					x: ((j+1)*barW),
					y: y
				},
				d: {
					x: ((j+1) * barW),
					y: canvas.height
				}
			}
			
            context.moveTo(points1.a.x,points1.a.y);
            context.lineTo(points1.b.x,points1.b.y);
            context.lineTo(points1.c.x,points1.c.y);
            context.lineTo(points1.d.x,points1.d.y);
			context.closePath();
            context.stroke();
            context.fill();

			
            context.moveTo(points2.a.x,points2.a.y);
            context.lineTo(points2.b.x,points2.b.y);
            context.lineTo(points2.c.x,points2.c.y);
            context.lineTo(points2.d.x,points2.d.y);
			context.closePath();
            context.stroke();
            context.fill();
            

        }
        notEveryTime = 3;

    }
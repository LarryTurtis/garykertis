
        var notEveryTime = 3;
        var canvas = document.getElementById('sun');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
		
        var context = canvas.getContext('2d');
        var colors = ["96a8af", "c15420", 'a7bc6e', 'rgb(235,177,35)'];
		
		
        var barW = 50;
		

        var y = 0;
		var gap = -10;
        var now = true;
        var increment = 2;
        animate();

	
	function fire() {
		gap = -10; 
		now = true;
	}

function shuffle(array) {
    if(--notEveryTime>0){ return; }; 
    var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  notEveryTime = 6;
  return array;
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

      
			
        context.lineWidth = 2;
        context.strokeStyle = '#674e4d';
        context.clearRect(0, 0, canvas.width, canvas.height);

        str = document.getElementById('viewAnimate').attributes.class.value;
        if (str.search('ng-animate') > 0) shuffle(colors);
        //if (gap < 50) {gap+=5; shuffle(colors);} else now = false;
        for (j = -5; j <= canvas.width+1 / barW; j++) {

            if (x == colors.length - 1) x = 0; else x++;
            context.fillStyle = colors[x];
			
            context.beginPath();
			
			points1 = {
				a: {
					x: j*(barW)+1,
					y: 0,
				},
				b: {
					x: (j*(barW))+1,
					y: canvas.height
				},
				c: {
					x: ((j+1)*(barW)),
					y: canvas.height
				},
				d: {
					x: (j+1) * (barW),
					y: 0
				}
			}
			
			
            context.moveTo(points1.a.x,points1.a.y);
            context.lineTo(points1.b.x,points1.b.y);
            context.lineTo(points1.c.x,points1.c.y);
            context.lineTo(points1.d.x,points1.d.y);
			context.closePath();
			context.fill();
            context.stroke();
        }
    }
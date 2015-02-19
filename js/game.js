// -----------------------------------------
// Variables
// -----------------------------------------
/*jslint plusplus: true */
/*jslint browser: true*/
/*global $, jQuery, alert*/
var looper = 0;
var w = {
	score  :    0,
    highScore : localStorage.getItem("w_highscore") || 0,
    unit :    100,
    getSquarePos : function (x, y) { // given x and y of square, return square id
        "use strict";
        var pos = y * w.field.totX + x;
        return pos;
    },
    getSquareCoords : function (pos) {
        "use strict";
        var coords = [],
            x = pos % w.field.totX,
            y = Math.floor(pos / w.field.totX);
        coords.push(x, y);
        return coords;
    },
	field  :  {
        MaxPawnValue    : 6,
        totX            : 6,
        totY            : 6,
        square          : [],
        startPawns      : 20,
        selected        : 0,
        start           : null,
        stop            : null,
        valid           : false,
        pawns           : 0,
        gameover : function () {
            if (w.field.pawns >= (w.field.totX * w.field.totY) -2 || w.field.pawns <=3)  {
                if (w.score > w.highScore){
                    localStorage.setItem("w_highscore", w.score);
                }
                location.reload();
            }
        },
        render : function () {
            "use strict";
            $('#Field').children().each(function (index) {
                $(this).removeClass("Pawn white black");
                $(this).empty();
                if (w.field.square[index].value !== 0) {
                    $(this).addClass("Pawn");
                    $(this).addClass(w.field.square[index].color);
                    $(this).html('<div>' + (parseInt(w.field.square[index].value, 10)) + '</div>');
                }
            });	// -- End placing cycle
            //score render
            $('#Scoreboard').html('<p>' + w.score + ' - Top: ' + w.highScore + '</p>');
        }, // -- end render function
        move : function (dir) {
            "use strict";
            var start = w.getSquareCoords(w.field.start),
                startX = start[0],
                startY = start[1],
                startColor = w.field.square[w.field.start].color,
                startValue = w.field.square[w.field.start].value,
                dirX = 0,  // vector for x direction
                dirY = 0,  // vector for Y direction
                currentX = null,
                currentY = null,
                current = null,
                currentColor = "",
                currentValue = 0;
            
            //firts thing check if is gameover
            w.field.gameover();
            
            switch (dir) {
			case "up":
				dirX = 0;
				dirY = -1;
				break;
			case "down":
				dirX = 0;
				dirY = 1;
				break;
			case "left":
				dirX = -1;
				dirY = 0;
				break;
			case "right":
				dirX = 1;
				dirY = 0;
				break;
            } // -- End dir switch
            console.log("x: " + startX + " y: " + startY + " dirX: " + dirX + " dirY: " + dirY);
            currentX = startX + dirX;
            currentY = startY + dirY;
            
		// ------ Start check if valid move -------

// out of bonds: no change needed
            if (currentX >= w.field.totX || currentX < 0 || currentY >= w.field.totY || currentY < 0) {
                console.log("out of bonds");
                return;
            }

// current not out of bonds
            current = w.getSquarePos(currentX, currentY);
            currentColor = w.field.square[current].color;
            currentValue = w.field.square[current].value;
            console.log(current);
// current opposite and different: no change needed
            if (startColor !== currentColor && startValue !== currentValue && currentValue !== 0) {
                console.log("blocked by opposite");
                return;
            }
// empty space: can move
            if (currentValue === 0) {
                // set new value in empty space
                w.field.square[current].color = startColor;
                w.field.square[current].value = startValue;
                // clear old space
                w.field.square[w.field.start].color = "";
                w.field.square[w.field.start].value = 0;
                // set new starting point
                w.field.start = current;
                // render new situation
                w.field.render();
                // loop function
                looper = looper + 1;
                console.log ("loop nr. " + looper);
                w.field.move(dir);
            }
//same color = sum
            if (startColor === currentColor) {
                // set new value in empty space
                w.field.square[current].value = startValue + currentValue;
                w.score = w.score + startValue + currentValue;
                // clear old space
                w.field.square[w.field.start].color = "";
                w.field.square[w.field.start].value = 0;
                w.field.pawns = w.field.pawns - 1;
                
                w.field.addPawn(2);
                w.field.render();
                
            }

//different color same value = boom
            if (startColor !== currentColor && startValue === currentValue) {
                w.score = w.score + (startValue * currentValue);
                w.field.square[current].value = 0;
                w.field.square[current].color = "";
                // clear old space
                w.field.square[w.field.start].color = "";
                w.field.square[w.field.start].value = 0;
                w.field.pawns = w.field.pawns - 2;
                w.field.render();
            }
        }, // -- End move function
        addPawn : function (nr) {
            "use strict";
            var i = 0;
            while (i <= nr) {
                var rand = Math.floor(Math.random() * (w.field.totX * w.field.totY)),
                    randValue = (Math.floor(Math.random() * w.field.MaxPawnValue)) + 1;
                console.log(rand + " - " + randValue + " -- " + i + " >-< " + w.field.pawns);
                if (w.field.square[rand].value === 0) {
                    i++;
                    w.field.pawns = w.field.pawns + 1;
                    w.field.square[rand].value = randValue;
                    if (w.field.pawns % 2 === 1) {  //se dispari bianco
                        w.field.square[rand].color = "white";
                    } else {    // se pari nero
                        w.field.square[rand].color = "black";
                    }
                    if (w.field.pawns === 0) {  //se zero bianco
                        w.field.square[rand].color = "black";
                    }
                }
            }
        } // --End addPawn function
    }
};
	
var Square = function () {
    "use strict";
    this.id = 0;
    this.color = "";
    this.value = 0;
};	// End Square

// -----------------------------------------
// Main function
// -----------------------------------------
function _init() {
    "use strict";
    var i;
	// Clone the squares
	for (i = 0; i < w.field.totX * w.field.totY; i++) {
        $('.Square').first().clone().appendTo('#Field');
		w.field.square.push(new Square());
		w.field.square[i].id = i;
	} // -- end for
	$('.Square').last().remove();

	// place the squares --------------------
	$('#Field').children().each(function (index) {
		$(this).css({
			'left'	:	w.unit * w.getSquareCoords(index)[0],
			'top'	:	w.unit * w.getSquareCoords(index)[1]
		});	// -- End css positioning
		// on swipe on a square hammer.js
        var mc = new Hammer(this);
        var direction = "";
        mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        mc.on("panleft panright panup pandown", function(ev) {    
        switch(ev.direction){
            case 2: 
                direction = "left";
                break; 
            case  4:
                direction = "right";
                break;          
            case 8:
                direction = "up";
                break;
            case 16: 
                direction = "down";
                break;
            default: 
                w.direction = "";
        }
        var pos = $(ev.target).position();
        w.field.start = w.getSquarePos ((pos.left / w.unit), (pos.top / w.unit));
        if (w.field.square[w.field.start].value != 0){
                console.log("start is not a pawn");
                w.field.move(direction);
        } 

    });


    });	// -- End placing cycle
    
	//place the pawns 
	w.field.addPawn(w.field.startPawns - 1);
	//render the pawns
	w.field.render();
} // -- End _init

// -----------------------------------------
// Game Start
// -----------------------------------------
$(function () {
    "use strict";
	_init();
});	// -- End Main Jquery function
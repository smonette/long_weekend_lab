/**
 * Created by // frontside.com.au
 *
 * User: phil
 * Date: 14/02/13
 * Time: 3:54 PM
 *
 * Excuse the sloppy code. This was thrown together in a few hours.
 */

$(document).ready(function () {
    $.ajaxSetup({
        cache: true
    });
    var url1 = "http://code.createjs.com/easeljs-0.6.0.min.js";
    var url2 = "http://code.createjs.com/soundjs-0.4.0.min.js";
    $.getScript(url1, function () {
        $.getScript(url2, function () {


            new App();


        })
    })
});
function App() {
    $("#about").show();

    var self = this;
    var soundService=null;
    self.running = false;
    self.initialized = false;
    var stageClicked = false;
    var stage, canvas;

    var colors = ["#FFFFE0", "#BDFCC9", "#FFC0CB", "#DDA0DD", "#87CEEB", "#40E0D0", "#00CCCC"];
    var bounce = -0.75;
    var balls = [];
    var _gravityY = 0.01;
    var _gravityX = 0.0;
    var FPS = 30;
    var infoText, detailsText;
    var KEYCODE_UP = 38;    //usefull keycode
    var KEYCODE_LEFT = 37;    //usefull keycode
    var KEYCODE_RIGHT = 39;   //usefull keycode
    var KEYCODE_DOWN = 40;    //usefull keycode
    var ballsInitalized = false;
    var iOS = navigator.userAgent.match(/(iPod|iPhone|iPad)/);

    self.initialize = function () {
        toggleListeners(true);
        self.initCanvas();
        self.initGame();
        // setTimeout(function(){
        // soundService = new soundModel();
        // soundService.controller = self;
        // },200)


        log("9", "AppController", "initialize", "");
    };


    var toggleListeners = function (enable) {
        if (!enable)return;

    };

    self.refresh = function () {

    }
    self.start = function () {
      //  self.initGame()
        self.refresh()
        window.addEventListener("devicemotion", onDeviceMotion, false);
        stage.addEventListener("stagemousedown", onStagePress);
        stage.addEventListener("stagemouseup", onStageRelease);
        $(document).bind('keydown', onKeyboardPress)
    }
    self.initCanvas = function () {
        canvas = $("#test").get(0);
        stage = new createjs.Stage(canvas);

        infoText = new createjs.Text();
        infoText.lineWidth = "500";
        infoText.textAlign = "center";
        infoText.border = 1;
        infoText.y = $(window).height() / 2;
        infoText.mouseEnabled = false;

        detailsText = new createjs.Text("", "10px Arial", "#FFF");
        detailsText.x = 10;
        detailsText.y = 2;
        detailsText.mouseEnabled = false;

        stage.addChild(detailsText);
        stage.addChild(infoText);


        window.addEventListener('resize', onStageResize, false);
        onStageResize();
        createjs.Touch.enable(stage);
        createjs.Ticker.addListener(tick);
        createjs.Ticker.setFPS(FPS);


        self.initialized = true;
    }
    self.initGame = function () {
        if (!iOS) {
            initBalls($(window).width() / 2, $(window).height() / 2);
        } else {
            infoText.text = "Touch to start."
        }
    }
    var onStageResize = function () {
        stage.canvas.width = $(window).width()
        stage.canvas.height = $(window).height()
        infoText.x = ($(window).width() / 2) - 0;
    }

    var onStagePress = function (e) {
        if (!stageClicked) {
            stageClicked = true;
            infoText.text = "Tilt your device or use your keyboard to change gravity."
        }
        if (!ballsInitalized) {
            initBalls(e.stageX, e.stageY);
            // infoText.text = "Click or touch to add more balls"
        } else {
            infoText.text = "Tilt your device or use your keyboard to change gravity."
            addBall(e.stageX, e.stageY, e.pointerID)
        }
    }
    var initBalls = function (stageX, stageY) {
        ballsInitalized = true;
        var tx = 0;
        var ty = 0;
        for (var i = 0; i < 7; i++) {
            tx = rand(-300, 300);
            ty = rand(-200, 200);
            addBall(stageX + tx, stageY + ty, NaN)
        }
        // infoText.text = "Click or touch to add more balls."
    }
    var onStageRelease = function (e) {
        for (var i = 0; i < numBalls(); i++) {
            var b = balls[i];

            if (b.pointerID == e.pointerID) {
                b.pointerID = NaN;
                log("66", "onStageRelease", "b", b.pointerID);
            }

        }
    }
    var addBall = function (x, y, pointerID) {
        // if (!self.running) {
        //     if(soundService){
        //       soundService.playSound(100)
        //     }
        //     self.running = true;

        // }
        var shape = new createjs.Shape();
        shape.id = balls.length;
        shape.pointerID = pointerID
        var r = Math.random() * colors.length | 0;
        shape.color = colors[r];
        shape.graphics.beginFill(shape.color);
        shape.radius = 10 + (r * 4);
        shape.mass = shape.radius;
        shape.graphics.drawCircle(0, 0, shape.radius)
        shape.x = x || (Math.random() * canvas.width);
        shape.y = y || (Math.random() * canvas.height);
        shape.vx = rand(-3, 3)
        shape.vy = rand(-3, 3)
        stage.addChild(shape);
        balls.push(shape);
    }
    var numBalls = function () {
        return balls.length;
    }
    var tick = function () {
        balls.forEach(move);
        for (var ballA, i = 0, len = numBalls() - 1; i < len; i++) {
            ballA = balls[i];
            for (var ballB, j = i + 1; j < numBalls(); j++) {
                ballB = balls[j];
                checkCollision(ballA, ballB);
            }
        }
        // detailsText.text = "Gravity: x" + (~~(_gravityX * 100) / 100) + " : y" + (~~(_gravityY * 100) / 100)

        stage.update();
    }


    var rotate = function (x, y, sin, cos, reverse) {
        return {
            x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
            y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
        };
    }

    var checkCollision = function (ball0, ball1) {
        var dx = ball1.x - ball0.x,
                dy = ball1.y - ball0.y,
                dist = Math.sqrt(dx * dx + dy * dy);
        //collision handling code here
        if (dist < ball0.radius + ball1.radius) {
            //calculate angle, sine, and cosine
            var angle = Math.atan2(dy, dx),
                    sin = Math.sin(angle),
                    cos = Math.cos(angle),
            //rotate ball0's position
                    pos0 = {x: 0, y: 0}, //point
            //rotate ball1's position
                    pos1 = rotate(dx, dy, sin, cos, true),
            //rotate ball0's velocity
                    vel0 = rotate(ball0.vx, ball0.vy, sin, cos, true),
            //rotate ball1's velocity
                    vel1 = rotate(ball1.vx, ball1.vy, sin, cos, true),
            //collision reaction
                    vxTotal = vel0.x - vel1.x;
            vel0.x = ((ball0.mass - ball1.mass) * vel0.x + 2 * ball1.mass * vel1.x) /
                    (ball0.mass + ball1.mass);
            vel1.x = vxTotal + vel0.x;
            //update position - to avoid objects becoming stuck together
            var absV = Math.abs(vel0.x) + Math.abs(vel1.x),
                    overlap = (ball0.radius + ball1.radius) - Math.abs(pos0.x - pos1.x);
            pos0.x += vel0.x / absV * overlap;
            pos1.x += vel1.x / absV * overlap;
            //rotate positions back
            var pos0F = rotate(pos0.x, pos0.y, sin, cos, false),
                    pos1F = rotate(pos1.x, pos1.y, sin, cos, false);
            //adjust positions to actual screen positions
            // ball1.x = ball0.x + pos1F.x;
            setBallX(ball1, ball0.x + pos1F.x)
            //ball1.y = ball0.y + pos1F.y;
            setBallY(ball1, ball0.y + pos1F.y)
            // ball0.x = ball0.x + pos0F.x;
            setBallX(ball0, ball0.x + pos0F.x)
            // ball0.y = ball0.y + pos0F.y;
            setBallY(ball0, ball0.y + pos0F.y)
            //rotate velocities back
            var vel0F = rotate(vel0.x, vel0.y, sin, cos, false),
                    vel1F = rotate(vel1.x, vel1.y, sin, cos, false);
            ball0.vx = vel0F.x;
            ball0.vy = vel0F.y;
            ball1.vx = vel1F.x;
            ball1.vy = vel1F.y;
            var color1 = ball0.color;
            var color2 = ball1.color;
            ball0.color = color2;
            ball0.graphics.clear();
            ball0.graphics.beginFill(color2);
            ball0.graphics.drawCircle(0, 0, ball0.radius)

            ball1.color = color1;
            ball1.graphics.clear();
            ball1.graphics.beginFill(color1);
            ball1.graphics.drawCircle(0, 0, ball1.radius)
        }
    }


    var checkWalls = function (ball) {
        if (ball.x + ball.radius > canvas.width) {
            //  ball.x = canvas.width - ball.radius;
            setBallX(ball, canvas.width - ball.radius)
            ball.vx *= bounce;
        } else
            if (ball.x - ball.radius < 0) {
                // ball.x = ball.radius;
                setBallX(ball, ball.radius)
                ball.vx *= bounce;
            }
        if (ball.y + ball.radius > canvas.height) {
            //  ball.y = canvas.height - ball.radius;
            setBallY(ball, canvas.height - ball.radius)
            ball.vy *= bounce;
        } else
            if (ball.y - ball.radius < 0) {
                //ball.y = ball.radius;
                setBallY(ball, ball.radius)
                ball.vy *= bounce;
            }
    }

    var move = function (ball) {
        ball.vy += _gravityY;
        ball.vx += _gravityX;
        setBallX(ball, ball.x + ball.vx)
        setBallY(ball, ball.y + ball.vy)
        checkWalls(ball);
    }
    var setBallX = function (ball, x) {
        if (isNaN(ball.pointerID)) {
            ball.x = x
        }
    }
    var setBallY = function (ball, y) {
        if (isNaN(ball.pointerID)) {
            ball.y = y
        }
    }


    var rand = function (min, max) {
        return Math.random() * (max - min) + min;
        return (Math.random() * max) + min;
    }

    var onKeyboardPress = function (e) {


        var code = (e.keyCode ? e.keyCode : e.which);
        var amt = 0.01;
        switch (code) {
        case KEYCODE_UP:
            _gravityY -= amt
            break;
        case KEYCODE_DOWN:
            _gravityY += amt
            break;
        case KEYCODE_LEFT:
            _gravityX -= amt
            break;
        case KEYCODE_RIGHT:
            _gravityX += amt
            break;
        default:
            break;
        }
    }
    var onDeviceMotion = function (event) {

        var eventDetails;
        try {
            var accel = event.accelerationIncludingGravity;
            eventDetails = "accel: { x: " + ~~(accel.x) +
                    " y: " + ~~(accel.y) +
                    " z: " + ~~(accel.z) +
                    " o: " + window.orientation;

            var o = window.orientation;

            switch (o) {
            case 0:
                _gravityX = ((accel.x)) * 0.01
                _gravityY = (accel.y + 9) * -0.01;
                break;
            case 180:
                _gravityX = ((accel.x)) * -0.01
                _gravityY = (accel.y + 9) * 0.01;
                break;

            case -90:
                _gravityY = ((accel.x - 9) * 1) * 0.01
                _gravityX = (accel.y * 1) * 0.01;
                break;

            case 90:
                _gravityY = ((accel.x + 8) * -1) * 0.01
                _gravityX = (accel.y * -1) * 0.01;
                break;
            }


        }
        catch (e) {
            eventDetails = e.toString();
        }

    }

    self.initialize();
    return self;
}




window.log = function f() {
    log.history = log.history || [];
    log.history.push(arguments);
    if (this.console) {
        var args = arguments, newarr;
        args.callee = args.callee.caller;
        newarr = [].slice.call(args);

        if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);
    }
};
(function (a) {
    function b() {}

    for (var c = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","), d; !!(d = c.pop());) {a[d] = a[d] || b;}
})

(function () {
    try {
        console.log();
        return window.console;
    } catch (a) {return (window.console = {});}
}());





      // window.requestAnimFrame = (function(callback) {
      //   return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
      //   function(callback) {
      //     window.setTimeout(callback, 1000 / 60);
      //   };
      // })();

      // function initBalls() {
      //   balls = [];

      //   var blue = '#3A5BCD';
      //   var red = '#EF2B36';
      //   var yellow = '#FFC636';
      //   var green = '#02A817';

      //   // G
      //   balls.push(new Ball(173, 63, 0, 0, blue));
      //   balls.push(new Ball(158, 53, 0, 0, blue));
      //   balls.push(new Ball(143, 52, 0, 0, blue));
      //   balls.push(new Ball(130, 53, 0, 0, blue));
      //   balls.push(new Ball(117, 58, 0, 0, blue));
      //   balls.push(new Ball(110, 70, 0, 0, blue));
      //   balls.push(new Ball(102, 82, 0, 0, blue));
      //   balls.push(new Ball(104, 96, 0, 0, blue));
      //   balls.push(new Ball(105, 107, 0, 0, blue));
      //   balls.push(new Ball(110, 120, 0, 0, blue));
      //   balls.push(new Ball(124, 130, 0, 0, blue));
      //   balls.push(new Ball(139, 136, 0, 0, blue));
      //   balls.push(new Ball(152, 136, 0, 0, blue));
      //   balls.push(new Ball(166, 136, 0, 0, blue));
      //   balls.push(new Ball(174, 127, 0, 0, blue));
      //   balls.push(new Ball(179, 110, 0, 0, blue));
      //   balls.push(new Ball(166, 109, 0, 0, blue));
      //   balls.push(new Ball(156, 110, 0, 0, blue));

      //   // // O
      //   // balls.push(new Ball(210, 81, 0, 0, red));
      //   // balls.push(new Ball(197, 91, 0, 0, red));
      //   // balls.push(new Ball(196, 103, 0, 0, red));
      //   // balls.push(new Ball(200, 116, 0, 0, red));
      //   // balls.push(new Ball(209, 127, 0, 0, red));
      //   // balls.push(new Ball(223, 130, 0, 0, red));
      //   // balls.push(new Ball(237, 127, 0, 0, red));
      //   // balls.push(new Ball(244, 114, 0, 0, red));
      //   // balls.push(new Ball(242, 98, 0, 0, red));
      //   // balls.push(new Ball(237, 86, 0, 0, red));
      //   // balls.push(new Ball(225, 81, 0, 0, red));

      //   // // O
      //   // var oOffset = 67;
      //   // balls.push(new Ball(oOffset + 210, 81, 0, 0, yellow));
      //   // balls.push(new Ball(oOffset + 197, 91, 0, 0, yellow));
      //   // balls.push(new Ball(oOffset + 196, 103, 0, 0, yellow));
      //   // balls.push(new Ball(oOffset + 200, 116, 0, 0, yellow));
      //   // balls.push(new Ball(oOffset + 209, 127, 0, 0, yellow));
      //   // balls.push(new Ball(oOffset + 223, 130, 0, 0, yellow));
      //   // balls.push(new Ball(oOffset + 237, 127, 0, 0, yellow));
      //   // balls.push(new Ball(oOffset + 244, 114, 0, 0, yellow));
      //   // balls.push(new Ball(oOffset + 242, 98, 0, 0, yellow));
      //   // balls.push(new Ball(oOffset + 237, 86, 0, 0, yellow));
      //   // balls.push(new Ball(oOffset + 225, 81, 0, 0, yellow));

      //   // // G
      //   // balls.push(new Ball(370, 80, 0, 0, blue));
      //   // balls.push(new Ball(358, 79, 0, 0, blue));
      //   // balls.push(new Ball(346, 79, 0, 0, blue));
      //   // balls.push(new Ball(335, 84, 0, 0, blue));
      //   // balls.push(new Ball(330, 98, 0, 0, blue));
      //   // balls.push(new Ball(334, 111, 0, 0, blue));
      //   // balls.push(new Ball(348, 116, 0, 0, blue));
      //   // balls.push(new Ball(362, 109, 0, 0, blue));
      //   // balls.push(new Ball(362, 94, 0, 0, blue));
      //   // balls.push(new Ball(355, 128, 0, 0, blue));
      //   // balls.push(new Ball(340, 135, 0, 0, blue));
      //   // balls.push(new Ball(327, 142, 0, 0, blue));
      //   // balls.push(new Ball(325, 155, 0, 0, blue));
      //   // balls.push(new Ball(339, 165, 0, 0, blue));
      //   // balls.push(new Ball(352, 166, 0, 0, blue));
      //   // balls.push(new Ball(367, 161, 0, 0, blue));
      //   // balls.push(new Ball(371, 149, 0, 0, blue));
      //   // balls.push(new Ball(366, 137, 0, 0, blue));

      //   // // L
      //   // balls.push(new Ball(394, 49, 0, 0, green));
      //   // balls.push(new Ball(381, 50, 0, 0, green));
      //   // balls.push(new Ball(391, 61, 0, 0, green));
      //   // balls.push(new Ball(390, 73, 0, 0, green));
      //   // balls.push(new Ball(392, 89, 0, 0, green));
      //   // balls.push(new Ball(390, 105, 0, 0, green));
      //   // balls.push(new Ball(390, 118, 0, 0, green));
      //   // balls.push(new Ball(388, 128, 0, 0, green));
      //   // balls.push(new Ball(400, 128, 0, 0, green));

      //   // // E
      //   // balls.push(new Ball(426, 101, 0, 0, red));
      //   // balls.push(new Ball(436, 98, 0, 0, red));
      //   // balls.push(new Ball(451, 95, 0, 0, red));
      //   // balls.push(new Ball(449, 83, 0, 0, red));
      //   // balls.push(new Ball(443, 78, 0, 0, red));
      //   // balls.push(new Ball(430, 77, 0, 0, red));
      //   // balls.push(new Ball(418, 82, 0, 0, red));
      //   // balls.push(new Ball(414, 93, 0, 0, red));
      //   // balls.push(new Ball(412, 108, 0, 0, red));
      //   // balls.push(new Ball(420, 120, 0, 0, red));
      //   // balls.push(new Ball(430, 127, 0, 0, red));
      //   // balls.push(new Ball(442, 130, 0, 0, red));
      //   // balls.push(new Ball(450, 125, 0, 0, red));

      //   return balls;
      // }
      // function getMousePos(canvas, evt) {
      //   // get canvas position
      //   var obj = canvas;
      //   var top = 0;
      //   var left = 0;
      //   while(obj.tagName != 'BODY') {
      //     top += obj.offsetTop;
      //     left += obj.offsetLeft;
      //     obj = obj.offsetParent;
      //   }

      //   // return relative mouse position
      //   var mouseX = evt.clientX - left + window.pageXOffset;
      //   var mouseY = evt.clientY - top + window.pageYOffset;
      //   return {
      //     x: mouseX,
      //     y: mouseY
      //   };
      // }
      // function updateBalls(canvas, balls, timeDiff, mousePos) {
      //   var context = canvas.getContext('2d');
      //   var collisionDamper = 0.3;
      //   var floorFriction = 0.0005 * timeDiff;
      //   var mouseForceMultiplier = 1 * timeDiff;
      //   var restoreForce = 0.002 * timeDiff;

      //   for(var n = 0; n < balls.length; n++) {
      //     var ball = balls[n];
      //     // set ball position based on velocity
      //     ball.y += ball.vy;
      //     ball.x += ball.vx;

      //     // restore forces
      //     if(ball.x > ball.origX) {
      //       ball.vx -= restoreForce;
      //     }
      //     else {
      //       ball.vx += restoreForce;
      //     }
      //     if(ball.y > ball.origY) {
      //       ball.vy -= restoreForce;
      //     }
      //     else {
      //       ball.vy += restoreForce;
      //     }

      //     // mouse forces
      //     var mouseX = mousePos.x;
      //     var mouseY = mousePos.y;

      //     var distX = ball.x - mouseX;
      //     var distY = ball.y - mouseY;

      //     var radius = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

      //     var totalDist = Math.abs(distX) + Math.abs(distY);

      //     var forceX = (Math.abs(distX) / totalDist) * (1 / radius) * mouseForceMultiplier;
      //     var forceY = (Math.abs(distY) / totalDist) * (1 / radius) * mouseForceMultiplier;

      //     if(distX > 0) {// mouse is left of ball
      //       ball.vx += forceX;
      //     }
      //     else {
      //       ball.vx -= forceX;
      //     }
      //     if(distY > 0) {// mouse is on top of ball
      //       ball.vy += forceY;
      //     }
      //     else {
      //       ball.vy -= forceY;
      //     }

      //     // floor friction
      //     if(ball.vx > 0) {
      //       ball.vx -= floorFriction;
      //     }
      //     else if(ball.vx < 0) {
      //       ball.vx += floorFriction;
      //     }
      //     if(ball.vy > 0) {
      //       ball.vy -= floorFriction;
      //     }
      //     else if(ball.vy < 0) {
      //       ball.vy += floorFriction;
      //     }

      //     // floor condition
      //     if(ball.y > (canvas.height - ball.radius)) {
      //       ball.y = canvas.height - ball.radius - 2;
      //       ball.vy *= -1;
      //       ball.vy *= (1 - collisionDamper);
      //     }

      //     // ceiling condition
      //     if(ball.y < (ball.radius)) {
      //       ball.y = ball.radius + 2;
      //       ball.vy *= -1;
      //       ball.vy *= (1 - collisionDamper);
      //     }

      //     // right wall condition
      //     if(ball.x > (canvas.width - ball.radius)) {
      //       ball.x = canvas.width - ball.radius - 2;
      //       ball.vx *= -1;
      //       ball.vx *= (1 - collisionDamper);
      //     }

      //     // left wall condition
      //     if(ball.x < (ball.radius)) {
      //       ball.x = ball.radius + 2;
      //       ball.vx *= -1;
      //       ball.vx *= (1 - collisionDamper);
      //     }
      //   }
      // }
      // function Ball(x, y, vx, vy, color) {
      //   this.x = x;
      //   this.y = y;
      //   this.vx = vx;
      //   this.vy = vy;
      //   this.color = color;
      //   this.origX = x;
      //   this.origY = y;
      //   this.radius = 10;
      // }
      // function animate(canvas, balls, lastTime, mousePos) {
      //   var context = canvas.getContext('2d');

      //   // update
      //   var date = new Date();
      //   var time = date.getTime();
      //   var timeDiff = time - lastTime;
      //   updateBalls(canvas, balls, timeDiff, mousePos);
      //   lastTime = time;

      //   // clear
      //   context.clearRect(0, 0, canvas.width, canvas.height);

      //   // render
      //   for(var n = 0; n < balls.length; n++) {
      //     var ball = balls[n];
      //     context.beginPath();
      //     context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
      //     context.fillStyle = ball.color;
      //     context.fill();
      //   }

      //   // request new frame
      //   requestAnimFrame(function() {
      //     animate(canvas, balls, lastTime, mousePos);
      //   });
      // }
      // var canvas = document.getElementById('test');
      // var balls = initBalls();
      // var date = new Date();
      // var time = date.getTime();
      // /*
      //  * set mouse position really far away
      //  * so the mouse forces are nearly obsolete
      //  */
      // var mousePos = {
      //   x: 9999,
      //   y: 9999
      // };

      // canvas.addEventListener('mousemove', function(evt) {
      //   var pos = getMousePos(canvas, evt);
      //   mousePos.x = pos.x;
      //   mousePos.y = pos.y;
      // });

      // canvas.addEventListener('mouseout', function(evt) {
      //   mousePos.x = 9999;
      //   mousePos.y = 9999;
      // });
      // animate(canvas, balls, time, mousePos);
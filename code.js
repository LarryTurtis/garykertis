(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _trees = require('./trees.js');

var _engine = require('./engine/engine.js');

var _scenes = require('./scenes/scenes.js');

function load() {
    _scenes.scenes.level0();
}

_engine.engine.go(load);

},{"./engine/engine.js":17,"./scenes/scenes.js":40,"./trees.js":41}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.animate = undefined;

var _shapesregistry = require('./shapesregistry.js');

var shapesRegistry = new _shapesregistry.ShapesRegistry();
var now = void 0;
var then = Date.now();
var delta = void 0;

function animate() {
    console.log('anim!');
    if (!shapesRegistry.static) {
        requestAnimationFrame(function () {
            animate();
        });
    }

    now = Date.now();
    delta = now - then;

    if (delta > shapesRegistry._interval) {
        // update time stuffs

        // Just `then = now` is not enough.
        // Lets say we set fps at 10 which means
        // each frame must take 100ms
        // Now frame executes in 16ms (60fps) so
        // the loop iterates 7 times (16*7 = 112ms) until
        // delta > _interval === true
        // Eventually this lowers down the FPS as
        // 112*10 = 1120ms (NOT 1000ms).
        // So we have to get rid of that extra 12ms
        // by subtracting delta (112) % _interval (100).
        // Hope that makes sense.

        then = now - delta % shapesRegistry._interval;

        // ... Code for Drawing the Frame ...
        if (shapesRegistry.length) {
            (function () {
                if (!shapesRegistry.blur) {
                    shapesRegistry.dynamicBackgroundCanvas.ctx.clearRect(0, 0, shapesRegistry.dynamicBackgroundCanvas.width, shapesRegistry.dynamicBackgroundCanvas.height);
                    shapesRegistry.dynamicForegroundCanvas.ctx.clearRect(0, 0, shapesRegistry.dynamicForegroundCanvas.width, shapesRegistry.dynamicForegroundCanvas.height);
                }

                var counter = 0;

                shapesRegistry.dynamicShapes.forEach(function (shape) {
                    if (!shapesRegistry.static && (shape.boundary.a.x > shape.canvas.width.percent(110) || shape.boundary.b.x < -shape.canvas.width.percent(10))) {
                        //shapesRegistry.remove(shape);
                        return;
                    }

                    if (!shapesRegistry.static && (shape.boundary.a.y > shape.canvas.currentY + window.innerHeight.percent(110) || shape.boundary.d.y < shape.canvas.currentY - shape.canvas.height.percent(10))) {
                        //shapesRegistry.remove(shape);
                        return;
                    }
                    counter++;

                    if (shape.animate) {
                        shape.animate();
                    }
                    if (shape.callback) {
                        shape.callback();
                    }

                    if (shape.visible) shape.draw();
                });

                //console.log("Drew " + counter + " shapesRegistry.");
            })();
        }
    }
}

exports.animate = animate;

},{"./shapesregistry.js":25}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Canvas = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _point = require('./point.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

CanvasRenderingContext2D.prototype.curve = function (points) {
    if (points) {
        this.bezierCurveTo(points.cp1.x, points.cp1.y, points.cp2.x, points.cp2.y, points.end.x, points.end.y);
    }
};

CanvasRenderingContext2D.prototype.yLine = function (a) {
    this.lineTo(a.x, a.y);
};

CanvasRenderingContext2D.prototype.yRect = function (rect) {
    this.yMove(rect.a);
    this.yLine(rect.b);
    this.yLine(rect.c);
    this.yLine(rect.d);
    this.yLine(rect.a);
};
CanvasRenderingContext2D.prototype.yMove = function (point) {
    this.moveTo(point.x, point.y);
};
CanvasRenderingContext2D.prototype.yArc = function (arc) {
    this.arc(arc.x, arc.y, arc.r, arc.sAngle, arc.eAngle);
};

var Canvas = function () {
    function Canvas(parentNodeName) {
        _classCallCheck(this, Canvas);

        this.element = document.createElement('canvas');
        this.ctx = this.element.getContext("2d");
        this._center = new _point.Point(this.element.width / 2, this.element.height / 2);
        this._width = this.element.width;
        this._height = this.element.height;

        this._currentY = 0;

        this.parentNode = document.getElementById(parentNodeName) || document.body;

        var dpr = window.devicePixelRatio || 1;
        var bsr = this.ctx.webkitBackingStorePixelRatio || this.ctx.mozBackingStorePixelRatio || this.ctx.msBackingStorePixelRatio || this.ctx.oBackingStorePixelRatio || this.ctx.backingStorePixelRatio || 1;

        this.pixelRatio = dpr / bsr;

        //Create canvas with the device resolution.
        this.createCanvas(500, 250);

        //Create canvas with a custom resolution.
        //var myCustomCanvas = createHiDPICanvas(500, 200, 4);
    }

    _createClass(Canvas, [{
        key: 'measureText',
        value: function measureText(text, font) {
            this.ctx.font = font;
            return this.ctx.measureText(text).width;
        }
    }, {
        key: 'createCanvas',
        value: function createCanvas(w, h, ratio) {
            try {
                this.parentNode.removeChild(this.element);
            } catch (e) {}

            if (!ratio) {
                ratio = this.pixelRatio;
            }
            var can = document.createElement('canvas');
            can.width = w * ratio;
            can.height = h * ratio;
            can.style.width = w + "px";
            can.style.height = h + "px";

            this.ctx = can.getContext("2d");
            this.element = can;
            this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            this.parentNode.appendChild(this.element);
        }
    }, {
        key: 'addEventListener',
        value: function addEventListener(event, func) {
            this.element.addEventListener(event, func, false);
        }
    }, {
        key: 'dispatchEvent',
        value: function dispatchEvent(event) {
            this.element.dispatchEvent(event);
        }
    }, {
        key: 'getBoundingClientRect',
        value: function getBoundingClientRect() {
            return this.element.getBoundingClientRect();
        }
    }, {
        key: 'scroll',
        value: function scroll(amount) {
            if (this.currentY + amount > 0 && this.currentY + amount < this.height) {
                this.currentY += amount;
                this.element.style.marginTop = -this.currentY + "px";
            }
        }
    }, {
        key: 'width',
        set: function set(width) {
            this._width = width;
            this._center = new _point.Point(width / 2, this._center.y);
            this.createCanvas(width, this.height);
        },
        get: function get() {
            return this._width;
        }
    }, {
        key: 'height',
        set: function set(height) {
            this._height = height;
            this._center = new _point.Point(this._center.x, height / 2);
            this.createCanvas(this.width, height);
        },
        get: function get() {
            return this._height;
        }
    }, {
        key: 'center',
        get: function get() {
            return this._center;
        }
    }, {
        key: 'currentY',
        get: function get() {
            return this._currentY;
        },
        set: function set(currentY) {
            this._currentY = currentY;
        }
    }]);

    return Canvas;
}();

;

exports.Canvas = Canvas;

},{"./point.js":24}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.client = undefined;

var _cloud = require('./cloud.js');

var _hotAirBalloon = require('./hotAirBalloon.js');

var _stripedBalloon = require('./stripedBalloon.js');

var client = {
    Cloud: _cloud.Cloud,
    HotAirBalloon: _hotAirBalloon.HotAirBalloon,
    StripedBalloon: _stripedBalloon.StripedBalloon
};

exports.client = client;

},{"./cloud.js":5,"./hotAirBalloon.js":6,"./stripedBalloon.js":7}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Cloud = undefined;

var _simples = require('../simples/simples.js');

var _complex = require('../complex/complex.js');

var _complexShape = require('../complex/complexShape.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Cloud = function (_ComplexShape) {
    _inherits(Cloud, _ComplexShape);

    function Cloud(x, y, width, height, angle) {
        _classCallCheck(this, Cloud);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Cloud).call(this, x, y, width, height, angle));

        _this.type = "Cloud";

        var maxSize = _this.width / 2;
        var previousCircle = void 0;
        var circleX = void 0;
        var moreCircles = true;

        while (moreCircles) {

            //the x of the circle should overlap the right edge of the previous circle by 25%
            circleX = previousCircle ? previousCircle.b.x - previousCircle.width / 4 : _this.x;

            //the max size of any circle should be 50% of the width. Min size is 25%
            var size = trees.random(maxSize / 4, maxSize);

            //create the circle.
            var circle = new _complex.complex.SemiCircle(circleX, _this.d.y - size / 2, size, size / 2);
            _this.addShape(circle);
            previousCircle = circle;

            //if the circle's right edge exceeds the width of the cloud, move it over.
            //otherwise add another circle.
            if (circle.b.x > _this.b.x) {
                circle.x = _this.b.x - circle.width;
                moreCircles = false;
            }
        }
        return _this;
    }

    return Cloud;
}(_complexShape.ComplexShape);

exports.Cloud = Cloud;

},{"../complex/complex.js":12,"../complex/complexShape.js":13,"../simples/simples.js":30}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HotAirBalloon = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _simples = require('../simples/simples.js');

var _complex = require('../complex/complex.js');

var _complexShape = require('../complex/complexShape.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HotAirBalloon = function (_ComplexShape) {
    _inherits(HotAirBalloon, _ComplexShape);

    function HotAirBalloon(x, y, width, height) {
        _classCallCheck(this, HotAirBalloon);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(HotAirBalloon).call(this, x, y, width, height));

        _this.type = "HotAirBalloon";

        _this.balloon = new _complex.complex.Balloon(x, y, width, height);
        _this.basket = new _simples.simples.Rectangle(trees.getCenterX(width.percent(15), _this.balloon), y + height.percent(140), width.percent(15), height.percent(15));
        _this.leftString = new _simples.simples.Rectangle(trees.getCenterX(width.percent(15), _this.balloon) + width.percent(1), y + height.percent(125), width.percent(1), height.percent(15));
        _this.rightString = new _simples.simples.Rectangle(trees.getCenterX(width.percent(15), _this.balloon) + width.percent(13), y + height.percent(125), width.percent(1), height.percent(15));

        _this.addShape(_this.balloon);
        _this.addShape(_this.leftString);
        _this.addShape(_this.basket);
        _this.addShape(_this.rightString);

        return _this;
    }

    _createClass(HotAirBalloon, [{
        key: 'color',
        get: function get() {
            return _get(Object.getPrototypeOf(HotAirBalloon.prototype), 'color', this);
        },
        set: function set(color) {
            _set(Object.getPrototypeOf(HotAirBalloon.prototype), 'color', color, this);
            this.leftString.color = "black";
            this.rightString.color = "black";
            this.basket.color = "white";
        }
    }]);

    return HotAirBalloon;
}(_complexShape.ComplexShape);

exports.HotAirBalloon = HotAirBalloon;

},{"../complex/complex.js":12,"../complex/complexShape.js":13,"../simples/simples.js":30}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StripedBalloon = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _simples = require('../simples/simples.js');

var _patterns = require('../patterns/patterns.js');

var _hotAirBalloon = require('./hotAirBalloon.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StripedBalloon = function (_HotAirBalloon) {
    _inherits(StripedBalloon, _HotAirBalloon);

    function StripedBalloon(x, y, width, height) {
        _classCallCheck(this, StripedBalloon);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StripedBalloon).call(this, x, y, width, height));

        _this.type = "Balloon";
        return _this;
    }

    _createClass(StripedBalloon, [{
        key: 'addStripes',
        value: function addStripes() {
            var _this2 = this;

            if (this.stripeWidth && this.stripeSpacing && this.stripeColor && this.stripeOrientation) {
                this.stripes = _patterns.patterns.stripes(this.balloon, this.stripeWidth, this.stripeSpacing, this.stripeColor, this.stripeOrientation);

                this.stripes.forEach(function (stripe) {
                    _this2.addShape(stripe);
                });
            }
        }
    }, {
        key: 'stripeColor',
        get: function get() {
            return this._stripeColor;
        },
        set: function set(stripeColor) {
            this._stripeColor = stripeColor;
            this.addStripes();
        }
    }, {
        key: 'stripeWidth',
        get: function get() {
            return this._stripeWidth;
        },
        set: function set(stripeWidth) {
            this._stripeWidth = stripeWidth;
            this.addStripes();
        }
    }, {
        key: 'stripeSpacing',
        get: function get() {
            return this._stripeSpacing;
        },
        set: function set(stripeSpacing) {
            this._stripeSpacing = stripeSpacing;
            this.addStripes();
        }
    }, {
        key: 'stripeOrientation',
        get: function get() {
            return this._stripeOrientation;
        },
        set: function set(stripeOrientation) {
            this._stripeOrientation = stripeOrientation;
            this.addStripes();
        }
    }]);

    return StripedBalloon;
}(_hotAirBalloon.HotAirBalloon);

exports.StripedBalloon = StripedBalloon;

},{"../patterns/patterns.js":19,"../simples/simples.js":30,"./hotAirBalloon.js":6}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Balloon = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _simples = require('../simples/simples.js');

var _complexShape = require('./complexShape.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Balloon = function (_ComplexShape) {
    _inherits(Balloon, _ComplexShape);

    function Balloon(x, y, width, height) {
        _classCallCheck(this, Balloon);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Balloon).call(this, x, y, width, height));

        _this.type = "Balloon";

        _this.circle = new _simples.simples.Circle(x, y, width, height);
        _this.circle.startAngle = 0.835;
        _this.circle.endAngle = 0.165;
        _this.trapezoid = new _simples.simples.Trapezoid(trees.getCenterX(width.percent(86), _this.circle), y + height.percent(75), width.percent(86), height.percent(50), 55);
        _this.height = _this.circle.height + _this.trapezoid.height;
        _this.circle.pathOnly = true;
        _this.trapezoid.pathOnly = true;

        _this.addShape(_this.circle);
        _this.addShape(_this.trapezoid);
        return _this;
    }

    _createClass(Balloon, [{
        key: 'draw',
        value: function draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.circle.center.x, this.circle.center.y, this.circle.radius, this.circle.startAngle, this.circle.endAngle);
            ctx.yLine(this.trapezoid.bottomRight);
            ctx.yLine(this.trapezoid.bottomLeft);
            ctx.yLine(this.trapezoid.topLeft);
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.lineColor;
            if (!this.pathOnly) ctx.fill();
            if (!this.pathOnly && this.lineColor) ctx.stroke();
            ctx.closePath();
        }
    }]);

    return Balloon;
}(_complexShape.ComplexShape);

exports.Balloon = Balloon;

},{"../simples/simples.js":30,"./complexShape.js":13}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Circle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _simples = require('../../simples/simples.js');

var _circularShape = require('./circularShape.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Circle = function (_CircularShape) {
    _inherits(Circle, _CircularShape);

    function Circle(x, y, width, height) {
        _classCallCheck(this, Circle);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Circle).call(this, x, y, width, height));

        _this.type = "Circle";

        _this.topRight = new _simples.simples.Wedge(x + width / 2, y, width / 2, height / 2);
        _this.topLeft = new _simples.simples.Wedge(x, y, width / 2, height / 2, 270);
        _this.topLeft.rotate(270, _this.topLeft.center);
        _this.bottomRight = new _simples.simples.Wedge(x + width / 2, y + height / 2, width / 2, height / 2, 90);
        _this.bottomRight.rotate(90, _this.bottomRight.center);
        _this.bottomLeft = new _simples.simples.Wedge(x, y + height / 2, width / 2, height / 2, 180);
        _this.bottomLeft.rotate(180, _this.bottomLeft.center);

        _this.addShape(_this.topRight);
        _this.addShape(_this.topLeft);
        _this.addShape(_this.bottomRight);
        _this.addShape(_this.bottomLeft);

        return _this;
    }

    _createClass(Circle, [{
        key: 'rotate',
        value: function rotate() {}
    }, {
        key: 'draw',
        value: function draw(ctx) {
            _get(Object.getPrototypeOf(Circle.prototype), 'draw', this).call(this, ctx);

            ctx.beginPath();

            this.shape.forEach(function (shape) {
                shape.draw(ctx);
            });

            ctx.closePath();
        }
    }]);

    return Circle;
}(_circularShape.CircularShape);

exports.Circle = Circle;

},{"../../simples/simples.js":30,"./circularShape.js":10}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CircularShape = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _simples = require('../../simples/simples.js');

var _complexShape = require('../complexShape.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CircularShape = function (_ComplexShape) {
    _inherits(CircularShape, _ComplexShape);

    function CircularShape(x, y, width, height, thickness) {
        _classCallCheck(this, CircularShape);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CircularShape).call(this, x, y, width, height));

        _this.type = "CircularShape";
        _this._radius = _this.width / 2;
        return _this;
    }

    _createClass(CircularShape, [{
        key: 'createSATObject',
        value: function createSATObject() {
            return [new SAT.Circle(new SAT.Vector(this.center.x, this.center.y), this.radius)];
        }
    }, {
        key: 'radius',
        get: function get() {
            return this._radius;
        },
        set: function set(radius) {
            this._radius = radius;
        }
    }, {
        key: 'width',
        get: function get() {
            return _get(Object.getPrototypeOf(CircularShape.prototype), 'width', this);
        },
        set: function set(width) {
            _set(Object.getPrototypeOf(CircularShape.prototype), 'width', width, this);
            this.radius = width / 2;
        }
    }, {
        key: 'height',
        get: function get() {
            return _get(Object.getPrototypeOf(CircularShape.prototype), 'height', this);
        },
        set: function set(height) {
            _set(Object.getPrototypeOf(CircularShape.prototype), 'height', height, this);
            //this.radius = height/2;
        }
    }]);

    return CircularShape;
}(_complexShape.ComplexShape);

exports.CircularShape = CircularShape;

},{"../../simples/simples.js":30,"../complexShape.js":13}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SemiCircle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _simples = require('../../simples/simples.js');

var _circularShape = require('./circularShape.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SemiCircle = function (_CircularShape) {
    _inherits(SemiCircle, _CircularShape);

    function SemiCircle(x, y, width, height, angle) {
        _classCallCheck(this, SemiCircle);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SemiCircle).call(this, x, y, width, height, angle));

        _this.type = "SemiCircle";

        _this.right = new _simples.simples.Wedge(x + width / 2, y, width / 2, height);
        _this.left = new _simples.simples.Wedge(x, y, width / 2, height, 270);
        _this.left.rotate(270, _this.left.center);
        _this.addShape(_this.left);
        _this.addShape(_this.right);
        return _this;
    }

    _createClass(SemiCircle, [{
        key: 'draw',
        value: function draw(ctx) {
            _get(Object.getPrototypeOf(SemiCircle.prototype), 'draw', this).call(this, ctx);

            ctx.beginPath();
            ctx.yMove(this.d);
            ctx.curve(this.left.curve);
            ctx.curve(this.right.curve);
            ctx.yLine(this.d);
            ctx.fill();
            if (this.lineColor) ctx.stroke();
            ctx.closePath();
        }
    }]);

    return SemiCircle;
}(_circularShape.CircularShape);

exports.SemiCircle = SemiCircle;

},{"../../simples/simples.js":30,"./circularShape.js":10}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.complex = undefined;

var _semiCircle = require('./circularShapes/semiCircle.js');

var _circle = require('./circularShapes/circle.js');

var _balloon = require('./balloon.js');

var complex = {
    SemiCircle: _semiCircle.SemiCircle,
    Circle: _circle.Circle,
    Balloon: _balloon.Balloon
};

exports.complex = complex;

},{"./balloon.js":8,"./circularShapes/circle.js":9,"./circularShapes/semiCircle.js":11}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ComplexShape = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _sprite = require("../sprite.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ComplexShape = function (_Sprite) {
    _inherits(ComplexShape, _Sprite);

    function ComplexShape(x, y, width, height) {
        _classCallCheck(this, ComplexShape);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ComplexShape).call(this, x, y, width, height));

        _this.type = "ComplexShape";
        _this._shape = [];
        return _this;
    }

    _createClass(ComplexShape, [{
        key: "addShape",
        value: function addShape(shape) {
            if (this.shape.indexOf(shape) >= 0) {
                throw new Error("Attempted to add same shape twice.");
            }
            shape.relativeX = (shape.x - this.x) / this.width;
            shape.relativeY = (shape.y - this.y) / this.height;
            shape.relativeWidth = shape.width / this.width;
            shape.relativeHeight = shape.height / this.height;
            this.shape.push(shape);
        }
    }, {
        key: "moveDrawOrderBack",
        value: function moveDrawOrderBack(shape) {
            var shapeToMove = this.removeShape(shape);
            this.shape.unshift(shape);
        }
    }, {
        key: "removeShape",
        value: function removeShape(shape) {
            var index = this.shape.indexOf(shape);
            if (index >= 0) {
                this.shape.splice(index, 1);
            }
        }
    }, {
        key: "animate",
        value: function animate() {
            this.shape && this.shape.forEach(function (shape) {
                if (shape.animate) shape.animate();
            });
        }
    }, {
        key: "rotate",
        value: function rotate(deg, transformOrigin) {
            _get(Object.getPrototypeOf(ComplexShape.prototype), "rotate", this).call(this, deg, transformOrigin);
            this.shape && this.shape.forEach(function (shape) {
                shape.rotate(deg, transformOrigin);
            });
        }
    }, {
        key: "createSATObject",


        //merge all SAT objects into a single array.
        value: function createSATObject() {
            var response = [];
            this.shape.forEach(function (shape) {
                response = response.concat(shape.createSATObject());
            });
            return response;
        }
    }, {
        key: "wasClicked",
        value: function wasClicked(mouseX, mouseY) {
            var clicked = null;
            this.shape.forEach(function (shape) {
                clicked = clicked || shape.wasClicked(mouseX, mouseY);
            });
            return clicked;
        }
    }, {
        key: "draw",
        value: function draw(ctx) {
            ctx = ctx || this.canvas && this.canvas.ctx;

            _get(Object.getPrototypeOf(ComplexShape.prototype), "draw", this).call(this, ctx);

            ctx.beginPath();

            this.shape.forEach(function (shape) {
                if (shape.visible) shape.draw(ctx);
            });

            ctx.closePath();
        }
    }, {
        key: "shape",
        get: function get() {
            return this._shape;
        },
        set: function set(shape) {
            this._shape = shape;
        }
    }, {
        key: "lastShape",
        get: function get() {
            return this._shape[this._shape.length - 1];
        }
    }, {
        key: "firstShape",
        get: function get() {
            return this._shape[0];
        }
    }, {
        key: "pathOnly",
        get: function get() {
            return _get(Object.getPrototypeOf(ComplexShape.prototype), "pathOnly", this);
        },
        set: function set(pathOnly) {
            _set(Object.getPrototypeOf(ComplexShape.prototype), "pathOnly", pathOnly, this);
            this.shape.forEach(function (shape) {
                shape.pathOnly = pathOnly;
            });
        }
    }, {
        key: "color",
        get: function get() {
            return _get(Object.getPrototypeOf(ComplexShape.prototype), "color", this);
        },
        set: function set(color) {
            _set(Object.getPrototypeOf(ComplexShape.prototype), "color", color, this);
            this.shape.forEach(function (shape) {
                shape.color = color;
            });
        }
    }, {
        key: "lineColor",
        get: function get() {
            return _get(Object.getPrototypeOf(ComplexShape.prototype), "lineColor", this);
        },
        set: function set(lineColor) {
            _set(Object.getPrototypeOf(ComplexShape.prototype), "lineColor", lineColor, this);
            this.shape.forEach(function (shape) {
                shape.lineColor = lineColor;
            });
        }
    }, {
        key: "collidable",
        get: function get() {
            return _get(Object.getPrototypeOf(ComplexShape.prototype), "collidable", this);
        },
        set: function set(collidable) {
            if (typeof collidable !== "boolean") {
                throw new Error("Property collidable expects boolean value");
            }
            _set(Object.getPrototypeOf(ComplexShape.prototype), "collidable", collidable, this);
            this.shape.forEach(function (shape) {
                shape.collidable = collidable;
            });
        }
    }, {
        key: "x",
        get: function get() {
            return _get(Object.getPrototypeOf(ComplexShape.prototype), "x", this);
        },
        set: function set(x) {
            var oldX = this.x;
            var diffX = x - oldX;
            _set(Object.getPrototypeOf(ComplexShape.prototype), "x", x, this);
            this.shape.forEach(function (shape) {
                shape.x += diffX;
            });
        }
    }, {
        key: "y",
        get: function get() {
            return _get(Object.getPrototypeOf(ComplexShape.prototype), "y", this);
        },
        set: function set(y) {
            var oldY = this.y;
            var diffY = y - oldY;
            _set(Object.getPrototypeOf(ComplexShape.prototype), "y", y, this);
            this.shape.forEach(function (shape) {
                shape.y += diffY;
            });
        }
    }, {
        key: "width",
        get: function get() {
            return _get(Object.getPrototypeOf(ComplexShape.prototype), "width", this);
        },
        set: function set(width) {
            var oldwidth = this.width;
            var diffwidth = width - oldwidth;
            _set(Object.getPrototypeOf(ComplexShape.prototype), "width", width, this);
            this.shape.forEach(function (shape) {
                shape.width = width * shape.relativeWidth;
                shape.x = shape.x + diffwidth * shape.relativeX;
            });
        }
    }, {
        key: "height",
        get: function get() {
            return _get(Object.getPrototypeOf(ComplexShape.prototype), "height", this);
        },
        set: function set(height) {
            var oldheight = this.height;
            var diffheight = height - oldheight;
            _set(Object.getPrototypeOf(ComplexShape.prototype), "height", height, this);
            this.shape.forEach(function (shape) {
                shape.height = height * shape.relativeHeight;
                shape.y = shape.y + diffheight * shape.relativeY;
            });
        }
    }]);

    return ComplexShape;
}(_sprite.Sprite);

exports.ComplexShape = ComplexShape;

},{"../sprite.js":35}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Curve = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _point = require('./point.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Curve = function () {
    function Curve(cp1, cp2, end) {
        _classCallCheck(this, Curve);

        this._cp1 = cp1;
        this._cp2 = cp2;
        this._end = end;
        this._points = [this._cp1, this._cp2, this._end];
    }

    _createClass(Curve, [{
        key: 'points',
        get: function get() {
            return this._points;
        },
        set: function set(points) {
            this._points = points;
        }
    }, {
        key: 'cp1',
        get: function get() {
            return this._cp1;
        },
        set: function set(cp1) {
            this._cp1 = cp1;
        }
    }, {
        key: 'cp2',
        get: function get() {
            return this._cp2;
        },
        set: function set(cp2) {
            this._cp2 = cp2;
        }
    }, {
        key: 'end',
        get: function get() {
            return this._end;
        },
        set: function set(end) {
            this._end = end;
        }
    }]);

    return Curve;
}();

exports.Curve = Curve;

},{"./point.js":24}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DrawInstruction = function () {
    function DrawInstruction(line, rule) {
        _classCallCheck(this, DrawInstruction);

        this._line = line;
        this._rule = rule;
    }

    _createClass(DrawInstruction, [{
        key: "line",
        get: function get() {
            return this._line;
        },
        set: function set(line) {
            this._line = line;
        }
    }, {
        key: "rule",
        get: function get() {
            return this._rule;
        },
        set: function set(rule) {
            this._rule = rule;
        }
    }]);

    return DrawInstruction;
}();

exports.DrawInstruction = DrawInstruction;

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.drawStaticShapes = undefined;

var _shapesregistry = require('./shapesregistry.js');

var shapesRegistry = new _shapesregistry.ShapesRegistry();

function drawStaticShapes() {

    requestAnimationFrame(function () {
        if (shapesRegistry.length) {
            if (!shapesRegistry.blur) {
                shapesRegistry.staticBackgroundCanvas.ctx.clearRect(0, 0, shapesRegistry.staticBackgroundCanvas.width, shapesRegistry.staticBackgroundCanvas.height);
                shapesRegistry.staticForegroundCanvas.ctx.clearRect(0, 0, shapesRegistry.staticForegroundCanvas.width, shapesRegistry.staticForegroundCanvas.height);
            }

            shapesRegistry.staticShapes.forEach(function (shape) {
                if (shape.visible) shape.draw();
            });
        }
    });
}

exports.drawStaticShapes = drawStaticShapes;

},{"./shapesregistry.js":25}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.engine = undefined;

var _shapesregistry = require('./shapesregistry.js');

var _animate = require('./animate.js');

var _drawStaticShapes = require('./drawStaticShapes.js');

var _simples = require('./simples/simples.js');

var _complex = require('./complex/complex.js');

var _client = require('./client/client.js');

var _patterns = require('./patterns/patterns.js');

var _mouseEvents = require('./userInput/mouseEvents.js');

var _keyboardEvents = require('./userInput/keyboardEvents.js');

var _scrollEvents = require('./userInput/scrollEvents.js');

var shapesRegistry = new _shapesregistry.ShapesRegistry();
var level = 0;

var engine = {
    patterns: _patterns.patterns,
    shapesRegistry: shapesRegistry,
    drawStaticShapes: _drawStaticShapes.drawStaticShapes,
    simples: _simples.simples,
    complex: _complex.complex,
    client: _client.client,
    go: go,
    levels: []
};

exports.engine = engine;

//set canvas height, maps keys, calls game setup function, and begins animation.

function go(callback) {
    shapesRegistry.maxShapes = 10000;

    shapesRegistry.allCanvases.forEach(function (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    window.addEventListener('load', function () {
        // keyboardEvents.initialize();
        _scrollEvents.scrollEvents.initialize();
        callback();
        (0, _drawStaticShapes.drawStaticShapes)();
        (0, _animate.animate)();
    }, false);
}

},{"./animate.js":2,"./client/client.js":4,"./complex/complex.js":12,"./drawStaticShapes.js":16,"./patterns/patterns.js":19,"./shapesregistry.js":25,"./simples/simples.js":30,"./userInput/keyboardEvents.js":36,"./userInput/mouseEvents.js":37,"./userInput/scrollEvents.js":38}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Line = function () {
    function Line(start, end) {
        _classCallCheck(this, Line);

        this._start = start;
        this._end = end;
    }

    _createClass(Line, [{
        key: "createSATObject",
        value: function createSATObject() {
            return [new SAT.Polygon(new SAT.Vector(0, 0), [new SAT.Vector(this.end.x, this.end.y), new SAT.Vector(this.start.x, this.start.y)])];
        }
    }, {
        key: "start",
        get: function get() {
            return this._start;
        },
        set: function set(start) {
            this._start = start;
        }
    }, {
        key: "end",
        get: function get() {
            return this._end;
        },
        set: function set(end) {
            this._end = end;
        }
    }]);

    return Line;
}();

exports.Line = Line;

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.patterns = undefined;

var _randomSpotsOnCircle = require('./randomSpotsOnCircle.js');

var _polkaDots = require('./polkaDots.js');

var _polkaTrapezoids = require('./polkaTrapezoids.js');

var _stripes = require('./stripes.js');

var patterns = {
    randomSpotsOnCircle: _randomSpotsOnCircle.randomSpotsOnCircle,
    polkaDots: _polkaDots.polkaDots,
    polkaTrapezoids: _polkaTrapezoids.polkaTrapezoids,
    stripes: _stripes.stripes
};

exports.patterns = patterns;

},{"./polkaDots.js":20,"./polkaTrapezoids.js":21,"./randomSpotsOnCircle.js":22,"./stripes.js":23}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * A function to add random spots to an object
 * @param  {Sprite} container
 * @param  {Sprite} shape  
 * @param  {Number} density
 * @param  {Number} minSize
 * @param  {Number} maxSize
 * @param  {String} color  
 */
function polkaDots(container, shape, density, minSize, maxSize, color) {

    for (var i = 0; i < density; i++) {
        var randomPoint1 = trees.getPointOnLine(container.a, trees.random(0, container.width), trees.getAngle(container.a, container.b));
        var randomPoint2 = trees.getPointOnLine(randomPoint1, trees.random(0, container.height), trees.getAngle(container.a, container.d));
        var x = randomPoint2.x;
        var y = randomPoint2.y;
        var size = trees.random(minSize, maxSize);
        var dot = new shape(x, y, size, size);
        dot.color = color;
        container.addShape(dot);
    }
}

exports.polkaDots = polkaDots;

},{}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.polkaTrapezoids = undefined;

var _trapezoid = require('../simples/trapezoid.js');

/**
 * A function to add random spots to an object
 * @param  {Sprite} container
 * @param  {Sprite} shape  
 * @param  {Number} density
 * @param  {Number} minSize
 * @param  {Number} maxSize
 * @param  {String} color  
 */
function polkaTrapezoids(container, density, minSize, maxSize, color) {

    for (var i = 0; i < density; i++) {
        var randomPoint1 = trees.getPointOnLine(container.a, trees.random(0, container.width), trees.getAngle(container.a, container.b));
        var randomPoint2 = trees.getPointOnLine(randomPoint1, trees.random(0, container.height), trees.getAngle(container.a, container.d));
        var x = randomPoint2.x;
        var y = randomPoint2.y;
        var size = trees.random(minSize, maxSize);
        var dot = new _trapezoid.Trapezoid(x, y, size, size, trees.random(85, 105), trees.random(85, 105));
        dot.color = color;
        container.addShape(dot);
    }
}

exports.polkaTrapezoids = polkaTrapezoids;

},{"../simples/trapezoid.js":32}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.randomSpotsOnCircle = undefined;

var _simples = require('../simples/simples.js');

function randomSpotsOnCircle(container) {

    var spots = [];

    var _loop = function _loop(i) {
        var location = randomCirclePoint(container.center, container.radius);
        var radius = randomRadius(location, container);
        var spot = new _simples.simples.Circle(location.x, location.y, radius, radius);

        var safe = true;
        spots.forEach(function (s) {

            var spotLeft = spot.center.x - spot.radius;
            var spotRight = spot.center.x + spot.radius;
            var spotTop = spot.center.y - spot.radius;
            var spotBottom = spot.center.y + spot.radius;

            var sLeft = s.center.x - s.radius;
            var sRight = s.center.x + s.radius;
            var sTop = s.center.y - s.radius;
            var sBottom = s.center.y + s.radius;

            if (spotLeft < sRight && spotRight > sLeft && spotTop < sBottom && spotBottom > sTop) {
                safe = false;
            }
        });

        if (safe) {
            spots.push(spot);
        }
    };

    for (var i = 0; i < 20; i++) {
        _loop(i);
    }

    return spots;
}

function randomRadius(location, container) {
    var angle = trees.getAngle(container.center, location);
    var edge = trees.getPointOnLine(container.center, container.radius, angle);
    var max = trees.getDistance(location, edge) / 2;
    var min = container.radius / 6 > max ? max : container.radius / 6;
    return Math.floor(Math.random() * (max - min)) + min;
}

function randomCirclePoint(center, radius) {
    var a = 2 * Math.PI * Math.random();
    var r = Math.sqrt(Math.random());
    var x = radius * r * Math.cos(a) + center.x;
    var y = radius * r * Math.sin(a) + center.y;
    return { x: x, y: y };
}

exports.randomSpotsOnCircle = randomSpotsOnCircle;

},{"../simples/simples.js":30}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.stripes = undefined;

var _simples = require('../simples/simples.js');

var _complex = require('../complex/complex.js');

function stripes(container, stripeSize, stripeSpacing, color, orientation) {
    var stripes = [];
    if (!orientation || orientation === "vertical") {

        var numStripes = container.width / (stripeSize + stripeSpacing);
        var currentStripe = container.x;

        var _loop = function _loop(i) {
            var stripe = new _simples.simples.Rectangle(currentStripe, container.y, stripeSize, container.height);
            stripe.color = color[i % color.length];
            stripe.draw = function (ctx) {
                ctx = ctx || this.canvas && this.canvas.ctx;

                ctx.save();
                ctx.beginPath();
                container.pathOnly = true;
                container.draw(ctx);
                container.pathOnly = false;
                ctx.clip();
                ctx.closePath();
                ctx.beginPath();
                var rect = {
                    a: this.a,
                    b: this.b,
                    c: this.c,
                    d: this.d
                };
                ctx.yMove(this.a);
                ctx.yRect(rect);
                ctx.fillStyle = color[i % color.length];
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            };

            stripes.push(stripe);
            currentStripe += stripeSize + stripeSpacing;
        };

        for (var i = 0; i < numStripes; i++) {
            _loop(i);
        }
    } else if (orientation === "horizontal") {

        var _numStripes = container.height / (stripeSize + stripeSpacing);
        var _currentStripe = container.y;

        var _loop2 = function _loop2(_i) {
            var stripe = new _simples.simples.Rectangle(container.x, _currentStripe, container.width, stripeSize);
            stripe.color = color[_i % color.length];
            stripe.draw = function (ctx) {
                ctx = ctx || this.canvas && this.canvas.ctx;

                ctx.save();
                ctx.beginPath();
                container.pathOnly = true;
                container.draw(ctx);
                container.pathOnly = false;
                ctx.clip();
                ctx.closePath();
                ctx.beginPath();
                var rect = {
                    a: this.a,
                    b: this.b,
                    c: this.c,
                    d: this.d
                };
                ctx.yMove(this.a);
                ctx.yRect(rect);
                ctx.fillStyle = color[_i % color.length];
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            };

            stripes.push(stripe);
            _currentStripe += stripeSize + stripeSpacing;
        };

        for (var _i = 0; _i < _numStripes; _i++) {
            _loop2(_i);
        }
    } else if (orientation === "diagonal") {
        var _numStripes2 = container.height / (stripeSize + stripeSpacing) * 2;
        var _currentStripe2 = container.y;

        var _loop3 = function _loop3(_i2) {
            var stripe = new _simples.simples.Rectangle(container.x - container.width / 2, _currentStripe2 - container.width / 2, container.width * 2, stripeSize);
            stripe.rotate(-45, stripe.center);
            stripe.color = color[_i2 % color.length];
            stripe.draw = function (ctx) {
                ctx = ctx || this.canvas && this.canvas.ctx;

                ctx.save();
                ctx.beginPath();
                container.pathOnly = true;
                container.draw(ctx);
                container.pathOnly = false;
                ctx.clip();
                ctx.closePath();
                ctx.beginPath();
                var rect = {
                    a: this.a,
                    b: this.b,
                    c: this.c,
                    d: this.d
                };
                ctx.yMove(this.a);
                ctx.yRect(rect);
                ctx.fillStyle = color[_i2 % color.length];
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            };

            stripes.push(stripe);
            _currentStripe2 += stripeSize + stripeSpacing;
        };

        for (var _i2 = 0; _i2 < _numStripes2; _i2++) {
            _loop3(_i2);
        }
    }

    return stripes;
}

exports.stripes = stripes;

},{"../complex/complex.js":12,"../simples/simples.js":30}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Point = function () {
    function Point(x, y) {
        _classCallCheck(this, Point);

        this._x = x;
        this._y = y;
    }

    _createClass(Point, [{
        key: "x",
        get: function get() {
            return this._x;
        },
        set: function set(x) {
            this._x = x;
        }
    }, {
        key: "y",
        get: function get() {
            return this._y;
        },
        set: function set(y) {
            this._y = y;
        }
    }]);

    return Point;
}();

exports.Point = Point;

},{}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ShapesRegistry = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _canvas = require("./canvas.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instance = null;

var ShapesRegistry = function () {
    function ShapesRegistry() {
        _classCallCheck(this, ShapesRegistry);

        if (!instance) {
            instance = this;
            this._shapes = {};
            this._dynamicShapes = [];
            this._staticShapes = [];
            this._shapeId = 0;
            this._maxShapes = 1000000;
            this._fps = 60;
            this._interval = 1000 / this._fps;
            this.blur = false;
            this._staticBackgroundCanvas = new _canvas.Canvas("staticBackgroundCanvas");
            this._staticForegroundCanvas = new _canvas.Canvas("staticForegroundCanvas");
            this._dynamicBackgroundCanvas = new _canvas.Canvas("dynamicBackgroundCanvas");
            this._dynamicForegroundCanvas = new _canvas.Canvas("dynamicForegroundCanvas");
            this.static = true;
        }
        return instance;
    }

    _createClass(ShapesRegistry, [{
        key: "addToStaticBackground",
        value: function addToStaticBackground(shape) {
            var _this = this;

            this.add(shape);
            if (!Array.isArray(shape)) {
                this.staticShapes.push(shape);
            } else {
                shape.forEach(function (s) {
                    return _this.staticShapes.push(s);
                });
            }
            shape.canvas = this.staticBackgroundCanvas;
        }
    }, {
        key: "addToStaticForeground",
        value: function addToStaticForeground(shape) {
            var _this2 = this;

            this.add(shape);
            if (!Array.isArray(shape)) {
                this.staticShapes.push(shape);
            } else {
                shape.forEach(function (s) {
                    return _this2.staticShapes.push(s);
                });
            }
            shape.canvas = this.staticForegroundCanvas;
        }
    }, {
        key: "addToDynamicBackground",
        value: function addToDynamicBackground(shape) {
            var _this3 = this;

            this.add(shape);
            if (!Array.isArray(shape)) {
                this.dynamicShapes.push(shape);
            } else {
                shape.forEach(function (s) {
                    return _this3.dynamicShapes.push(s);
                });
            }
            shape.canvas = this.dynamicBackgroundCanvas;
        }
    }, {
        key: "addToDynamicForeground",
        value: function addToDynamicForeground(shape) {
            var _this4 = this;

            this.add(shape);
            if (!Array.isArray(shape)) {
                this.dynamicShapes.push(shape);
            } else {
                shape.forEach(function (s) {
                    return _this4.dynamicShapes.push(s);
                });
            }
            shape.canvas = this.dynamicForegroundCanvas;
        }
    }, {
        key: "forEach",
        value: function forEach(callback) {
            var _this5 = this;

            Object.keys(this.shapes).forEach(function (key) {
                var obj = _this5.shapes[key];
                if (obj) {
                    callback(obj);
                }
            });
        }
    }, {
        key: "add",
        value: function add(shape) {
            var _this6 = this;

            if (Array.isArray(shape)) {
                shape.forEach(function (obj) {
                    addShape.call(_this6, obj);
                });
            } else {
                addShape.call(this, shape);
            }

            function addShape(s) {
                s.id = this.shapeId;
                this.shapeId++;
                if (this.length < this.maxShapes) {
                    this._shapes[s.id] = s;
                }
                if (!s.canvas) s.canvas = this.staticBackgroundCanvas;
            }
        }
    }, {
        key: "remove",
        value: function remove(shape) {
            var shapesRegistry = this;
            setTimeout(function () {
                delete shapesRegistry._shapes[shape.id];
            }, 0);
        }
    }, {
        key: "reset",
        value: function reset() {
            this.shapeId = 0;
            this.shapes = {};
        }
    }, {
        key: "staticBackgroundCanvas",
        get: function get() {
            return this._staticBackgroundCanvas;
        },
        set: function set(staticBackgroundCanvas) {
            this._staticBackgroundCanvas = staticBackgroundCanvas;
        }
    }, {
        key: "dynamicBackgroundCanvas",
        get: function get() {
            return this._dynamicBackgroundCanvas;
        },
        set: function set(dynamicBackgroundCanvas) {
            this._dynamicBackgroundCanvas = dynamicBackgroundCanvas;
        }
    }, {
        key: "staticForegroundCanvas",
        get: function get() {
            return this._staticForegroundCanvas;
        },
        set: function set(staticForegroundCanvas) {
            this._staticForegroundCanvas = staticForegroundCanvas;
        }
    }, {
        key: "dynamicForegroundCanvas",
        get: function get() {
            return this._dynamicForegroundCanvas;
        },
        set: function set(dynamicForegroundCanvas) {
            this._dynamicBackgroundCanvas = dynamicBackgroundCanvas;
        }
    }, {
        key: "allCanvases",
        get: function get() {
            return [this.staticBackgroundCanvas, this.dynamicBackgroundCanvas, this.staticForegroundCanvas, this.dynamicForegroundCanvas];
        }
    }, {
        key: "shapes",
        get: function get() {
            return this._shapes;
        },
        set: function set(shapes) {
            this._shapes = shapes;
        }
    }, {
        key: "dynamicShapes",
        get: function get() {
            return this._dynamicShapes;
        },
        set: function set(dynamicShapes) {
            this._dynamicShapes = dynamicShapes;
        }
    }, {
        key: "staticShapes",
        get: function get() {
            return this._staticShapes;
        },
        set: function set(staticShapes) {
            this._staticShapes = staticShapes;
        }
    }, {
        key: "shapeId",
        get: function get() {
            return this._shapeId;
        },
        set: function set(id) {
            this._shapeId = id;
        }
    }, {
        key: "maxShapes",
        get: function get() {
            return this._maxShapes;
        },
        set: function set(n) {
            this._maxShapes = n;
        }
    }, {
        key: "length",
        get: function get() {
            return Object.keys(this.shapes).length;
        }
    }]);

    return ShapesRegistry;
}();

exports.ShapesRegistry = ShapesRegistry;

},{"./canvas.js":3}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Circle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _sprite = require("../sprite.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Circle = function (_Sprite) {
    _inherits(Circle, _Sprite);

    function Circle(x, y, width, height) {
        _classCallCheck(this, Circle);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Circle).call(this, x, y, width, height));

        _this.type = "Circle";
        _this._radius = width / 2;
        _this.startAngle = 0;
        _this.endAngle = 2;
        return _this;
    }

    _createClass(Circle, [{
        key: "createSATObject",
        value: function createSATObject() {
            return [new SAT.Circle(new SAT.Vector(this.center.x, this.center.y), this.width / 2)];
        }
    }, {
        key: "draw",
        value: function draw(ctx) {
            _get(Object.getPrototypeOf(Circle.prototype), "draw", this).call(this, ctx);

            ctx.beginPath();

            ctx.arc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle);

            if (!this.pathOnly) ctx.fill();
            if (!this.pathOnly && this.lineColor) ctx.stroke();
            ctx.closePath();
        }
    }, {
        key: "radius",
        get: function get() {
            return this._radius;
        },
        set: function set(radius) {
            this._radius = radius;
        }
    }, {
        key: "width",
        get: function get() {
            return _get(Object.getPrototypeOf(Circle.prototype), "width", this);
        },
        set: function set(width) {
            _set(Object.getPrototypeOf(Circle.prototype), "width", width, this);
            this.radius = width / 2;
        }
    }, {
        key: "height",
        get: function get() {
            return _get(Object.getPrototypeOf(Circle.prototype), "height", this);
        },
        set: function set(height) {
            _set(Object.getPrototypeOf(Circle.prototype), "height", height, this);
            //this.radius = height/2;
        }
    }, {
        key: "startAngle",
        get: function get() {
            return this._startAngle;
        },
        set: function set(startAngle) {
            this._startAngle = startAngle * Math.PI;
            //this.radius = height/2;
        }
    }, {
        key: "endAngle",
        get: function get() {
            return this._endAngle;
        },
        set: function set(endAngle) {
            this._endAngle = endAngle * Math.PI;
            //this.radius = height/2;
        }
    }]);

    return Circle;
}(_sprite.Sprite);

exports.Circle = Circle;

},{"../sprite.js":35}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Polygon = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _sprite = require('../sprite.js');

var _point = require('../point.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Polygon = function (_Sprite) {
    _inherits(Polygon, _Sprite);

    function Polygon(x, y, width, height, sides) {
        _classCallCheck(this, Polygon);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Polygon).call(this, x, y, width, height));

        _this.type = "Polygon";
        _this._sides = sides;
        _this._points = [];
        _this._radius = _this.width / 2;
        _this.updatePolygon();
        return _this;
    }

    _createClass(Polygon, [{
        key: 'rotate',
        value: function rotate(deg, transformOrigin) {
            _get(Object.getPrototypeOf(Polygon.prototype), 'rotate', this).call(this, deg, transformOrigin);
            this.points = this.points.map(function (point) {
                return trees.rotatePoint(point, transformOrigin, deg);
            });
        }
    }, {
        key: '_updatePoints',
        value: function _updatePoints() {
            var oldOrigin = this.origin;
            _get(Object.getPrototypeOf(Polygon.prototype), '_updatePoints', this).call(this);
            if (!this.points) this.updatePolygon();

            var xDiff = this.origin.x - oldOrigin.x;
            var yDiff = this.origin.y - oldOrigin.y;

            this.points = this.points.map(function (point) {
                return new _point.Point(point.x + xDiff, point.y + yDiff);
            });
        }
    }, {
        key: 'updatePolygon',
        value: function updatePolygon() {
            this._points = [];

            var startingPoint = trees.getPointOnLine(this.a, this.width / 2, trees.getAngle(this.a, this.b));
            var a = Math.acos((startingPoint.x - this.center.x) / this.radius);

            for (var i = 0; i < this.sides; i++) {
                var x = this.center.x + this.radius * Math.cos(a + 2 * Math.PI * i / this.sides);
                var y = this.center.y + this.radius * Math.sin(a + 2 * Math.PI * i / this.sides);
                this._points[i] = new _point.Point(x, y);
            }
        }
    }, {
        key: 'createSATObject',
        value: function createSATObject() {
            var _this2 = this;

            var result = [];
            this.points.forEach(function (point) {
                result.push(new SAT.Vector(point.x - _this2.x, point.y - _this2.y));
            });
            return [new SAT.Polygon(new SAT.Vector(this.x, this.y), result)];
        }
    }, {
        key: 'draw',
        value: function draw(ctx) {
            _get(Object.getPrototypeOf(Polygon.prototype), 'draw', this).call(this, ctx);
            var rect = {
                a: this.a,
                b: this.b,
                c: this.c,
                d: this.d
            };

            if (this.points.length) {
                ctx.beginPath();
                ctx.yMove(this.points[0]);

                this.points.forEach(function (point, index) {
                    ctx.yLine(point);
                });
                ctx.yLine(this.points[0]);

                if (this.lineColor) ctx.stroke();
                ctx.closePath();
                ctx.fill();
            }
        }
    }, {
        key: 'sides',
        get: function get() {
            return this._sides;
        },
        set: function set(sides) {
            this._sides = sides;
            this.updatePolygon();
        }
    }, {
        key: 'points',
        get: function get() {
            return this._points;
        },
        set: function set(points) {
            this._points = points;
        }
    }, {
        key: 'radius',
        get: function get() {
            return this._radius;
        },
        set: function set(radius) {
            this._radius = radius;
        }
    }, {
        key: 'width',
        get: function get() {
            return _get(Object.getPrototypeOf(Polygon.prototype), 'width', this);
        },
        set: function set(width) {
            _set(Object.getPrototypeOf(Polygon.prototype), 'width', width, this);
            this._radius = width / 2;
            this.updatePolygon();
        }
    }]);

    return Polygon;
}(_sprite.Sprite);

exports.Polygon = Polygon;

},{"../point.js":24,"../sprite.js":35}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Rectangle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _sprite = require('../sprite.js');

var _drawInstruction = require('../drawInstruction.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rectangle = function (_Sprite) {
    _inherits(Rectangle, _Sprite);

    function Rectangle(x, y, width, height, angle) {
        _classCallCheck(this, Rectangle);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Rectangle).call(this, x, y, width, height, angle));

        _this.type = "Rectangle";

        var lines = _this.lines();
        lines.forEach(function (line) {
            _this.drawingInstructions.push(new _drawInstruction.DrawInstruction(line));
        });
        return _this;
    }

    _createClass(Rectangle, [{
        key: 'createSATObject',
        value: function createSATObject() {
            return [new SAT.Polygon(new SAT.Vector(this.x, this.y), [new SAT.Vector(this.a.x - this.x, this.a.y - this.y), new SAT.Vector(this.b.x - this.x, this.b.y - this.y), new SAT.Vector(this.c.x - this.x, this.c.y - this.y), new SAT.Vector(this.d.x - this.x, this.d.y - this.y)])];
        }
    }, {
        key: 'draw',
        value: function draw(ctx) {
            ctx = ctx || this.canvas && this.canvas.ctx;
            _get(Object.getPrototypeOf(Rectangle.prototype), 'draw', this).call(this, ctx);
            var rect = {
                a: this.a,
                b: this.b,
                c: this.c,
                d: this.d
            };

            ctx.beginPath();
            ctx.yMove(this.a);
            ctx.yRect(rect);
            if (!this.pathOnly) ctx.fill();
            if (!this.pathOnly && this.lineColor) ctx.stroke();
            ctx.closePath();
        }
    }]);

    return Rectangle;
}(_sprite.Sprite);

exports.Rectangle = Rectangle;

},{"../drawInstruction.js":15,"../sprite.js":35}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SemiCircle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _sprite = require("../sprite.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SemiCircle = function (_Sprite) {
    _inherits(SemiCircle, _Sprite);

    function SemiCircle(x, y, width, height, angle) {
        _classCallCheck(this, SemiCircle);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SemiCircle).call(this, x, y, width, height, angle));

        _this.type = "SemiCircle";
        _this._radius = width / 2;

        return _this;
    }

    _createClass(SemiCircle, [{
        key: "createSATObject",
        value: function createSATObject() {
            return [new SAT.Circle(new SAT.Vector(this.center.x, this.center.y), this.radius)];
        }
    }, {
        key: "draw",
        value: function draw(ctx) {
            _get(Object.getPrototypeOf(SemiCircle.prototype), "draw", this).call(this, ctx);

            ctx.beginPath();

            ctx.arc(this.center.x, this.center.y, this.radius, 1 * Math.PI, 0);

            ctx.fill();
            if (this.lineColor) ctx.stroke();
            ctx.closePath();
        }
    }, {
        key: "radius",
        get: function get() {
            return this._radius;
        },
        set: function set(radius) {
            this._radius = radius;
        }
    }, {
        key: "width",
        get: function get() {
            return _get(Object.getPrototypeOf(SemiCircle.prototype), "width", this);
        },
        set: function set(width) {
            _set(Object.getPrototypeOf(SemiCircle.prototype), "width", width, this);
            this.radius = width / 2;
        }
    }, {
        key: "height",
        get: function get() {
            return _get(Object.getPrototypeOf(SemiCircle.prototype), "height", this);
        },
        set: function set(height) {
            _set(Object.getPrototypeOf(SemiCircle.prototype), "height", height, this);
            //this.radius = height/2;
        }
    }]);

    return SemiCircle;
}(_sprite.Sprite);

exports.SemiCircle = SemiCircle;

},{"../sprite.js":35}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.simples = undefined;

var _rectangle = require('./rectangle.js');

var _triangle = require('./triangle.js');

var _circle = require('./circle.js');

var _polygon = require('./polygon.js');

var _semiCircle = require('./semiCircle.js');

var _wedge = require('./wedge.js');

var _trapezoid = require('./trapezoid.js');

var _text = require('./text.js');

var simples = {
    Rectangle: _rectangle.Rectangle,
    Circle: _circle.Circle,
    Wedge: _wedge.Wedge,
    Trapezoid: _trapezoid.Trapezoid,
    Text: _text.Text
};

exports.simples = simples;

},{"./circle.js":26,"./polygon.js":27,"./rectangle.js":28,"./semiCircle.js":29,"./text.js":31,"./trapezoid.js":32,"./triangle.js":33,"./wedge.js":34}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Text = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _sprite = require('../sprite.js');

var _shapesregistry = require('../shapesregistry.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var shapesRegistry = new _shapesregistry.ShapesRegistry();

var Text = function (_Sprite) {
    _inherits(Text, _Sprite);

    function Text(text, x, y, size, font) {
        _classCallCheck(this, Text);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Text).call(this, x, y, size, size));

        _this.type = "Text";
        _this._value = text;
        _this._size = size;
        _this._fontName = font;
        _this._font = size + "px " + font;
        return _this;
    }

    _createClass(Text, [{
        key: 'draw',
        value: function draw(ctx) {
            var _this2 = this;

            ctx = ctx || this.canvas && this.canvas.ctx;
            _get(Object.getPrototypeOf(Text.prototype), 'draw', this).call(this, ctx);
            ctx.font = this.font;
            ctx.textBaseline = "hanging";
            ctx.textAlign = "center";
            if (Array.isArray(this.color)) {
                (function () {
                    var letters = _this2.value.split("");
                    var x = _this2.x;
                    letters.forEach(function (letter, index) {
                        var color = void 0;
                        if (index <= _this2.color.length - 1) {
                            color = _this2.color[index];
                        } else {
                            color = _this2.color[index % _this2.color.length];
                        }
                        ctx.fillStyle = color;
                        ctx.fillText(letter, x, _this2.y + index * 20);
                        x += ctx.measureText(letter).width;
                    });
                })();
            } else {
                ctx.fillText(this.value, this.x, this.y);
            }
        }
    }, {
        key: 'getWidth',
        get: function get() {
            return shapesRegistry.canvas.measureText(this.value, this.font);
        }
    }, {
        key: 'value',
        get: function get() {
            return this._value;
        },
        set: function set(value) {
            this._value = value;
        }
    }, {
        key: 'fontName',
        get: function get() {
            return this._fontName;
        },
        set: function set(fontName) {
            this._fontName = fontName;
        }
    }, {
        key: 'font',
        get: function get() {
            return this._font;
        },
        set: function set(font) {
            this.fontName = font;
            this._font = this.size + "px " + this.fontName;
        }
    }, {
        key: 'size',
        get: function get() {
            return this._size;
        },
        set: function set(size) {
            this._size = size;
            this._font = size + "px " + this.fontName;
        }
    }]);

    return Text;
}(_sprite.Sprite);

exports.Text = Text;

},{"../shapesregistry.js":25,"../sprite.js":35}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Trapezoid = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _point = require('../point.js');

var _line = require('../line.js');

var _sprite = require('../sprite.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Trapezoid = function (_Sprite) {
    _inherits(Trapezoid, _Sprite);

    function Trapezoid(x, y, width, height, leftAngle, rightAngle) {
        _classCallCheck(this, Trapezoid);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Trapezoid).call(this, x, y, width, height));

        _this.type = "Trapezoid";

        if (typeof leftAngle !== "number") {
            throw new Error("No angle for trapezoid was supplied.");
        }

        if (typeof rightAngle !== "number") {
            rightAngle = leftAngle;
        }

        //left angle is the degree of the top left corner.
        //right angle is the degree of the top right corner.

        _this._leftAngle = leftAngle;
        _this._rightAngle = rightAngle;
        _this._setAngles();

        if (_this.topLeft.x > _this.topRight.x || _this.bottomLeft.x > _this.bottomRight.x || _this.topLeft.y > _this.bottomLeft.y || _this.topRight.y > _this.bottomRight.y) {
            throw new Error("Parameters do not define trapezoid.");
        }
        //this.showBoundingBox = true;

        return _this;
    }

    _createClass(Trapezoid, [{
        key: 'animate',
        value: function animate() {
            // if (!this.collidingWithPlatform) this.fall();
        }
    }, {
        key: 'lines',
        value: function lines() {
            return [new _line.Line(this.topLeft, this.topRight), new _line.Line(this.topRight, this.bottomRight), new _line.Line(this.bottomRight, this.bottomLeft), new _line.Line(this.bottomLeft, this.topLeft)];
        }
    }, {
        key: 'getSideLength',
        value: function getSideLength(angle, height) {
            var radians = trees.degToRad(180 - angle);
            return height / Math.sin(radians);
        }
    }, {
        key: 'rotate',
        value: function rotate(deg, transformOrigin) {
            _get(Object.getPrototypeOf(Trapezoid.prototype), 'rotate', this).call(this, deg, transformOrigin);
            if (this.topLeft) {
                this.topLeft = trees.rotatePoint(this.topLeft, transformOrigin, deg);
                this.topRight = trees.rotatePoint(this.topRight, transformOrigin, deg);
                this.bottomLeft = trees.rotatePoint(this.bottomLeft, transformOrigin, deg);
                this.bottomRight = trees.rotatePoint(this.bottomRight, transformOrigin, deg);
            }
        }
    }, {
        key: 'trimTop',
        value: function trimTop(amount) {
            //main concern with this function is it does not adjust the width as trapezoid scales
            //therefore, we should be careful when collision testing, if that becomes necessary.
            var oldHeight = this.height;
            var oldLeftHypotenuse = this.getSideLength(this.leftAngle, oldHeight);
            var oldRightHypotenuse = this.getSideLength(this.rightAngle, oldHeight);

            var bottomLeft = trees.copyPoint(this.bottomLeft);
            var bottomRight = trees.copyPoint(this.bottomRight);
            var topRight = trees.copyPoint(this.topRight);
            var topLeft = trees.copyPoint(this.topLeft);

            _get(Object.getPrototypeOf(Trapezoid.prototype), 'trimTop', this).call(this, amount);

            var newLeftHypotenuse = this.getSideLength(this.leftAngle, this.height);
            var newRightHypotenuse = this.getSideLength(this.rightAngle, this.height);

            this.topLeft = trees.getPointOnLine(topLeft, oldLeftHypotenuse - newLeftHypotenuse, trees.getAngle(this.topLeft, this.bottomLeft));
            this.topRight = trees.getPointOnLine(topRight, oldRightHypotenuse - newRightHypotenuse, trees.getAngle(this.topRight, this.bottomRight));

            this.bottomLeft = bottomLeft;
            this.bottomRight = bottomRight;
        }
    }, {
        key: 'growTop',
        value: function growTop(amount) {
            this.trimTop(-amount);
        }
    }, {
        key: '_setAngles',
        value: function _setAngles() {
            if (this.leftAngle < 90) {

                this._topLeft = this.a;
                this._bottomLeft = trees.getPointOnLine(this.a, this.getSideLength(this.leftAngle, this.height), this.leftAngle);
            } else {

                this._topLeft = trees.getPointOnLine(this.d, -this.getSideLength(this.leftAngle, this.height), this.leftAngle);
                this._bottomLeft = this.d;
            }

            if (this.rightAngle < 90) {

                this._topRight = this.b;
                this._bottomRight = trees.getPointOnLine(this.b, this.getSideLength(this.rightAngle, this.height), 180 - this.rightAngle);
            } else {

                this._topRight = trees.getPointOnLine(this.c, -this.getSideLength(this.rightAngle, this.height), 180 - this.rightAngle);
                this._bottomRight = this.c;
            }
        }
    }, {
        key: 'draw',
        value: function draw(ctx) {
            _get(Object.getPrototypeOf(Trapezoid.prototype), 'draw', this).call(this, ctx);

            ctx.beginPath();
            ctx.yMove(this.topLeft);
            ctx.yLine(this.bottomLeft);
            ctx.yLine(this.bottomRight);
            ctx.yLine(this.topRight);
            ctx.yLine(this.topLeft);

            if (!this.pathOnly) ctx.fill();
            if (!this.pathOnly && this.lineColor) ctx.stroke();
            ctx.closePath();
        }
    }, {
        key: 'x',
        set: function set(x) {
            var oldX = this.x;
            var diffX = x - oldX;
            _set(Object.getPrototypeOf(Trapezoid.prototype), 'x', x, this);
            this.topLeft.x += diffX;
            this.topRight.x += diffX;
            this.bottomLeft.x += diffX;
            this.bottomRight.x += diffX;
        },
        get: function get() {
            return _get(Object.getPrototypeOf(Trapezoid.prototype), 'x', this);
        }
    }, {
        key: 'y',
        set: function set(y) {
            var oldY = this.y;
            var diffY = y - oldY;
            _set(Object.getPrototypeOf(Trapezoid.prototype), 'y', y, this);
            this.topLeft.y += diffY;
            this.topRight.y += diffY;
            this.bottomLeft.y += diffY;
            this.bottomRight.y += diffY;
        },
        get: function get() {
            return _get(Object.getPrototypeOf(Trapezoid.prototype), 'y', this);
        }
    }, {
        key: 'width',
        get: function get() {
            return _get(Object.getPrototypeOf(Trapezoid.prototype), 'width', this);
        },
        set: function set(width) {
            _set(Object.getPrototypeOf(Trapezoid.prototype), 'width', width, this);
        }
    }, {
        key: 'height',
        get: function get() {
            return _get(Object.getPrototypeOf(Trapezoid.prototype), 'height', this);
        },
        set: function set(height) {
            _set(Object.getPrototypeOf(Trapezoid.prototype), 'height', height, this);
        }
    }, {
        key: 'area',
        get: function get() {
            return 0.5 * (this.b1 + this.b2) * this.height;
        }
    }, {
        key: 'b1',
        get: function get() {
            return this.topRight.x - this.topLeft.x;
        }
    }, {
        key: 'b2',
        get: function get() {
            return this.bottomRight.x - this.bottomLeft.x;
        }
    }, {
        key: 'bottomLeft',
        get: function get() {
            return this._bottomLeft;
        },
        set: function set(bottomLeft) {
            this._bottomLeft = bottomLeft;
        }
    }, {
        key: 'bottomRight',
        get: function get() {
            return this._bottomRight;
        },
        set: function set(bottomRight) {
            this._bottomRight = bottomRight;
        }
    }, {
        key: 'topLeft',
        get: function get() {
            return this._topLeft;
        },
        set: function set(topLeft) {
            this._topLeft = topLeft;
        }
    }, {
        key: 'topRight',
        get: function get() {
            return this._topRight;
        },
        set: function set(topRight) {
            this._topRight = topRight;
        }
    }, {
        key: 'leftAngle',
        get: function get() {
            return this._leftAngle;
        },
        set: function set(leftAngle) {
            this._leftAngle = leftAngle;
        }
    }, {
        key: 'rightAngle',
        get: function get() {
            return this._rightAngle;
        },
        set: function set(rightAngle) {
            this._rightAngle = rightAngle;
        }
    }]);

    return Trapezoid;
}(_sprite.Sprite);

exports.Trapezoid = Trapezoid;

},{"../line.js":18,"../point.js":24,"../sprite.js":35}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Triangle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _sprite = require('../sprite.js');

var _point = require('../point.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Triangle = function (_Sprite) {
    _inherits(Triangle, _Sprite);

    function Triangle(x, y, width, height, angle) {
        _classCallCheck(this, Triangle);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Triangle).call(this, x, y, width, height, angle));

        _this.type = "Triangle";
        _this.ta = new _point.Point(_this.d.x, _this.d.y);
        _this.tb = new _point.Point(_this.c.x, _this.c.y);
        _this.tc = trees.getPointOnLine(_this.a, _this.width / 2, trees.getAngle(_this.a, _this.b));
        return _this;
    }

    _createClass(Triangle, [{
        key: 'rotate',
        value: function rotate(deg, transformOrigin) {
            _get(Object.getPrototypeOf(Triangle.prototype), 'rotate', this).call(this, deg, transformOrigin);
            this.ta = trees.rotatePoint(this.ta, transformOrigin, deg);
            this.tb = trees.rotatePoint(this.tb, transformOrigin, deg);
            this.tc = trees.rotatePoint(this.tc, transformOrigin, deg);
        }
    }, {
        key: '_updatePoints',
        value: function _updatePoints() {
            var oldOrigin = this.origin;
            _get(Object.getPrototypeOf(Triangle.prototype), '_updatePoints', this).call(this);

            var xDiff = this.origin.x - oldOrigin.x;
            var yDiff = this.origin.y - oldOrigin.y;
            if (!this.ta) {
                this.ta = new _point.Point(this.d.x, this.d.y);
                this.tb = new _point.Point(this.c.x, this.c.y);
                this.tc = trees.getPointOnLine(this.a, this.width / 2, trees.getAngle(this.a, this.b));
            }
            this.ta = new _point.Point(this.ta.x + xDiff, this.ta.y + yDiff);
            this.tb = new _point.Point(this.tb.x + xDiff, this.tb.y + yDiff);
            this.tc = new _point.Point(this.tc.x + xDiff, this.tc.y + yDiff);
        }
    }, {
        key: 'createSATObject',
        value: function createSATObject() {
            return [new SAT.Polygon(new SAT.Vector(this.x, this.y), [new SAT.Vector(this.ta.x - this.x, this.ta.y - this.y), new SAT.Vector(this.tc.x - this.x, this.tc.y - this.y), new SAT.Vector(this.tb.x - this.x, this.tb.y - this.y)])];
        }
    }, {
        key: 'draw',
        value: function draw(ctx) {
            _get(Object.getPrototypeOf(Triangle.prototype), 'draw', this).call(this, ctx);
            ctx.beginPath();
            ctx.moveTo(this.ta.x, this.ta.y);
            ctx.lineTo(this.tb.x, this.tb.y);
            ctx.lineTo(this.tc.x, this.tc.y);
            ctx.lineTo(this.ta.x, this.ta.y);
            if (!this.pathOnly) ctx.fill();
            if (!this.pathOnly && this.lineColor) ctx.stroke();
            ctx.closePath();
        }
    }, {
        key: 'width',
        get: function get() {
            return _get(Object.getPrototypeOf(Triangle.prototype), 'width', this);
        },
        set: function set(width) {
            _set(Object.getPrototypeOf(Triangle.prototype), 'width', width, this);
            this.tb = new _point.Point(this.c.x, this.c.y);
            this.tc = trees.getPointOnLine(this.a, trees.getDistance(this.a, this.b) / 2, trees.getAngle(this.a, this.b));
        }
    }, {
        key: 'height',
        get: function get() {
            return _get(Object.getPrototypeOf(Triangle.prototype), 'height', this);
        },
        set: function set(height) {
            _set(Object.getPrototypeOf(Triangle.prototype), 'height', height, this);
            this.ta = new _point.Point(this.d.x, this.d.y);
            this.tb = new _point.Point(this.c.x, this.c.y);
        }
    }, {
        key: 'points',
        get: function get() {
            return [this.ta, this.tb, this.tc];
        },
        set: function set(arr) {
            if (!Array.isArray(arr) || arr.length < 3) {
                throw new Error("Triangle points property expects array with three Point objects");
            }
            this.ta = arr[0];
            this.tb = arr[1];
            this.tc = arr[2];
        }
    }]);

    return Triangle;
}(_sprite.Sprite);

exports.Triangle = Triangle;

},{"../point.js":24,"../sprite.js":35}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Wedge = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _point = require('../point.js');

var _sprite = require('../sprite.js');

var _curve = require('../curve.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getBezierDistance(n) {
    return n / 2 * 0.552284749831;
}

var Wedge = function (_Sprite) {
    _inherits(Wedge, _Sprite);

    function Wedge(x, y, width, height) {
        _classCallCheck(this, Wedge);

        // Here, it calls the parent class' constructor with lengths
        // provided for the Polygon's width and height
        return _possibleConstructorReturn(this, Object.getPrototypeOf(Wedge).call(this, x, y, width, height));
    }

    _createClass(Wedge, [{
        key: '_updatePoints',
        value: function _updatePoints() {
            var oldOrigin = this.origin;
            _get(Object.getPrototypeOf(Wedge.prototype), '_updatePoints', this).call(this);

            var xDiff = this.origin.x - oldOrigin.x;
            var yDiff = this.origin.y - oldOrigin.y;
            if (!this.cp1) {
                this._cp1 = new _point.Point(this.x + getBezierDistance(this.width * 2), this.y);
                this._cp2 = new _point.Point(this.b.x, this.c.y - getBezierDistance(this.height * 2));
                this._end = new _point.Point(this.c.x, this.c.y);
            }
            this.cp1 = new _point.Point(this.cp1.x + xDiff, this.cp1.y + yDiff);
            this.cp2 = new _point.Point(this.cp2.x + xDiff, this.cp2.y + yDiff);
            this.end = new _point.Point(this.end.x + xDiff, this.end.y + yDiff);

            this._curve = new _curve.Curve(this._cp1, this._cp2, this._end);
        }
    }, {
        key: 'rotate',
        value: function rotate(deg, transformOrigin) {
            _get(Object.getPrototypeOf(Wedge.prototype), 'rotate', this).call(this, deg, transformOrigin);
            this.cp1 = trees.rotatePoint(this.cp1, transformOrigin, deg);
            this.cp2 = trees.rotatePoint(this.cp2, transformOrigin, deg);
            this.end = trees.rotatePoint(this.end, transformOrigin, deg);
            this.curve = new _curve.Curve(this.cp1, this.cp2, this.end);
        }
    }, {
        key: 'getReverseCurve',
        value: function getReverseCurve() {
            return new _curve.Curve(this.cp2, this.cp1, this.a);
        }
    }, {
        key: 'createSATObject',
        value: function createSATObject() {
            return [];
        }
    }, {
        key: 'draw',
        value: function draw(ctx) {
            _get(Object.getPrototypeOf(Wedge.prototype), 'draw', this).call(this, ctx);
            ctx.beginPath();
            ctx.yMove(this.origin);
            ctx.curve(this.curve);
            ctx.yLine(this.d);
            ctx.yLine(this.a);
            ctx.fill();
            if (this.lineColor) ctx.stroke();
            ctx.closePath();
        }
    }, {
        key: 'width',
        get: function get() {
            return _get(Object.getPrototypeOf(Wedge.prototype), 'width', this);
        },
        set: function set(width) {
            _set(Object.getPrototypeOf(Wedge.prototype), 'width', width, this);
            this.cp1 = trees.getPointOnLine(this.a, getBezierDistance(this.width * 2), trees.getAngle(this.a, this.b));
            this.cp2 = trees.getPointOnLine(this.c, getBezierDistance(-this.height * 2), trees.getAngle(this.b, this.c));
            this.end = new _point.Point(this.c.x, this.c.y);
            this._curve = new _curve.Curve(this._cp1, this._cp2, this._end);
        }
    }, {
        key: 'height',
        get: function get() {
            return _get(Object.getPrototypeOf(Wedge.prototype), 'height', this);
        },
        set: function set(height) {
            _set(Object.getPrototypeOf(Wedge.prototype), 'height', height, this);
            this.cp1 = trees.getPointOnLine(this.a, getBezierDistance(this.width * 2), trees.getAngle(this.a, this.b));
            this.cp2 = trees.getPointOnLine(this.c, getBezierDistance(-this.height * 2), trees.getAngle(this.b, this.c));
            this.end = new _point.Point(this.c.x, this.c.y);
            this._curve = new _curve.Curve(this._cp1, this._cp2, this._end);
        }
    }, {
        key: 'cp1',
        get: function get() {
            return this._cp1;
        },
        set: function set(cp1) {
            this._cp1 = cp1;
        }
    }, {
        key: 'cp2',
        get: function get() {
            return this._cp2;
        },
        set: function set(cp2) {
            this._cp2 = cp2;
        }
    }, {
        key: 'end',
        get: function get() {
            return this._end;
        },
        set: function set(end) {
            this._end = end;
        }
    }, {
        key: 'curve',
        get: function get() {
            return this._curve;
        },
        set: function set(curve) {
            this._curve = curve;
        }
    }]);

    return Wedge;
}(_sprite.Sprite);

exports.Wedge = Wedge;

},{"../curve.js":14,"../point.js":24,"../sprite.js":35}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Sprite = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _point = require('./point.js');

var _line = require('./line.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sprite = function () {
    function Sprite(x, y, width, height) {
        _classCallCheck(this, Sprite);

        this._width = width || 0;
        this._height = height || 0;
        this._x = x || 0;
        this._y = y || 0;
        this._origin = new _point.Point(this.x, this.y);
        this._a = new _point.Point(this.x, this.y);
        this._b = new _point.Point(this.x + this.width, this.y);
        this._c = new _point.Point(this.x + this.width, this.y + this.height);
        this._d = new _point.Point(this.x, this.y + this.height);
        this._boundary = {};
        this._center = new _point.Point(this.x + this.width / 2, this.y + this.height / 2);
        this._updatePoints();
        this._lineWidth = 1;
        this._showBoundingBox = false;
        this._color = "transparent";
        this._lineColor = null;
        this._id = null;
        this._collidingWith = null;
        this._collidable = false;
        this._minHeight = 1;
        this._visible = true;
        this._pathOnly = false;
        this._drawingInstructions = [];
    }

    _createClass(Sprite, [{
        key: 'rotate',
        value: function rotate(deg, transformOrigin) {
            if (typeof deg !== "number" || typeof transformOrigin.x !== "number" || typeof transformOrigin.y !== "number") {
                throw new Error('Attempted to rotate using non-numeric value');
            }
            this._origin = trees.rotatePoint(this.origin, transformOrigin, deg);
            this._x = this.origin.x;
            this._y = this.origin.y;
            this.a = trees.rotatePoint(this.a, transformOrigin, deg);
            this.b = trees.rotatePoint(this.b, transformOrigin, deg);
            this.c = trees.rotatePoint(this.c, transformOrigin, deg);
            this.d = trees.rotatePoint(this.d, transformOrigin, deg);
            this.center = trees.rotatePoint(this.center, transformOrigin, deg);

            this._updateBoundaries();
        }
    }, {
        key: 'trimTop',
        value: function trimTop(amount) {
            amount = this.height - amount > this._minHeight ? amount : this.height - this._minHeight;
            this._height -= amount;
            var angle = trees.getAngle(this.a, this.d);
            var newOrigin = trees.getPointOnLine(this.a, amount, angle);

            this.x = newOrigin.x;
            this.y = newOrigin.y;
            this.c = trees.getPointOnLine(this.c, -amount, angle);
            this.d = trees.getPointOnLine(this.d, -amount, angle);

            this.center = trees.getPointOnLine(this.a, trees.getDistance(this.a, this.c) / 2, trees.getAngle(this.a, this.c));
            this._updateBoundaries();
        }
    }, {
        key: 'growTop',
        value: function growTop(amount) {
            this._height += amount;
            var angle = trees.getAngle(this.a, this.d);
            var newOrigin = trees.getPointOnLine(this.a, -amount, angle);
            this.x = newOrigin.x;
            this.y = newOrigin.y;
            this.c = trees.getPointOnLine(this.c, amount, angle);
            this.d = trees.getPointOnLine(this.d, amount, angle);
            this.center = trees.getPointOnLine(this.a, trees.getDistance(this.a, this.c) / 2, trees.getAngle(this.a, this.c));
            this._updateBoundaries();
        }
    }, {
        key: 'lines',
        value: function lines() {
            return [new _line.Line(this.a, this.b), new _line.Line(this.b, this.c), new _line.Line(this.c, this.d), new _line.Line(this.d, this.a)];
        }
    }, {
        key: 'wasClicked',
        value: function wasClicked(mouseX, mouseY) {
            if (this.boundary.a.x <= mouseX && this.boundary.b.x >= mouseX && this.boundary.a.y * 0.9 <= mouseY && this.boundary.d.y * 1.1 >= mouseY) {
                return this;
            }
            return null;
        }
    }, {
        key: '_updatePoints',
        value: function _updatePoints() {

            var oldOrigin = this.origin;
            this.origin = new _point.Point(this.x, this.y);
            var xDiff = this.origin.x - oldOrigin.x;
            var yDiff = this.origin.y - oldOrigin.y;
            this.center = new _point.Point(this.center.x + xDiff, this.center.y + yDiff);

            this.a = new _point.Point(this.a.x + xDiff, this.a.y + yDiff);
            this.b = new _point.Point(this.b.x + xDiff, this.b.y + yDiff);
            this.c = new _point.Point(this.c.x + xDiff, this.c.y + yDiff);
            this.d = new _point.Point(this.d.x + xDiff, this.d.y + yDiff);

            this._updateBoundaries();
        }
    }, {
        key: '_updateBoundaries',
        value: function _updateBoundaries() {
            var lowestX = Math.min(this.a.x, this.b.x, this.c.x, this.d.x);
            var highestX = Math.max(this.a.x, this.b.x, this.c.x, this.d.x);
            var lowestY = Math.min(this.a.y, this.b.y, this.c.y, this.d.y);
            var highestY = Math.max(this.a.y, this.b.y, this.c.y, this.d.y);
            var boundaryW = highestX - lowestX;
            var boundaryH = highestY - lowestY;

            this.boundary.a = new _point.Point(lowestX, lowestY);
            this.boundary.b = new _point.Point(lowestX + boundaryW, lowestY);
            this.boundary.c = new _point.Point(lowestX + boundaryW, lowestY + boundaryH);
            this.boundary.d = new _point.Point(lowestX, lowestY + boundaryH);
        }
    }, {
        key: 'draw',
        value: function draw(ctx) {
            ctx = ctx || this.canvas && this.canvas.ctx;

            if (!ctx || !ctx.beginPath || !ctx.closePath) {
                throw new Error("Attempted to draw without supplying context");
            }
            if (this.showBoundingBox) {
                ctx.beginPath();
                ctx.fillStyle = "red";
                ctx.lineWidth = 1;
                var size = 5;
                ctx.rect(this.x - size / 2, this.y - size / 2, size, size);
                ctx.rect(this.a.x - size / 2, this.a.y - size / 2, size, size);
                ctx.rect(this.center.x - size / 2, this.center.y - size / 2, size, size);
                ctx.fill();
                ctx.closePath();

                ctx.fillStyle = "transparent";

                ctx.strokeStyle = "blue";
                ctx.beginPath();
                ctx.yRect(this.boundary);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                ctx.strokeStyle = "green";
                ctx.beginPath();
                ctx.yRect({
                    a: this.a,
                    b: this.b,
                    c: this.c,
                    d: this.d
                });
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
            } else {

                ctx.lineJoin = 'miter';
                ctx.fillStyle = this.color;
                ctx.strokeStyle = this.lineColor;
                ctx.lineWidth = this.lineWidth;
            }
        }
    }, {
        key: 'x',
        set: function set(x) {
            if (typeof x !== "number") {
                throw new Error("x must be a number.");
            };
            this._x = x;
            this._updatePoints();
        },
        get: function get() {
            return this._x;
        }
    }, {
        key: 'y',
        set: function set(y) {
            if (typeof y !== "number") {
                throw new Error("y must be a number.");
            };
            this._y = y;
            this._updatePoints();
        },
        get: function get() {
            return this._y;
        }
    }, {
        key: 'center',
        get: function get() {
            return this._center;
        },
        set: function set(center) {
            this._center = center;
        }
    }, {
        key: 'origin',
        get: function get() {
            return this._origin;
        },
        set: function set(origin) {
            this._origin = origin;
        }
    }, {
        key: 'id',
        set: function set(id) {
            this._id = id;
        },
        get: function get() {
            return this._id;
        }
    }, {
        key: 'a',
        set: function set(obj) {
            this._a = obj;
        },
        get: function get() {
            return this._a;
        }
    }, {
        key: 'b',
        set: function set(obj) {
            this._b = obj;
        },
        get: function get() {
            return this._b;
        }
    }, {
        key: 'c',
        set: function set(obj) {
            this._c = obj;
        },
        get: function get() {
            return this._c;
        }
    }, {
        key: 'd',
        set: function set(obj) {
            this._d = obj;
        },
        get: function get() {
            return this._d;
        }
    }, {
        key: 'width',
        get: function get() {
            return this._width;
        },
        set: function set(width) {
            if (typeof width !== "number") {
                throw new Error("width must be a number.");
            };
            var oldWidth = this.width;
            this._width = width;
            var widthDiff = this.width - oldWidth;

            var angle = trees.getAngle(this.a, this.b);
            this.b = trees.getPointOnLine(this.b, widthDiff, angle);
            this.c = trees.getPointOnLine(this.c, widthDiff, angle);

            this.center = trees.getPointOnLine(this.a, trees.getDistance(this.a, this.c) / 2, trees.getAngle(this.a, this.c));
            this._updateBoundaries();
        }
    }, {
        key: 'height',
        get: function get() {
            return this._height;
        },
        set: function set(height) {
            if (typeof height !== "number") {
                throw new Error("height must be a number.");
            };
            var oldHeight = this.height;
            this._height = height;
            var heightDiff = this.height - oldHeight;
            var angle = trees.getAngle(this.a, this.d);

            this.c = trees.getPointOnLine(this.c, heightDiff, angle);
            this.d = trees.getPointOnLine(this.d, heightDiff, angle);

            this.center = trees.getPointOnLine(this.a, trees.getDistance(this.a, this.c) / 2, trees.getAngle(this.a, this.c));
            this._updateBoundaries();
        }
    }, {
        key: 'showBoundingBox',
        set: function set(bool) {
            this._showBoundingBox = bool;
        },
        get: function get() {
            return this._showBoundingBox;
        }
    }, {
        key: 'collidable',
        set: function set(collidable) {
            this._collidable = collidable;
        },
        get: function get() {
            return this._collidable;
        }
    }, {
        key: 'color',
        set: function set(color) {
            this._color = color;
        },
        get: function get() {
            return this._color;
        }
    }, {
        key: 'lineColor',
        set: function set(color) {
            this._lineColor = color;
        },
        get: function get() {
            return this._lineColor;
        }
    }, {
        key: 'lineWidth',
        set: function set(width) {
            this._lineWidth = width;
        },
        get: function get() {
            return this._lineWidth;
        }
    }, {
        key: 'boundary',
        get: function get() {
            return this._boundary;
        },
        set: function set(boundary) {
            this._boundary = boundary;
        }
    }, {
        key: 'collidingWith',
        get: function get() {
            return this._collidingWith;
        },
        set: function set(collidingWith) {
            this._collidingWith = collidingWith;
        }
    }, {
        key: 'visible',
        get: function get() {
            return this._visible;
        },
        set: function set(visible) {
            this._visible = visible;
        }
    }, {
        key: 'pathOnly',
        get: function get() {
            return this._pathOnly;
        },
        set: function set(pathOnly) {
            this._pathOnly = pathOnly;
        }
    }, {
        key: 'drawingInstructions',
        get: function get() {
            return this._drawingInstructions;
        },
        set: function set(drawingInstructions) {
            this._drawingInstructions = drawingInstructions;
        }
    }]);

    return Sprite;
}();

exports.Sprite = Sprite;

},{"./line.js":18,"./point.js":24}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.keyboardEvents = undefined;

var _canvas = require('../canvas.js');

var _shapesregistry = require('../shapesregistry.js');

var keyboardEvents = {
    initialize: initialize
};

var shapes = new _shapesregistry.ShapesRegistry();
var boundingBoxes = false;
var i = 0;

var nowScrolling = false;

function initialize() {
    document.onkeydown = mapKeys;
}

function toggleBoundingBoxes() {
    boundingBoxes = !boundingBoxes;
    shapes.forEach(function (shape) {
        shape.showBoundingBox = boundingBoxes;
    });
}

function scrollUp() {

    nowScrolling = true;

    if (i < shapes.staticBackgroundCanvas.height.percent(2)) {
        shapes.allCanvases.forEach(function (canvas) {
            canvas.scroll(-3);
        });
        i++;
        setTimeout(scrollUp, 5);
    } else {
        nowScrolling = false;
    }
}

function scrollDown() {
    nowScrolling = true;
    if (i < shapes.staticBackgroundCanvas.height.percent(2)) {
        shapes.allCanvases.forEach(function (canvas) {
            canvas.scroll(3);
        });
        i++;
        setTimeout(scrollDown, 5);
    } else {
        nowScrolling = false;
    }
}

function mapKeys(e) {
    e = e || window.event;

    switch (e.keyCode) {
        case 32:
            // space
            toggleBoundingBoxes();
            break;
        case 38:
            i = 0;
            if (!nowScrolling) scrollUp();
            break;
        case 40:
            // down
            i = 0;
            if (!nowScrolling) scrollDown();
            break;
        default:
            return;
    }
    e.preventDefault();
};

exports.keyboardEvents = keyboardEvents;

},{"../canvas.js":3,"../shapesregistry.js":25}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mouseEvents = undefined;

var _canvas = require('../canvas.js');

var _shapesregistry = require('../shapesregistry.js');

var mouseEvents = {
    initialize: initialize
};

var shapesRegistry = new _shapesregistry.ShapesRegistry();
var clickedShape = null;
var mouse = { x: null, y: null };
var prevMouse = { x: null, y: null };
var direction = { left: false, right: false, up: false, down: false };
var mouseClick = null;
var mouseMove = null;

function initialize() {
    window.addEventListener("mousedown", clickObject);
    window.addEventListener("mouseup", releaseObject);
}

function clickObject(e) {
    // let bRect = shapesRegistry.canvas.getBoundingClientRect();
    // mouse.x = (e.clientX - bRect.left) * (shapesRegistry.canvas.width / bRect.width);
    // mouse.y = (e.clientY - bRect.top) * (shapesRegistry.canvas.height / bRect.height);

    // shapesRegistry.forEach(shape => {
    //     let clicked = shape.wasClicked(mouse.x, mouse.y);

    //     if (clicked) {

    //         mouseClick = new CustomEvent('mouseClick', {
    //             detail: { shape: clicked }
    //         });

    //         shapesRegistry.canvas.dispatchEvent(mouseClick);
    //         window.addEventListener("mousemove", dragObject, false)
    //     }
    // });
}

function dragObject(e) {
    // let bRect = shapesRegistry.canvas.getBoundingClientRect();
    // mouse.x = (e.clientX - bRect.left) * (shapesRegistry.canvas.width / bRect.width);
    // mouse.y = (e.clientY - bRect.top) * (shapesRegistry.canvas.height / bRect.height);

    // clickedShape = null;

    // shapesRegistry.forEach(shape => {
    //     clickedShape = clickedShape || shape.wasClicked(mouse.x, mouse.y);
    // });

    // if (prevMouse.x) {

    //     mouseMove = new CustomEvent('mouseMove', {
    //         detail: { direction: direction, mouse: mouse, shape: clickedShape }
    //     });

    //     direction.left = prevMouse.x > mouse.x;
    //     direction.right = prevMouse.x < mouse.x;
    //     direction.up = prevMouse.y > mouse.y;
    //     direction.down = prevMouse.y < mouse.y;
    //     shapesRegistry.canvas.dispatchEvent(mouseMove);

    // }

    // prevMouse.x = mouse.x;
    // prevMouse.y = mouse.y;


}

function releaseObject() {
    window.removeEventListener("mousemove", dragObject, false);
}

exports.mouseEvents = mouseEvents;

},{"../canvas.js":3,"../shapesregistry.js":25}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.scrollEvents = undefined;

var _shapesregistry = require('../shapesregistry.js');

var scrollEvents = {
    initialize: initialize
};
var shapes = new _shapesregistry.ShapesRegistry();

function initialize() {

    var nowScrolling = false;
    var last_known_scroll_position = 0;
    var ticking = false;

    window.addEventListener('scroll', function (e) {
        last_known_scroll_position = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(function () {
                shapes.allCanvases.forEach(function (canvas) {
                    canvas.currentY = last_known_scroll_position;
                    canvas.scroll(0);
                });
                //document.getElementById("main").style.marginTop = -last_known_scroll_position + "px"
                ticking = false;
            });
        }
        ticking = true;
    });
}

exports.scrollEvents = scrollEvents;

},{"../shapesregistry.js":25}],39:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.level0 = undefined;

var _engine = require("../engine/engine.js");

var shapes = _engine.engine.shapesRegistry;
var Width = void 0;
var Height = void 0;

var skyHeight = void 0;
var lakeHeight = void 0;
var earthHeight = void 0;
var caveHeight = void 0;

var BROWN = "#190D03";
var BLUE = "rgb(0,47,57)";
var GREEN = "rgb(0,74,37)";
var DARKPURPLE = "#1A001A";
var LIGHTPURPLE = "#44355B";
var PINK = "pink";
var FONTPRIMARY = "BungeeShade";
var WHITE = "white";
var BLACK = "black";
var GRAY = "gray";
var YELLOW = "yellow";
var OLIVE = "#666633";

function level0() {

    Width = shapes.staticBackgroundCanvas.width;
    Height = shapes.staticBackgroundCanvas.height;
    shapes.staticBackgroundCanvas.element.style.backgroundColor = DARKPURPLE;

    Clouds();
    StripedBalloons();
}

function StripedBalloons() {
    for (var i = 0; i < 5; i++) {

        var size = Width.percent(trees.random(2, 5));
        var x = Width.percent(trees.random(0, 95));
        var y = Height.percent(trees.random(0, 95));

        var balloon = new _engine.engine.client.StripedBalloon(x, y, size, size);
        balloon.stripeWidth = balloon.width.percent(trees.random(1, 20));
        balloon.stripeSpacing = balloon.width.percent(trees.random(1, 20));

        balloon.stripeColor = function () {
            var arr = [];
            for (var _i = 0; _i < trees.random(1, 25); _i++) {
                arr.push(trees.randomColor());
            }
            return arr;
        }();

        balloon.stripeOrientation = ["vertical", "diagonal", "horizontal"][trees.random(0, 2)];
        balloon.color = trees.randomColor();
        shapes.addToDynamicBackground(balloon);
    }
}

function Clouds() {
    for (var i = 0; i < 10; i++) {
        var width = Width.percent(trees.random(2, 15));
        var x = trees.random(0, Width);
        var y = trees.random(0, Height);
        var height = width / 4;
        var cloud = new _engine.engine.client.Cloud(x, y, width, height);
        var opacity = 1 - width / 300;
        cloud.color = trees.setOpacity(WHITE, opacity);
        shapes.addToStaticForeground(cloud);
    }
}

exports.level0 = level0;

},{"../engine/engine.js":17}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.scenes = undefined;

var _level = require('./level0.js');

var scenes = {
	level0: _level.level0
};

exports.scenes = scenes;

},{"./level0.js":39}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.trees = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _point = require('./engine/point.js');

var _line = require('./engine/line.js');

var _engine = require('./engine/engine.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A SMALL utilities library using Underscore-like statics.
 * @return {Object}
 */

var d = void 0;

Number.prototype.percent = function (percentage) {
    return this.valueOf() * percentage / 100;
};

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while (k-- + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
};

var trees = function () {
    function trees() {
        _classCallCheck(this, trees);
    }

    _createClass(trees, null, [{
        key: 'random',


        /**
         * Returns a random number between min and max, inclusive
         * @param  {Number} min
         * @param  {Number} max
         */
        value: function random(min, max) {
            if (max == null) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        }
    }, {
        key: 'randomColor',


        /**
         * Returns a random hex color
         * @return {String} 
         */
        value: function randomColor() {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
    }, {
        key: 'moveToEnd',
        value: function moveToEnd(arr, numElements) {
            for (var i = 0; i < numElements; i++) {
                arr.push(arr.shift());
            }
        }
    }, {
        key: 'posNeg',
        value: function posNeg() {
            if (this.random(0, 1) === 0) return -1;else return 1;
        }
    }, {
        key: 'getRGB',
        value: function getRGB(color) {
            d = document.getElementById("staticBackgroundCanvas");
            d.style.color = color;
            document.body.appendChild(d);
            return window.getComputedStyle(d).color;
        }
    }, {
        key: 'setOpacity',
        value: function setOpacity(color, opacity) {
            var rgb = this.getRGB(color).replace("rgb", "rgba");
            return [rgb.slice(0, rgb.length - 1), ", " + opacity.toString(), rgb.slice(rgb.length - 1)].join("");
        }
    }, {
        key: 'getCenterX',
        value: function getCenterX(innerWidth, outer) {
            var outerCenter = outer.x + outer.width / 2;
            var innerOffset = innerWidth / 2;
            var innerX = outerCenter - innerOffset;
            return innerX;
        }
    }, {
        key: 'getBezierDistance',
        value: function getBezierDistance(n) {
            return n / 2 * 0.552284749831;
        }
    }, {
        key: 'degToRad',
        value: function degToRad(deg) {
            return deg * (Math.PI / 180);
        }
    }, {
        key: 'getAngle',
        value: function getAngle(p1, p2) {
            return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        }
    }, {
        key: 'getDistance',
        value: function getDistance(p1, p2) {
            return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
        }
    }, {
        key: 'rotatePoint',
        value: function rotatePoint(point, origin, deg) {
            var angle = deg * Math.PI / 180.0;
            var x = Math.cos(angle) * (point.x - origin.x) - Math.sin(angle) * (point.y - origin.y) + origin.x;
            var y = Math.sin(angle) * (point.x - origin.x) + Math.cos(angle) * (point.y - origin.y) + origin.y;
            return new _point.Point(x, y);
        }
    }, {
        key: 'getPointOnLine',
        value: function getPointOnLine(firstPoint, width, angle) {
            var secondPointX = firstPoint.x + width * Math.cos(this.degToRad(angle));
            var secondPointY = firstPoint.y + width * Math.sin(this.degToRad(angle));
            return new _point.Point(secondPointX, secondPointY);
        }
    }, {
        key: 'copyPoint',
        value: function copyPoint(point) {
            return new _point.Point(point.x, point.y);
        }
    }, {
        key: 'copyLine',
        value: function copyLine(line) {
            return new _line.Line(this.copyPoint(line.start), this.copyPoint(line.end));
        }
    }, {
        key: 'resizeLine',
        value: function resizeLine(line, amount) {
            var angle = this.getAngle(line.start, line.end);
            line.start = this.getPointOnLine(line.start, amount, angle);
            line.end = this.getPointOnLine(line.end, -amount, angle);
        }
    }, {
        key: 'moveLineHorizontal',
        value: function moveLineHorizontal(line, amount) {
            line.start.x += amount;
            line.end.x += amount;
        }
    }, {
        key: 'moveLineVertical',
        value: function moveLineVertical(line, amount) {
            line.start.y += amount;
            line.end.y += amount;
        }
    }, {
        key: 'polygonArea',
        value: function polygonArea(lines) {

            var X = [];
            var Y = [];

            lines.forEach(function (line) {
                X.push(line.start.x);
                X.push(line.end.x);
                Y.push(line.start.y);
                Y.push(line.end.y);
            });

            var numPoints = X.length;

            var area = 0; // Accumulates area in the loop
            var j = numPoints - 1; // The last vertex is the 'previous' one to the first

            for (var i = 0; i < numPoints; i++) {
                area = area + (X[j] + X[i]) * (Y[j] - Y[i]);
                j = i; //j is previous vertex to i
            }
            return -area / 2;
        }
    }, {
        key: 'orientation',
        value: function orientation(line) {
            var result = null;
            if (line.start.x <= line.end.x && line.start.y <= line.end.y) {
                result = "I";
            }
            if (line.start.x <= line.end.x && line.start.y > line.end.y) {
                result = "II";
            }
            if (line.start.x > line.end.x && line.start.y > line.end.y) {
                result = "III";
            }
            if (line.start.x > line.end.x && line.start.y <= line.end.y) {
                result = "IV";
            }
            return result;
        }
    }, {
        key: 'intersection',
        value: function intersection(line1, line2) {
            // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
            var denominator,
                a,
                b,
                numerator1,
                numerator2,
                result = {
                x: null,
                y: null,
                onLine1: false,
                onLine2: false
            };
            denominator = (line2.end.y - line2.start.y) * (line1.end.x - line1.start.x) - (line2.end.x - line2.start.x) * (line1.end.y - line1.start.y);
            if (denominator == 0) {
                return result;
            }
            a = line1.start.y - line2.start.y;
            b = line1.start.x - line2.start.x;
            numerator1 = (line2.end.x - line2.start.x) * a - (line2.end.y - line2.start.y) * b;
            numerator2 = (line1.end.x - line1.start.x) * a - (line1.end.y - line1.start.y) * b;
            a = numerator1 / denominator;
            b = numerator2 / denominator;

            // if we cast these lines infinitely in both directions, they intersect here:
            result.x = line1.start.x + a * (line1.end.x - line1.start.x);
            result.y = line1.start.y + a * (line1.end.y - line1.start.y);
            /*
                    // it is worth noting that this should be the same as:
                    x = line2.start.x + (b * (line2.end.x - line2.start.x));
                    y = line2.start.x + (b * (line2.end.y - line2.start.y));
                    */
            // if line1 is a segment and line2 is infinite, they intersect if:
            if (a > 0 && a < 1) {
                result.onLine1 = true;
            }
            // if line2 is a segment and line1 is infinite, they intersect if:
            if (b > 0 && b < 1) {
                result.onLine2 = true;
            }
            // if line1 and line2 are segments, they intersect if both of the above are true
            return result;
        }
    }, {
        key: 'shadeColor',
        value: function shadeColor(color, percent) {
            var f = parseInt(color.slice(1), 16),
                t = percent < 0 ? 0 : 255,
                p = percent < 0 ? percent * -1 : percent,
                R = f >> 16,
                G = f >> 8 & 0x00FF,
                B = f & 0x0000FF;
            return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
        }
    }]);

    return trees;
}();

window.trees = trees;
exports.trees = trees;

},{"./engine/engine.js":17,"./engine/line.js":18,"./engine/point.js":24}]},{},[1]);

//# sourceMappingURL=build.js.map

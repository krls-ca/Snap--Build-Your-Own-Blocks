// SVGShape

var SVGShape;

SVGShape.prototype = new Object();
SVGShape.prototype.constructor = SVGShape;
SVGShape.uber = Object.prototype;

function SVGShape(borderWidth, borderColor) {
    this.init(borderWidth, borderColor);
}

SVGShape.prototype.init = function(borderWidth, borderColor) {
    this.borderWidth = borderWidth;
    this.borderColor = borderColor; // get from editor
}

SVGShape.prototype.toString = function () {
    return 'a ' +
        (this.constructor.name ||
            this.constructor.toString().split(' ')[1].split('(')[0])
};

// SVGRectangle

var SVGRectangle;

SVGRectangle.prototype = new SVGShape();
SVGRectangle.prototype.constructor = SVGRectangle;
SVGRectangle.uber = SVGShape.prototype;

function SVGRectangle(borderWidth, borderColor, fillColor, origin, destination) {
    SVGRectangle.uber.init.call(this, borderWidth, borderColor);
    this.init(fillColor, origin, destination);
}

SVGRectangle.prototype.init = function(fillColor, origin, destination) {
    this.origin = origin;
    this.destination = destination;
    this.fillColor = fillColor;
}

SVGRectangle.prototype.toString = function () {
   return SVGRectangle.uber.toString.call(this) + ' from: ' + this.origin.toString() + ' to: ' + this.destination.toString();
}

// SVGLine

var SVGLine;

SVGLine.prototype = new SVGShape();
SVGLine.prototype.constructor = SVGLine;
SVGLine.uber = SVGShape.prototype;

function SVGLine(borderWidth, borderColor, fillColor, origin, destination) {
    SVGLine.uber.init.call(this, borderWidth, borderColor);
    this.init(fillColor, origin, destination);
}

SVGLine.prototype.init = function(fillColor, origin, destination) {
    this.origin = origin;
    this.destination = destination;
}

SVGLine.prototype.toString = function () {
   return SVGLine.uber.toString.call(this) + ' from: ' + this.origin.toString() + ' to: ' + this.destination.toString();
}

// SVGBrush

var SVGBrush;

SVGBrush.prototype = new SVGShape();
SVGBrush.prototype.constructor = SVGBrush;
SVGBrush.uber = SVGShape.prototype;

function SVGBrush(borderWidth, borderColor, fillColor, origin, destination) {
    SVGBrush.uber.init.call(this, borderWidth, borderColor);
    this.init(fillColor, origin, destination);
}

SVGBrush.prototype.init = function(fillColor, origin, destination) {
    this.origin = origin;
}

SVGBrush.prototype.toString = function () {
	/* Brusher */
	var coordinates = "";
	coordinates += this.origin.length + this.origin.length-1;
	for (i = 0; i < this.origin.length; i += 1) {
            coordinates += "[" + this.origin[i][0].toString() + "@" + this.origin[i][1].toString() + "]";
            if (this.origin.length != (this.origin.length - 1)) coordinates += ", ";
        }
   return SVGBrush.uber.toString.call(this) + coordinates;
}

// SVGCircle

var SVGCircle;

SVGCircle.prototype = new SVGShape();
SVGCircle.prototype.constructor = SVGCircle;
SVGCircle.uber = SVGShape.prototype;

function SVGCircle(borderWidth, borderColor, fillColor, origin, destination) {
    SVGCircle.uber.init.call(this, borderWidth, borderColor);
    this.init(fillColor, origin, destination);
}

SVGCircle.prototype.init = function(fillColor, origin, destination) {
	this.fillColor = fillColor;
    this.origin = origin;
    this.destination = destination;
}

SVGCircle.prototype.toString = function () {
   return SVGCircle.uber.toString.call(this) + ' center: ' + this.origin.toString() + ' radius: ' + this.origin.distanceTo(this.destination).toString();
}

// Decorator Pattern
// =================
// Modificar comportament de funcions sense sobreescriure-les

PaintEditorMorph.prototype.originalBuildEdits = PaintEditorMorph.prototype.buildEdits;
PaintEditorMorph.prototype.buildEdits = function () {
    var myself = this;

    this.originalBuildEdits();
    this.edits.add(this.pushButton(
        "SVG",
        function () { 
            editor = new SVGPaintEditorMorph();
            editor.oncancel = this.oncancel || nop();
            editor.openIn(
                myself.world(),
                null, // ← Imatge nova!!! nou HTMLCanvasElement en blanc!!!
                new Point(240, 180),

                // Aquesta funció ha de guardar la nova imatge allà on toqui
                // Haurem de guardar-nos la referència a l'sprite d'alguna manera
                function (img, rotationCenter) { 
                    /*
                    myself.contents = img;
                    myself.rotationCenter = rc;
                    if (anIDE.currentSprite instanceof SpriteMorph) {
                        // don't shrinkwrap stage costumes
                        myself.shrinkWrap();
                    }
                    myself.version = Date.now();
                    aWorld.changed();
                    if (anIDE) {
                        anIDE.currentSprite.wearCostume(myself);
                        anIDE.hasChangedMedia = true;
                    }
                   */
                    (onsubmit || nop)();
                });
                myself.cancel();
        }
    ));
    this.edits.fixLayout();
};

// SVGPaintEditorMorph //////////////////////////

var SVGPaintEditorMorph;

SVGPaintEditorMorph.prototype = new PaintEditorMorph();
SVGPaintEditorMorph.prototype.constructor = SVGPaintEditorMorph;
SVGPaintEditorMorph.uber = PaintEditorMorph.prototype;

function SVGPaintEditorMorph() {
    this.init();
}

SVGPaintEditorMorph.prototype.init = function () {
    // additional properties:
    this.paper = null; // paint canvas
	this.ok = null;
    this.SVGObjects = []; // collection of SVGShapes
    this.currentObject = null; // object being currently painted / edited

    // initialize inherited properties:
    SVGPaintEditorMorph.uber.init.call(this);

    // override inherited properties:
    this.labelString = "SVG Paint Editor";
    this.createLabel();

    // build contents:
    this.buildContents();
};

SVGPaintEditorMorph.prototype.buildContents = function() {
    SVGPaintEditorMorph.uber.buildContents.call(this);

    var myself = this;

    this.paper.destroy();
    this.paper = new SVGPaintCanvasMorph(function () { return myself.shift });
    this.paper.setExtent(StageMorph.prototype.dimensions);
    this.body.add(this.paper);
    this.fixLayout();
    this.drawNew();
}

// SVGPaintCanvasMorph //////////////////////////

SVGPaintCanvasMorph.prototype = new PaintCanvasMorph();
SVGPaintCanvasMorph.prototype.constructor = SVGPaintCanvasMorph;
SVGPaintCanvasMorph.uber = PaintCanvasMorph.prototype;

function SVGPaintCanvasMorph(shift) {
    this.init(shift);
}

SVGPaintCanvasMorph.prototype.init = function (shift) {
	this.SVGbrushBuffer = [];
    SVGPaintCanvasMorph.uber.init.call(this, shift);   
};

SVGPaintCanvasMorph.prototype.mouseMove = function (pos) {
    if (this.currentTool === "paintbucket") {
        return;
    }

    var relpos = pos.subtract(this.bounds.origin),      // relative position
        mctx = this.mask.getContext("2d"),              // current tool temporary context
        pctx = this.paper.getContext("2d"),             // drawing context
        x = this.dragRect.origin.x, // original drag X
        y = this.dragRect.origin.y, // original drag y
        p = relpos.x,               // current drag x
        q = relpos.y,               // current drag y
        w = (p - x) / 2,            // half the rect width
        h = (q - y) / 2,            // half the rect height
        i,                          // iterator number
        width = this.paper.width,
        editor = this.parentThatIsA(SVGPaintEditorMorph);
		//alert("x: " + x + " y: " + y + " p: " + p + " q: " + q + " w: " + w + " h: " + h + " width: " + width);
    mctx.save();
    function newW() {
        return Math.max(Math.abs(w), Math.abs(w)) * (w / Math.abs(w));
    }
    function newH() {
        return Math.max(Math.abs(w), Math.abs(h)) * (h / Math.abs(h));
    }
    this.brushBuffer.push([p, q]);
    mctx.lineWidth = this.settings.linewidth;
    mctx.clearRect(0, 0, this.bounds.width(), this.bounds.height()); // mask, clear previous temporary drawing

    this.dragRect.corner = relpos.subtract(this.dragRect.origin); // reset corner

    if (this.settings.primarycolor === "transparent" &&
            this.currentTool !== "crosshairs") {
        this.merge(this.erasermask, this.mask);
        pctx.clearRect(0, 0, this.bounds.width(), this.bounds.height());
        mctx.globalCompositeOperation = "destination-out";
    } else {
        mctx.fillStyle = this.settings.primarycolor.toString();
        mctx.strokeStyle = this.settings.primarycolor.toString();
    }
    switch (this.currentTool) {
    case "rectangle":
        if (this.isShiftPressed()) {
            mctx.strokeRect(x, y, newW() * 2, newH() * 2);

            if (editor.currentObject) {
                editor.currentObject.origin = new Point(x,y);
                editor.currentObject.destination = new Point(x + newW() * 2, y + newH() * 2);
                alert("Current & shift origin" + editor.currentObject.origin + "destination" + editor.currentObject.destination);
            } else {
				alert("Else & shift origin" + new Point(x,y) + " " + new Point(x + newW() * 2, y + newH() * 2));
                editor.currentObject = new SVGRectangle(1, new Color(255,255,0), this.settings.primarycolor, new Point(x,y), new Point(x + newW() * 2, y + newH() * 2));
            }
        } else {
            mctx.strokeRect(x, y, w * 2, h * 2);

            if (editor.currentObject) {
                editor.currentObject.origin = new Point(x,y);
                editor.currentObject.destination = relpos;
                //alert("Current no shift origin" + editor.currentObject.origin + "destination" + editor.currentObject.destination);
            } else {
				//alert("Else i no shift origin" + new Point(x,y) + " " + relpos);
                editor.currentObject = new SVGRectangle(1, new Color(255,255,0), this.settings.primarycolor, new Point(x,y), relpos);
            }

        }
        break;
    case "brush":
    /* Save each point or save SVGline in a SVGBrusher */
        mctx.lineCap = "round"; // "A rounded end cap is added to each end of the line"
        mctx.lineJoin = "round";
        mctx.beginPath();
        mctx.moveTo(this.brushBuffer[0][0], this.brushBuffer[0][1]); // first Point 
        for (i = 0; i < this.brushBuffer.length; i += 1) {
            mctx.lineTo(this.brushBuffer[i][0], this.brushBuffer[i][1]);
        }
        mctx.stroke();
        if (editor.currentObject) {
			/* Is it necessary? */
			editor.currentObject.origin = this.brushBuffer;
		} else {
			editor.currentObject = new SVGBrush(1, new Color(255,255,0), this.settings.primarycolor, this.brushBuffer, null);
		}
        break;
    case "line":    
        mctx.beginPath();
        mctx.moveTo(x, y);
        if (this.isShiftPressed()) {
            if (Math.abs(h) > Math.abs(w)) {
                mctx.lineTo(x, q);
                if (editor.currentObject) {
					editor.currentObject.origin = new Point(x,y);
					editor.currentObject.destination = new Point(x, q);
					alert("Current & shift origin" + editor.currentObject.origin + "destination" + editor.currentObject.destination);
				} else {
					/* borderWidth, borderColor, fillColor, origin, destination */
					alert("Else & shift origin" + new Point(x,y) + " " + new Point(x, q));
					editor.currentObject = new SVGLine(1, new Color(255,255,0), this.settings.primarycolor, new Point(x,y), new Point(x, q));
				}
            } else {
                mctx.lineTo(p, y); // lineTo = create a line position
                if (editor.currentObject) {
					editor.currentObject.origin = new Point(x,y);
					editor.currentObject.destination = new Point(p, y);
				} else {
					/* borderWidth, borderColor, fillColor, origin, destination */
					editor.currentObject = new SVGLine(1, new Color(255,255,0), this.settings.primarycolor, new Point(x,y), new Point(p, y));
				}
            }
        } else {
            mctx.lineTo(p, q);
            if (editor.currentObject) {
                editor.currentObject.origin = new Point(x,y);
                editor.currentObject.destination = relpos; // p & q
            } else {
                editor.currentObject = new SVGLine(1, new Color(255,255,0), this.settings.primarycolor, new Point(x,y), relpos);
            }
        }
        mctx.stroke();
        
        break;
    case "circle":
        mctx.beginPath();
        if (this.isShiftPressed()) {
			/* http://www.w3schools.com/tags/canvas_arc.asp */
            mctx.arc(
                x,
                y,
                new Point(x, y).distanceTo(new Point(p, q)),
                0,
                Math.PI * 2,
                false
            );
        } else {
            for (i = 0; i < width; i += 1) {
                mctx.lineTo(
                    i,
                    (2 * h) * Math.sqrt(2 - Math.pow(
                        (i - x) / (2 * w),
                        2
                    )) + y
                );
            }
            for (i = width; i > 0; i -= 1) {
                mctx.lineTo(
                    i,
                    -1 * (2 * h) * Math.sqrt(2 - Math.pow(
                        (i - x) / (2 * w),
                        2
                    )) + y
                );
            }
        }
        editor.currentObject = new SVGCircle(1, new Color(255,255,0), this.settings.primarycolor, new Point(x,y), relpos);
        mctx.closePath();
        if (this.currentTool === "circleSolid") {
            mctx.fill();
        } else {
            if (this.currentTool === "circle") {
                mctx.stroke();
            }
        }
        break;
    case "crosshairs":
        this.rotationCenter = relpos.copy();
        this.drawcrosshair(mctx);
        break;
    case "eraser":
        this.merge(this.paper, this.mask);
        mctx.save();
        mctx.globalCompositeOperation = "destination-out";
        mctx.beginPath();
        mctx.moveTo(this.brushBuffer[0][0], this.brushBuffer[0][1]);
        for (i = 0; i < this.brushBuffer.length; i += 1) {
            mctx.lineTo(this.brushBuffer[i][0], this.brushBuffer[i][1]);
        }
        mctx.stroke();
        mctx.restore();
        this.paper = newCanvas(this.extent());
        this.merge(this.mask, this.paper);
        break;
    default:
        nop();
    }
    this.previousDragPoint = relpos;
    this.drawNew();
    this.changed();
    mctx.restore();
};

SVGPaintCanvasMorph.prototype.mouseClickLeft = function () {
    SVGPaintCanvasMorph.uber.mouseClickLeft.call(this);

    var editor = this.parentThatIsA(SVGPaintEditorMorph);

    editor.SVGObjects.push(editor.currentObject);
    this.brushBuffer = [];
    editor.currentObject = null;
}

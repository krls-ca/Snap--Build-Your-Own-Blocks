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
            editor = new SvgPaintEditorMorph();
            editor.oncancel = oncancel || nop;
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

// SvgPaintEditorMorph //////////////////////////

var SvgPaintEditorMorph;

SvgPaintEditorMorph.prototype = new PaintEditorMorph();
SvgPaintEditorMorph.prototype.constructor = SvgPaintEditorMorph;
SvgPaintEditorMorph.uber = PaintEditorMorph.prototype;

function SvgPaintEditorMorph() {
    this.init();
}

SvgPaintEditorMorph.prototype.init = function () {
    // additional properties:
    this.paper = null; // paint canvas
    this.oncancel = null;

    this.svgObjects = []; // collection of SVGShapes
    this.currentObject = null; // object being currently painted / edited

    // initialize inherited properties:
    SvgPaintEditorMorph.uber.init.call(this);

    // override inherited properties:
    this.labelString = "SVG Paint Editor";
    this.createLabel();

    // build contents:
    this.buildContents();
};

SvgPaintEditorMorph.prototype.buildContents = function() {
    SvgPaintEditorMorph.uber.buildContents.call(this);

    var myself = this;

    this.paper.destroy();
    this.paper = new SvgPaintCanvasMorph(function () { return myself.shift });
    this.paper.setExtent(StageMorph.prototype.dimensions);
    this.body.add(this.paper);
    this.fixLayout();
    this.drawNew();
}

// SvgPaintCanvasMorph //////////////////////////

SvgPaintCanvasMorph.prototype = new PaintCanvasMorph();
SvgPaintCanvasMorph.prototype.constructor = SvgPaintCanvasMorph;
SvgPaintCanvasMorph.uber = PaintCanvasMorph.prototype;

function SvgPaintCanvasMorph(shift) {
    this.init(shift);
}

SvgPaintCanvasMorph.prototype.init = function (shift) {
    SvgPaintCanvasMorph.uber.init.call(this, shift);
};

SvgPaintCanvasMorph.prototype.mouseMove = function (pos) {
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
        editor = this.parentThatIsA(SvgPaintEditorMorph);

    mctx.save();
    function newW() {
        return Math.max(Math.abs(w), Math.abs(h)) * (w / Math.abs(w));
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
            } else {
                editor.currentObject = new SVGRectangle(1, new Color(255,255,0), this.settings.primarycolor, new Point(x,y), new Point(x + newW() * 2, y + newH() * 2));
            }
        } else {
            mctx.strokeRect(x, y, w * 2, h * 2);

            if (editor.currentObject) {
                editor.currentObject.origin = new Point(x,y);
                editor.currentObject.destination = relpos;
            } else {
                editor.currentObject = new SVGRectangle(1, new Color(255,255,0), this.settings.primarycolor, new Point(x,y), relpos);
            }

        }
        break;
    case "rectangleSolid":
        if (this.isShiftPressed()) {
            mctx.fillRect(x, y, newW() * 2, newH() * 2);
        } else {
            mctx.fillRect(x, y, w * 2, h * 2);
        }
        break;
    case "brush":
        mctx.lineCap = "round";
        mctx.lineJoin = "round";
        mctx.beginPath();
        mctx.moveTo(this.brushBuffer[0][0], this.brushBuffer[0][1]);
        for (i = 0; i < this.brushBuffer.length; i += 1) {
            mctx.lineTo(this.brushBuffer[i][0], this.brushBuffer[i][1]);
        }
        mctx.stroke();
        break;
    case "line":
        mctx.beginPath();
        mctx.moveTo(x, y);
        if (this.isShiftPressed()) {
            if (Math.abs(h) > Math.abs(w)) {
                mctx.lineTo(x, q);
            } else {
                mctx.lineTo(p, y);
            }
        } else {
            mctx.lineTo(p, q);
        }
        mctx.stroke();
        break;
    case "circle":
    case "circleSolid":
        mctx.beginPath();
        if (this.isShiftPressed()) {
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

SvgPaintCanvasMorph.prototype.mouseClickLeft = function () {
    SvgPaintCanvasMorph.uber.mouseClickLeft.call(this);

    var editor = this.parentThatIsA(SvgPaintEditorMorph);

    editor.svgObjects.push(editor.currentObject); 
    editor.currentObject = null;
}

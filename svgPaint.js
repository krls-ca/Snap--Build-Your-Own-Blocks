SymbolMorph.prototype.names.push('selection');

SymbolMorph.prototype.originalSymbolCanvasColored = SymbolMorph.prototype.symbolCanvasColored;
SymbolMorph.prototype.symbolCanvasColored = function (aColor) {
    if ( this.name === 'selection' ) {
        var canvas = newCanvas(new Point(this.symbolWidth(), this.size));
        return this.drawSymbolSelection(canvas, aColor);
    }
    return this.originalSymbolCanvasColored(aColor);
}

SymbolMorph.prototype.drawSymbolSelection = function (canvas, color) {
    // answer a canvas showing a Selection
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        n = canvas.width / 6,
        n2 = n / 2,
        l = Math.max(w / 20, 0.5);

    ctx.fillStyle = color.toString();
    //ctx.lineWidth = l * 2;

    ctx.beginPath();
    ctx.moveTo(n + l, n);
    ctx.lineTo(n * 2, n);
    ctx.lineTo(n * 2.5, n * 1.5);
    ctx.lineTo(n * 3.5, n * 1.5);
    ctx.lineTo(n * 4, n);
    ctx.lineTo(n * 5 - l, n);
    ctx.lineTo(n * 4, n * 3);
    ctx.lineTo(n * 4, n * 4 - l);
    ctx.lineTo(n * 2, n * 4 - l);
    ctx.lineTo(n * 2, n * 3);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(n * 2.75, n + l);
    ctx.lineTo(n * 2.4, n);
    ctx.lineTo(n * 2.2, 0);
    ctx.lineTo(n * 3.8, 0);
    ctx.lineTo(n * 3.6, n);
    ctx.lineTo(n * 3.25, n + l);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(n * 2.5, n * 4);
    ctx.lineTo(n, n * 4);
    ctx.lineTo(n2 + l, h);
    ctx.lineTo(n * 2, h);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(n * 3.5, n * 4);
    ctx.lineTo(n * 5, n * 4);
    ctx.lineTo(w - (n2 + l), h);
    ctx.lineTo(n * 4, h);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(n, n);
    ctx.lineTo(l, n * 1.5);
    ctx.lineTo(l, n * 3.25);
    ctx.lineTo(n * 1.5, n * 3.5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(n * 5, n);
    ctx.lineTo(w - l, n * 1.5);
    ctx.lineTo(w - l, n * 3.25);
    ctx.lineTo(n * 4.5, n * 3.5);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

// Point

Point.prototype.dotproduct = function(aPoint) {
    return (this.x*aPoint.x)+(this.y*aPoint.y);
}

Point.prototype.directionVector = function(aPoint) {
    return new Point(aPoint.x-this.x,aPoint.y-this.y);
}

//http://leafletjs.com/reference.html
//http://math.stackexchange.com/questions/190111/how-to-check-if-a-point-is-inside-a-rectangle
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
}

/* hi ha d'haver el boundaries o box i que pinti l'element. 
   i el contains 
   */

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

SVGRectangle.prototype.containsPoint = function(aPoint) {
    return aPoint.x >= this.origin.x 
        && aPoint.x <= this.destination.x 
        && aPoint.y >= this.origin.y 
        && aPoint.y <= this.destination.y
}

// SVGLine

var SVGline;

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

SVGLine.prototype.containsPoint = function(aPoint) {
    var rect = new Rectangle(this.origin.x, this.origin.y, this.destination.x, this.destination.y);
    if (!rect.containsPoint(aPoint)) { return false };

    // else: http://stackoverflow.com/questions/11907947/how-to-check-if-a-point-lies-on-a-line-between-2-other-points

} 

// SVGLine.prototype.containsPoint = function(aPoint) {
//     var directionVector = this.origin.directionVector(destionation);
//     /* Perpendicular direction vector*/
//     directionVector = new Point(-directionVector.y, directionVector.x);
//     return (0 < dotproduct())


//     return (aPoint.distanceTo(this.origin) + aPoint.distanceTo(this.destination)) == this.origin.distanceTo(this.destination));
// }; 


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

SVGCircle.prototype.containsPoint = function(aPoint) {
    return aPoint.x >= this.origin.x 
        && aPoint.x <= this.destination.x 
        && aPoint.y >= this.origin.y 
        && aPoint.y <= this.destination.y
}

// SVGEllipse

var SVGEllipse;

SVGEllipse.prototype = new SVGShape();
SVGEllipse.prototype.constructor = SVGEllipse;
SVGEllipse.uber = SVGShape.prototype;

function SVGEllipse(borderWidth, borderColor, fillColor, origin, hRadius, vRadius) {
    SVGEllipse.uber.init.call(this, borderWidth, borderColor);
    this.init(fillColor, origin, hRadius, vRadius);
}

SVGEllipse.prototype.init = function(fillColor, origin, hRadius, vRadius) {
    this.fillColor = fillColor;
    this.origin = origin;
    this.hRadius = hRadius;
    this.vRadius = vRadius;
}

SVGEllipse.prototype.toString = function () {
    return SVGEllipse.uber.toString.call(this) + ' center: ' + this.origin.toString() + ' radius: (' + this.hRadius.toString() + ',' + this.vRadius.toString() + ')';
            }

            SVGEllipse.prototype.containsPoint = function(aPoint) {
                return aPoint.x >= (this.origin.x-hRadius)
        && aPoint.x <= hRadius
        && aPoint.y >= (this.origin.y-vRadius)
        && aPoint.y <= vRadius
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
                            editor.oncancel = myself.oncancel || nop();
                            editor.openIn(
                                myself.world(),
                                newCanvas(StageMorph.prototype.dimensions),
                                new Point(240, 180),
                                function (img, rc) {
                                    myself.contents = img;
                                    myself.rotationCenter = rc;
                                    if (anIDE.currentSprite instanceof SpriteMorph) {
                                        // don't shrinkwrap stage costumes
                                        myself.shrinkWrap();
                                    }
                                    myself.version = Date.now();
                                    myself.world().changed();
                                    (onsubmit || nop)();
                                }
                                );

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
    var myself = this;

    // additional properties:
    this.paper = null; // paint canvas
    this.ok = null;
    this.SVGObjects = []; // collection of SVGShapes
    this.SVGObjectsSelected = []; // collection of SVGShapes
    this.currentObject = null; // object being currently painted / edited
    this.selectionContext = null; // drawing context for selection rectangle

    // initialize inherited properties:
    SVGPaintEditorMorph.uber.init.call(this);

    /* potser hi cal this.buildToolbox(); */
    // override inherited properties:
    this.labelString = "SVG Paint Editor";
    this.createLabel();
    this.fixLayout();

    // build contents:
    //this.buildContents();
};

SVGPaintEditorMorph.prototype.buildContents = function() {

    SVGPaintEditorMorph.uber.buildContents.call(this);

    var myself = this;

    this.paper.destroy();
    this.paper = new SVGPaintCanvasMorph(myself.shift);
    this.paper.setExtent(StageMorph.prototype.dimensions);
    this.body.add(this.paper);
    this.propertiesControls = null;
    this.propertiesControls = {
        colorpicker: null,
        penSizeSlider: null,
        penSizeField: null,
        /* widthColor */
        primaryColorViewer: null,
        /* fillColor */
        secondaryColorViewer: null,
        constrain: null
    };
    this.refreshToolButtons();
    this.fixLayout();
    this.drawNew();
}

SVGPaintEditorMorph.prototype.buildToolbox = function () {
    //SVGPaintEditorMorph.uber.buildToolbox.call(this);
    //this.tools.destroy();
    this.tools = null;

    var tools = {
        selection:
            "Selection tool",
        brush:
            "Paintbrush tool\n(free draw)",
        line:
            "Line tool\n(shift: vertical/horizontal)",
        rectangle:
            "Stroked Rectangle\n(shift: square)",
        circle:
            "Stroked Ellipse\n(shift: circle)",

        eraser:
            "Eraser tool",
        crosshairs:
            "Set the rotation center",
        paintbucket:
            "Fill a region",
        pipette:
            "Pipette tool\n(pick a color anywhere)"
    },
        myself = this,
        left = this.toolbox.left(),
        top = this.toolbox.top(),
        padding = 2,
        inset = 5,
        x = 0,
        y = 0;

    Object.keys(tools).forEach(function (tool) {
        var btn = myself.toolButton(tool, tools[tool]);
        btn.setPosition(new Point(
                left + x,
                top + y
                ));
        x += btn.width() + padding;
        if (tool === "circle") { /* the tool mark the newline */
            x = 0;
            y += btn.height() + padding;
            myself.paper.drawcrosshair();
        }
        myself.toolbox[tool] = btn;
        myself.toolbox.add(btn);
    });

    this.toolbox.bounds = this.toolbox.fullBounds().expandBy(inset * 2);
    this.toolbox.drawNew();
};

SVGPaintEditorMorph.prototype.populatePropertiesMenu = function () {
    var c = this.controls,
        myself = this,
        pc = this.propertiesControls,
        alpen = new AlignmentMorph("row", this.padding);

    pc.primaryColorViewer = new Morph();
    pc.primaryColorViewer.setExtent(new Point(180, 40)); // 40 = height primary & brush size
    pc.primaryColorViewer.color = new Color(0, 0, 0);

    pc.secondaryColorViewer = new Morph();
    pc.secondaryColorViewer.setExtent(new Point(180, 20)); // 20 = height secondaryColor box
    pc.secondaryColorViewer.color = new Color(0, 0, 0);

    pc.colorpicker = new PaintColorPickerMorph(
            new Point(180, 100),
            function (color) {

                var whichColor = myself.paper.isShiftPressed()? 'secondaryColor' : 'primaryColor',
        ni = newCanvas(pc[whichColor + 'Viewer'].extent()), // ← explicar això!
        ctx = ni.getContext("2d"),
        i,
        j;

    myself.paper.settings[whichColor] = color;

    if (color === "transparent") {
        for (i = 0; i < 180; i += 5) {
            for (j = 0; j < 15; j += 5) {
                ctx.fillStyle =
        ((j + i) / 5) % 2 === 0 ?
        "rgba(0, 0, 0, 0.2)" :
        "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(i, j, 5, 5);

            }
        }
    } else {
        ctx.fillStyle = color.toString();
        ctx.fillRect(0, 0, 180, 15);
    };
    ctx.strokeStyle = "black";
    ctx.lineWidth = Math.min(myself.paper.settings.linewidth, 20);
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.moveTo(20, 30);
    ctx.lineTo(160, 30);
    ctx.stroke();
    pc[whichColor + 'Viewer'].image = ni;
    pc[whichColor + 'Viewer'].changed();
            }
    );
    pc.colorpicker.action(new Color(0, 0, 0));
    pc.penSizeSlider = new SliderMorph(0, 20, 5, 5);
    pc.penSizeSlider.orientation = "horizontal";
    pc.penSizeSlider.setHeight(15);
    pc.penSizeSlider.setWidth(150);
    pc.penSizeSlider.action = function (num) {
        if (pc.penSizeField) {
            pc.penSizeField.setContents(num);
        }
        myself.paper.settings.linewidth = num;
        pc.colorpicker.action(myself.paper.settings.primarycolor);
    };
    pc.penSizeField = new InputFieldMorph("5", true, null, false);
    pc.penSizeField.contents().minWidth = 20;
    pc.penSizeField.setWidth(25);
    pc.penSizeField.accept = function () {
        var val = parseFloat(pc.penSizeField.getValue());
        pc.penSizeSlider.value = val;
        pc.penSizeSlider.drawNew();
        pc.penSizeSlider.updateValue();
        this.setContents(val);
        myself.paper.settings.linewidth = val;
        this.world().keyboardReceiver = myself;
        pc.colorpicker.action(myself.paper.settings.primarycolor);
    };
    alpen.add(pc.penSizeSlider);
    alpen.add(pc.penSizeField);
    alpen.color = myself.color;
    alpen.fixLayout();
    pc.penSizeField.drawNew();
    pc.constrain = new ToggleMorph(
            "checkbox",
            this,
            function () {myself.shift = !myself.shift; },
            "Constrain proportions of shapes?\n(you can also hold shift)",
            function () {return myself.shift; }
            );
    c.add(pc.colorpicker);
    c.add(new TextMorph(localize("Fill color")));
    c.add(pc.secondaryColorViewer);
    c.add(new TextMorph(localize("Border color")));
    c.add(pc.primaryColorViewer);
    c.add(new TextMorph(localize("Brush size")));
    c.add(alpen);
    c.add(pc.constrain);
};
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
    /* now secondarycolor is used */
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
            this.currentObjectool !== "crosshairs") {
                this.merge(this.erasermask, this.mask);
                pctx.clearRect(0, 0, this.bounds.width(), this.bounds.height());
                mctx.globalCompositeOperation = "destination-out";
            } else {
                mctx.fillStyle = this.settings.secondarycolor.toString();
                mctx.strokeStyle = this.settings.primarycolor.toString();
            }
    switch (this.currentTool) {

        case "selection":
            if (editor.selectionContext === null ) {
                mctx.save();
                editor.selectionContext = mctx
            };
            if (!editor.SVGObjectsSelected.length) {
                mctx.setLineDash([6]);
                mctx.strokeRect(x, y, w * 2, h * 2);
            } else {
                /* Si resize cal veure com repintr
                //editor.currentObject.origin;
                //editor.currentObject.destination;
                /* S'ha d'actuar igual amb 1 o 2 */
            }
            /*    Comportament:
                  if((x,y) esta dins un object) {
                  funcionalitat moure object
                  eliminar SUPR
                  esCreaContorn
                  if((x,y) es un extrem)
                  funcionalitat resize
                  }
                  else {
                  funcio seleccionar un object 
                  }
                  */
            break;
        case "rectangle":
            if (this.isShiftPressed()) {
                mctx.strokeRect(x, y, newW() * 2, newH() * 2);

                if (editor.currentObject) {
                    editor.currentObject.origin = new Point(x,y);
                    editor.currentObject.destination = new Point(x + newW() * 2, y + newH() * 2);
                } else {
                    editor.currentObject = new SVGRectangle(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), new Point(x + newW() * 2, y + newH() * 2));
                }
            } else {
                mctx.strokeRect(x, y, w * 2, h * 2);

                if (editor.currentObject) {
                    editor.currentObject.origin = new Point(x,y);
                    editor.currentObject.destination = relpos;
                } else {
                    editor.currentObject = new SVGRectangle(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), relpos);
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

            if (editor.currentObject) {
                /* Is it necessary? */
                editor.currentObject.origin = this.brushBuffer;
            } else {
                editor.currentObject = new SVGBrush(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, this.brushBuffer, null);
            }
            mctx.stroke();
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
                    } else {
                        /* borderWidth, borderColor, fillColor, origin, destination */
                        editor.currentObject = new SVGLine(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), new Point(x, q));
                    }
                } else {
                    mctx.lineTo(p, y); // lineTo = create a line position
                    if (editor.currentObject) {
                        editor.currentObject.origin = new Point(x,y);
                        editor.currentObject.destination = new Point(p, y);
                    } else {
                        /* borderWidth, borderColor, fillColor, origin, destination */
                        editor.currentObject = new SVGLine(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), new Point(p, y));
                    }
                }
            } else {
                mctx.lineTo(p, q);
                if (editor.currentObject) {
                    editor.currentObject.origin = new Point(x,y);
                    editor.currentObject.destination = relpos; // p & q
                } else {
                    editor.currentObject = new SVGLine(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), relpos);
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
                if (editor.currentObject) {
                    editor.currentObject.origin = new Point(x,y);
                    editor.currentObject.destination = relpos;
                }
                else {
                    editor.currentObject = new SVGCircle(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), relpos);
                }
            } else {
                var xRadius, vRadius, pathCircle;
                vRadius = 0;
                for (i = 0; i < width; i += 1) {
                    pathCircle = 2 - Math.pow((i - x) / (2 * w),2);
                    mctx.lineTo(
                            i,
                            (2 * h) * Math.sqrt(pathCircle) + y
                            );
                    if (i == x) { 
                        vRadius = Math.abs((2 * h) * Math.sqrt(pathCircle));
                    }
                    if (Math.sqrt(pathCircle) > 0) {
                        xRadius = Math.abs(i-x);
                    }
                }
                console.log(((2 * h) * Math.sqrt(2)));
                console.log(xRadius + " " + vRadius);
                for (i = width; i > 0; i -= 1) {
                    mctx.lineTo(
                            i,
                            -1 * (2 * h) * Math.sqrt(2 - Math.pow(
                                    (i - x) / (2 * w),
                                    2
                                    )) + y
                            );
                }
                if (editor.currentObject) {
                    editor.currentObject.origin = new Point(x,y);
                    editor.currentObject.hRadius = xRadius;
                    editor.currentObject.vRadius = vRadius;
                }
                else {
                    editor.currentObject = new SVGEllipse(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), xRadius , vRadius);
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

SVGPaintCanvasMorph.prototype.mouseClickLeft = function () {
    SVGPaintCanvasMorph.uber.mouseClickLeft.call(this);
    var editor = this.parentThatIsA(SVGPaintEditorMorph);
    if (this.currentTool == "selection") {

        editor.selectionContext.clearRect(0, 0, editor.bounds.width(), editor.bounds.height()); // clear dashed rectangle

        if(!editor.SVGObjectsSelected.length) {
            /*  for (i = 0; i < editor.SVGObjects.length; ++i) {
                if(editor.SVGObjects[i].containsPoint(this.previousDragPoint)
                && ) {
                alert("He trobat");
                editor.SVGObjectsSelected.push(i); // It's saved id object
                }*/
        } else { 
            nop();
            //editor.SVGObjects[i].origin = ;
            //editor.SVGObjects[i].destination = ;
            /* Save new coords object. WARNING: Circle could become Ellipse */
        }
        for (i = 0; i < editor.SVGObjects.length; ++i) {
            console.log(this);
            console.log(editor.SVGObjects[i]);
            if(editor.SVGObjects[i].containsPoint(this.previousDragPoint)) {
                alert("He trobat");
                editor.SVGObjectsSelected.push(editor.SVGObjects[i]);
            }
        }
        } else {
            if(!editor.SVGObjects.length) {
                function deselect() {
                    /* erase selection*/
                    editor.SVGObjectsSelected = [];
                }       
                editor.SVGObjects.push(editor.currentObject);
            }

        }
        editor.currentObject = null;
        this.brushBuffer = [];
    }

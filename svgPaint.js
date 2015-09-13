/* New funtionalities in SVG editor */
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
    // answer a canvas showing a filled arrow and a dashed rectangle
    var ctx = canvas.getContext('2d'),
        w = canvas.width;
        h = canvas.height;
    ctx.save();
    ctx.setLineDash([3]);
    this.drawSymbolRectangle(canvas, color);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = color.toString();
    ctx.translate(0.7*w, 0.4*h);
    ctx.scale(0.5,0.5);
    ctx.rotate(radians(135));
    this.drawSymbolArrowDownOutline(canvas, color);
    ctx.fill();
    ctx.restore();
    return canvas;
};

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
    this.threshold = 10;
    this.image = newCanvas();
    //this.boundingBox = null;
}

SVGShape.prototype.toString = function () {
    return 'a ' +
        (this.constructor.name ||
         this.constructor.toString().split(' ')[1].split('(')[0])
}

SVGShape.prototype.drawBoundingBox = function(context, origin, destination) {
    if(!origin || !destination) {
        origin = this.origin;
        destination = this.destination;
    }
    //this.boundingBox = newCanvas();
    //context = this.boundingBox.getContext("2d");
    var widthAux = context.lineWidth;
    var bounds = {left: Math.min(origin.x, destination.x),
                  top: Math.min(origin.y, destination.y),
                  right: Math.max(origin.x, destination.x), 
                  bottom: Math.max(origin.y, destination.y)
                  };
    /* Drawing corners */

    context.lineWidth = 1;
    context.strokeStyle = "grey";
    context.setLineDash([6]);
    context.beginPath();
    context.strokeRect(bounds.left-widthAux*2, bounds.top-widthAux*2, Math.abs(bounds.left-bounds.right)+widthAux*4, Math.abs(bounds.top-bounds.bottom)+widthAux*4);

    /* Drawing corners */

    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.setLineDash([]);

    /* upper-left corner */
    context.beginPath();
    context.arc(origin.x,origin.y,4,0,2*Math.PI);
    context.closePath();
    context.stroke();
    context.fill();
    /* upper-right corner */
    context.beginPath();
    context.arc(destination.x,origin.y,4,0,2*Math.PI);
    context.closePath();
    context.stroke();
    context.fill();

    /* bottom-left corner */
    context.beginPath();
    context.arc(origin.x,destination.y,4,0,2*Math.PI);
    context.closePath();
    context.stroke();
    context.fill();

    /* bottom-right corner */
    context.beginPath();
    context.arc(destination.x,destination.y,4,0,2*Math.PI);
    context.closePath();
    context.stroke();
    context.fill();

    context.lineWidth = widthAux;
}

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
    var rect = new Rectangle(
        Math.min(this.origin.x, this.destination.x)-this.threshold,
        Math.min(this.origin.y, this.destination.y)-this.threshold,
        Math.max(this.origin.x, this.destination.x)+this.threshold,
        Math.max(this.origin.y, this.destination.y)+this.threshold);
    if (!rect.containsPoint(aPoint)) { return false };
    return true;
}

SVGRectangle.prototype.isFound = function(selectionBox) {   
    if ((selectionBox.origin.x === selectionBox.destination.x 
        && selectionBox.origin.y === selectionBox.destination.y 
        && this.containsPoint(selectionBox.origin) 
        && this.containsPoint(selectionBox.destination)) 
        || (selectionBox.containsPoint(this.origin) 
        && selectionBox.containsPoint(this.destination))) return true;
    return false;
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
    var rect = new Rectangle(
        Math.min(this.origin.x, this.destination.x)-this.threshold,
        Math.min(this.origin.y, this.destination.y)-this.threshold,
        Math.max(this.origin.x, this.destination.x)+this.threshold,
        Math.max(this.origin.y, this.destination.y)+this.threshold);
    if (!rect.containsPoint(aPoint)) { return false };
    var cross = (aPoint.x - this.origin.x) * (this.destination.y - this.origin.y) - (aPoint.y - this.origin.y) * (this.destination.x - this.origin.x);
    if (Math.abs(cross) > 1000) {return false};
    return true;
}

SVGLine.prototype.isFound = function(selectionBox) {
    if ((selectionBox.origin.x === selectionBox.destination.x 
        && selectionBox.origin.y === selectionBox.destination.y
        && this.containsPoint(selectionBox.origin) 
        && this.containsPoint(selectionBox.destination)) 
        || (selectionBox.containsPoint(this.origin) 
        && selectionBox.containsPoint(this.destination))) return true;
    return false;
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
    for (i = 0; i < this.origin.length; ++i) {
        coordinates += "[" + this.origin[i][0].toString() + "@" + this.origin[i][1].toString() + "]";
        if (this.origin.length != (this.origin.length - 1)) coordinates += ", ";
    }
    return SVGBrush.uber.toString.call(this) + coordinates;
}

SVGBrush.prototype.containsPoint = function(aPoint) {
    for (i = 0; i < this.origin.length - 1; ++i) {
              var line = new SVGLine(null, null, null, new Point(this.origin[i][0], this.origin[i][1]), new Point(this.origin[i][0], this.origin[i][1]));
              if (line.containsPoint(aPoint)) return true;
    }
    return false;
}

SVGBrush.prototype.isFound = function(selectionBox) {
    var bounds = this.getBounds();
    if ((selectionBox.origin.x === selectionBox.destination.x 
        && selectionBox.origin.y === selectionBox.destination.y
        && this.containsPoint(selectionBox.origin) 
        && this.containsPoint(selectionBox.destination)) 
        || (selectionBox.containsPoint(new Point(bounds.left, bounds.top)) 
        && selectionBox.containsPoint(new Point(bounds.right, bounds.bottom)))) return true;
    return false;
}

SVGBrush.prototype.getBounds = function() {
    var leftTop = this.origin.reduce(function(previous, current) {
        var left, top;
        left = (previous[0] > current[0] ? current[0] : previous[0]);
        top = (previous[1] > current[1] ? current[1] : previous[1]);
        return [left , top]}
        );
    var rightBottom = this.origin.reduce(function(previous, current) {
        var right, bottom;
        right = (previous[0] < current[0] ? current[0] : previous[0]);
        bottom = (previous[1] < current[1] ? current[1] : previous[1]);
        return [right , bottom]}
        );
    return { left: leftTop[0], right: rightBottom[0], top: leftTop[1], bottom: rightBottom[1] };
}

SVGBrush.prototype.drawBoundingBox = function(context) {
    var bounds = this.getBounds();
    SVGBrush.uber.drawBoundingBox.call(this, context, new Point(bounds.left, bounds.top), new Point(bounds.right, bounds.bottom));
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
    return (Math.pow(aPoint.x-this.origin.x,2)/Math.pow(this.hRadius+this.threshold,2) + Math.pow(aPoint.y-this.origin.y,2)/Math.pow(this.vRadius+this.threshold,2)) < 1 ? true: false;
}

SVGEllipse.prototype.isFound = function(selectionBox) {
    if ((selectionBox.origin.x === selectionBox.destination.x 
        && selectionBox.origin.y === selectionBox.destination.y
        && this.containsPoint(selectionBox.origin) 
        && this.containsPoint(selectionBox.destination)) 
        || (selectionBox.containsPoint(new Point(this.origin.x+this.hRadius, this.origin.y)) 
        && selectionBox.containsPoint(new Point(this.origin.x-this.hRadius, this.origin.y)) 
        && selectionBox.containsPoint(new Point(this.origin.x, this.origin.y+this.vRadius))
        && selectionBox.containsPoint(new Point(this.origin.x, this.origin.y-this.vRadius)))) return true;
    return false;
}

SVGEllipse.prototype.drawBoundingBox = function(context) {
    SVGEllipse.uber.drawBoundingBox.call(this, context, new Point(this.origin.x-this.hRadius, this.origin.y-this.vRadius), new Point(this.origin.x+this.hRadius, this.origin.y+this.vRadius));
}

// Decorator Pattern
// =================
// Modificar comportament de funcions sense sobreescriure-les

// CostumeEditorMorph inherits from Morph:

/* Costume.prototype.originalCostume = Costume.prototype.Costume;
Costume.prototype.Costume = function (canvas, name, rotationCenter) {
    console.log("HOLA");
    this.originalCostume();
    this.isVectorial = false;
}*/

PaintEditorMorph.prototype.originalBuildEdits = PaintEditorMorph.prototype.buildEdits;
PaintEditorMorph.prototype.buildEdits = function () {
    var myself = this;

    this.originalBuildEdits();
    this.edits.add(this.pushButton(
            "SVG",
            function () { 
                editor = new SVGPaintEditorMorph();
                editor.oncancel = myself.oncancel || nop();
                editor.isVectorial = true;
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
                //myself.cancel();
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
    this.SVGObjects = []; // collection of SVGShapes
    this.SVGObjectsSelected = []; // collection of SVGShapes
    this.currentObject = null; // object being currently painted / edited
    //this.selectionContext = null; // drawing context for selection box

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

SVGPaintEditorMorph.prototype.buildEdits = function () {
    var myself = this;
    this.originalBuildEdits();
    this.edits.add(this.pushButton(
            "Bitmap",
            function () {
                /*
                editor = new PaintEditorMorph();
                editor.oncancel = myself.oncancel || nop();
                editor.isVectorial = true;
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
                myself.cancel();*/
            }
    ));
    this.edits.fixLayout();
}

SVGPaintEditorMorph.prototype.openIn = function (world, oldim, oldrc, callback) {

    SVGPaintEditorMorph.uber.openIn.call(this, world, oldim, oldrc, callback);

    this.processKeyDown = function () {
        var mctx = this.paper.mask.getContext("2d");
        /* Shift key */
        this.shift = this.world().currentKey === 16;
        switch (this.world().currentKey) {
            /* Del key */
            case 46:
                for(z = 0; z < this.SVGObjectsSelected.length; ++z) {
                    var index = this.SVGObjects.indexOf(this.SVGObjectsSelected[z]);
                    this.SVGObjects.splice(index,1);
                }
                this.drawNew();
                this.SVGObjectsSelected = [];
            break;
            /* Page Up key */
            case 33:
                console.log("Entro");
                var lastIndexChanged = this.SVGObjects.length;
                for(z = this.SVGObjectsSelected.length-1; z >= 0; --z) {
                    var index = this.SVGObjects.indexOf(this.SVGObjectsSelected[z]);
                    mctx.save();
                    this.SVGObjects[index].drawBoundingBox(mctx);
                    this.paper.changed();
                    mctx.restore();
                    if (index === this.SVGObjects.length-1) lastIndexChanged = index;
                    else if(lastIndexChanged-index > 1) {
                        var t = this.SVGObjects[index];
                        this.SVGObjects[index] = this.SVGObjects[index+1];
                        this.SVGObjects[index+1] = t;
                        lastIndexChanged = index;
                    }
                }
                this.paper.drawNew();           
            break;
            /* Page Down key */
            case 34:
                var lastIndexChanged = -1;
                for(z = 0; z < this.SVGObjectsSelected.length; ++z) {
                    var index = this.SVGObjects.indexOf(this.SVGObjectsSelected[z]);
                    mctx.save();
                    this.SVGObjects[index].drawBoundingBox(mctx);
                    this.paper.changed();
                    mctx.restore();
                    if (index === 0) lastIndexChanged = index;
                    else if(index-lastIndexChanged > 1) {
                        var t = this.SVGObjects[index];
                        this.SVGObjects[index] = this.SVGObjects[index-1];
                        this.SVGObjects[index-1] = t;
                        lastIndexChanged = index;
                    }                    
                }
                this.paper.drawNew();
            break;
            /* Home key */
            case 36:
                for(z = this.SVGObjectsSelected.length-1; z >= 0; --z) {
                    var index = this.SVGObjects.indexOf(this.SVGObjectsSelected[z]);

                    mctx.save();
                    this.SVGObjects[index].drawBoundingBox(mctx);
                    this.paper.changed();
                    mctx.restore(); 

                    this.SVGObjects.splice(index,1);
                    this.SVGObjects.push(this.SVGObjectsSelected[z]);
   
                }
                this.paper.drawNew();
            break;
            /* End key */
            case 35:
                //for(z = this.SVGObjectsSelected.length-1; z >= 0; --z) {
                for(z = 0; z < this.SVGObjectsSelected.length; ++z) {    
                    var index = this.SVGObjects.indexOf(this.SVGObjectsSelected[z]);

                    mctx.save();
                    this.SVGObjects[index].drawBoundingBox(mctx);
                    this.paper.changed();
                    mctx.restore();
                    
                    this.SVGObjects.splice(index,1);
                    this.SVGObjects.unshift(this.SVGObjectsSelected[z]);
                }
                this.paper.drawNew();
            break;
            default:
                nop();

        }
        this.propertiesControls.constrain.refresh();
    };
}

SVGPaintEditorMorph.prototype.buildContents = function() {

    SVGPaintEditorMorph.uber.buildContents.call(this);

    var myself = this;

    this.paper.destroy();
    this.paper = new SVGPaintCanvasMorph(myself.shift);
    this.paper.setExtent(StageMorph.prototype.dimensions);
    this.body.add(this.paper);

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
        alignColor = new AlignmentMorph("row", this.padding);

    pc.primaryColorViewer = new Morph();
    pc.primaryColorViewer.setExtent(new Point(85, 15)); // 40 = height primary & brush size
    pc.primaryColorViewer.color = new Color(0, 0, 0);
    pc.secondaryColorViewer = new Morph();
    pc.secondaryColorViewer.setExtent(new Point(85, 15)); // 20 = height secondaryColor box
    pc.secondaryColorViewer.color = new Color(0, 0, 0);

    pc.colorpicker = new PaintColorPickerMorph(
        new Point(180, 100),
        function (color, whichColor) {
            whichColor = whichColor || myself.paper.isShiftPressed()? 'secondaryColor' : 'primaryColor';
            var ni = newCanvas(pc[whichColor + 'Viewer'].extent()), // equals secondaryColorViewer or primaryColorViewer
            ctx = ni.getContext("2d"),
            i,
            j;
            myself.paper.settings[whichColor.toLowerCase()] = color;
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
            //Brush size
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
    pc.colorpicker.action("transparent", 'secondaryColor'); // inizialize secondarycolor pc
    
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

    alignColor.add(pc.primaryColorViewer);
    alignColor.add(pc.secondaryColorViewer);
    alignColor.fixLayout();

    c.add(pc.colorpicker);
    c.add(new TextMorph(localize("Border color         Fill color")));
    c.add(alignColor);
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
    SVGPaintCanvasMorph.uber.init.call(this, shift);
    this.SVGbrushBuffer = [];
    this.currentTool = "selection";
    this.settings = {
        "primarycolor": new Color(0, 0, 0, 255), // stroke color
        "secondarycolor": "transparent", // fill color
        "linewidth": 3 // stroke width
    };
};

SVGPaintCanvasMorph.prototype.drawNew = function() {
    var editor = this.parentThatIsA(SVGPaintEditorMorph),
        myself = this,
        can = newCanvas(this.extent());
    this.merge(this.background, can);
    editor.SVGObjects.forEach(function(each) {
        myself.merge(each.image, can)
        //myself.merge(each.boundingBox, can)
    });
    this.merge(this.paper, can);
    this.merge(this.mask, can);
    this.image = can;
    this.drawFrame();
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

/*    if (this.settings.primarycolor === "transparent" &&
            this.currentTool !== "crosshairs") {
        this.merge(this.erasermask, this.mask);
        pctx.clearRect(0, 0, this.bounds.width(), this.bounds.height());
        mctx.globalCompositeOperation = "destination-out";
    } else {
        mctx.fillStyle = this.settings.primarycolor.toString();
        mctx.strokeStyle = this.settings.primarycolor.toString();
    }*/
    
    mctx.fillStyle = this.settings.secondarycolor.toString();
    mctx.strokeStyle = this.settings.primarycolor.toString();

    /*if(this.currentTool !== "selection" && editor.SVGObjectsSelected.length) {
        editor.SVGObjectsSelected = [];
        // deselect
    }*/
    switch (this.currentTool) {

        case "selection":
            // if (editor.selectionContext === null ) {
            //     editor.selectionContext = mctx;
            // };
            if (!editor.SVGObjectsSelected.length) {
                var auxColor = mctx.strokeStyle;
                mctx.strokeStyle = "black";
                mctx.lineWidth = 1;
                mctx.setLineDash([6]);
                mctx.strokeRect(x, y, w * 2, h * 2);
                mctx.strokeStyle = auxColor;
            } else {
                nop();
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
                if(this.settings.secondarycolor !== "transparent") mctx.fillRect(x, y, newW() * 2, newH() * 2);
                if(this.settings.primarycolor !== "transparent") mctx.strokeRect(x, y, newW() * 2, newH() * 2);
                if (editor.currentObject) {
                    editor.currentObject.origin = new Point(x,y);
                    editor.currentObject.destination = new Point(x + newW() * 2, y + newH() * 2);
                } else {
                    editor.currentObject = new SVGRectangle(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), new Point(x + newW() * 2, y + newH() * 2));
                }
            } else {
                if(this.settings.secondarycolor !== "transparent") mctx.fillRect(x, y, w * 2, h * 2);
                if(this.settings.primarycolor !== "transparent") mctx.strokeRect(x, y, w * 2, h * 2);
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
            for (i = 0; i < this.brushBuffer.length; ++i) {
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
                var hRadius = new Point(x, y).distanceTo(new Point(p, q)),
                    vRadius = hRadius;
                if (editor.currentObject) {
                    editor.currentObject.origin = new Point(x,y);
                    editor.currentObject.hRadius = hRadius;
                    editor.currentObject.vRadius = vRadius;
                }
                else {
                    editor.currentObject = new SVGEllipse(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), hRadius, vRadius);
                }
            } else {
                var hRadius, vRadius, pathCircle;
                vRadius = 0;
                for (i = 0; i < width; ++i) {
                    pathCircle = 2 - Math.pow((i - x) / (2 * w),2);
                    mctx.lineTo(
                            i,
                            (2 * h) * Math.sqrt(pathCircle) + y
                            );
                    if (i == x) { 
                        vRadius = Math.abs((2 * h) * Math.sqrt(pathCircle));
                    }
                    if (Math.sqrt(pathCircle) > 0) {
                        hRadius = Math.abs(i-x);
                    }
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
                if (editor.currentObject) {
                    editor.currentObject.origin = new Point(x,y);
                    editor.currentObject.hRadius = hRadius;
                    editor.currentObject.vRadius = vRadius;
                }
                else {
                    editor.currentObject = new SVGEllipse(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), hRadius , vRadius);
                }
            }
            mctx.closePath();
            mctx.stroke();
            mctx.fill();
            break;
        case "crosshairs":
            this.rotationCenter = relpos.copy();
            this.drawcrosshair(mctx);
            break;
/*        case "eraser":
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
            break;*/
        default:
            nop();
    }
    this.previousDragPoint = relpos;
    this.drawNew();
    this.changed();
    mctx.restore();
};

SVGPaintCanvasMorph.prototype.mouseClickLeft = function () {
    console.log(this.currentTool);
    var editor = this.parentThatIsA(SVGPaintEditorMorph);
    var mctx = this.mask.getContext("2d");
    function deselect() {
                /* erase selection*/
        editor.SVGObjectsSelected = [];
    }
    deselect();
    if (this.currentTool === "selection") {
        mctx.save();
        mctx.clearRect(0, 0, editor.bounds.width(), editor.bounds.height()); // clear dashed rectangle
        this.drawNew();
        this.changed();
        mctx.restore();
        console.log(editor.SVGObjects.length);
        var selectionBounds = new SVGRectangle(null, null, null, this.dragRect.origin, this.previousDragPoint);
        for (j = editor.SVGObjects.length-1; j >= 0; --j) {
            if(editor.SVGObjects[j].isFound(selectionBounds)) {
                console.log("Found it");
                mctx.save();
                editor.SVGObjects[j].drawBoundingBox(mctx);
                this.drawNew();
                this.changed();
                mctx.restore();
                editor.SVGObjectsSelected.push(editor.SVGObjects[j]);
                if(selectionBounds.origin.x === selectionBounds.destination.x 
                    && selectionBounds.origin.y === selectionBounds.destination.y) {
                    break;
                    }
            }
        }
    }
    if (this.currentTool !== "crosshairs" && this.currentTool !== "selection") {
        editor.SVGObjects.push(editor.currentObject);
        editor.currentObject.image.width = this.mask.width;
        editor.currentObject.image.height = this.mask.height;
        editor.currentObject.image.getContext('2d').drawImage(this.mask, 0, 0);
        editor.currentObject = null;
    }
    this.brushBuffer = [];
}
/* New functionalities in Vector editor */
SymbolMorph.prototype.names.push('selection');
SymbolMorph.prototype.names.push('polygon');
SymbolMorph.prototype.names.push('closedBrushPath');

SymbolMorph.prototype.originalSymbolCanvasColored = SymbolMorph.prototype.symbolCanvasColored;
SymbolMorph.prototype.symbolCanvasColored = function (aColor) {
    if ( this.name === 'selection' ) {
        var canvas = newCanvas(new Point(this.symbolWidth(), this.size));
        return this.drawSymbolSelection(canvas, aColor);
    }
    if ( this.name === 'polygon' ) {
        var canvas = newCanvas(new Point(this.symbolWidth(), this.size));
        return this.drawSymbolPolygon(canvas, aColor);
    }
    if ( this.name === 'closedBrushPath' ) {
        var canvas = newCanvas(new Point(this.symbolWidth(), this.size));
        return this.drawSymbolClosedBrushPath(canvas, aColor);
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

SymbolMorph.prototype.drawSymbolPolygon = function (canvas, color) {
    /* temporary icon */
    var ctx = canvas.getContext('2d');
    ctx.save();
    this.drawSymbolOctagon(canvas, color);
    ctx.restore();
    return canvas;
};

SymbolMorph.prototype.drawSymbolClosedBrushPath = function (canvas, color) {
    /* temporary icon */
    var ctx = canvas.getContext('2d');
    ctx.save();
    this.drawSymbolCloudOutline(canvas, color);
    ctx.restore();
    return canvas;
};

// VectorShape

var VectorShape;

VectorShape.prototype = new Object();
VectorShape.prototype.constructor = VectorShape;
VectorShape.uber = Object.prototype;

function VectorShape(borderWidth, borderColor, threshold) {
    this.init(borderWidth, borderColor, threshold);
}

VectorShape.prototype.init = function(borderWidth, borderColor, threshold) {
    this.borderWidth = borderWidth;
    this.borderColor = borderColor; // get from editor
    this.threshold = threshold === undefined ? 10: threshold;
    this.image = newCanvas();
}

VectorShape.prototype.toString = function () {
    return 'a ' +
        (this.constructor.name ||
         this.constructor.toString().split(' ')[1].split('(')[0])
}

VectorShape.prototype.copy = function (newshape) {
    var shape = newshape || new VectorShape(this.borderWidth, this.borderColor);
    var newcanvas = newCanvas();
    var context = newCanvas.getContext('2d');
    newCanvas.width = this.image.width;
    newCanvas.height = this.image.height;
    shape.threshold = this.threshold;
    shape.image = context.drawImage(this.image,0,0);
    console.log(shape.image);
    return shape;
}

VectorShape.prototype.drawBoundingBox = function(context, origin, destination) {
    if(!origin || !destination) {
        origin = this.origin;
        destination = this.destination;
    }
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

VectorShape.prototype.isEndPointInBoundingBox = function(leftTop, leftBottom, rightTop, rightBottom, aPoint) {
    var threshold = 0, radius = 4; 
    var circle = new VectorEllipse(null, null, null, leftTop, null, radius, radius, threshold);
    //console.log(aPoint);
    //console.log(circle);
    //console.log(circle.containsPoint(aPoint)); 
    if(circle.containsPoint(aPoint)) return 'leftTop';
    circle = new VectorEllipse(null, null, null, leftBottom, null, radius, radius, threshold);
    if(circle.containsPoint(aPoint)) return 'leftBottom';
    circle = new VectorEllipse(null, null, null, rightTop, null, radius, radius, threshold);
    if(circle.containsPoint(aPoint)) return 'rightTop';
    circle = new VectorEllipse(null, null, null, rightBottom, null, radius, radius, threshold);
    if(circle.containsPoint(aPoint)) return 'rightBottom';
    return false;
}
// VectorRectangle

var VectorRectangle;

VectorRectangle.prototype = new VectorShape();
VectorRectangle.prototype.constructor = VectorRectangle;
VectorRectangle.uber = VectorShape.prototype;

function VectorRectangle(borderWidth, borderColor, fillColor, origin, destination, threshold) {
    VectorRectangle.uber.init.call(this, borderWidth, borderColor, threshold);
    this.init(fillColor, origin, destination);
}

VectorRectangle.prototype.init = function(fillColor, origin, destination) {
    this.origin = origin;
    this.destination = destination;
    this.fillColor = fillColor;
}

VectorRectangle.prototype.copy = function () {
    var newRectangle = new VectorRectangle(
        this.borderWidth, 
        this.borderColor, 
        this.fillColor, 
        this.origin, 
        this.destination
    );
    return VectorRectangle.uber.init.call(this, newRectangle);
}

VectorRectangle.prototype.toString = function () {
    return VectorRectangle.uber.toString.call(this) + ' from: ' + this.origin.toString() + ' to: ' + this.destination.toString();
}

VectorRectangle.prototype.containsPoint = function(aPoint) {
    var rect = new Rectangle(
        Math.min(this.origin.x, this.destination.x)-this.threshold,
        Math.min(this.origin.y, this.destination.y)-this.threshold,
        Math.max(this.origin.x, this.destination.x)+this.threshold,
        Math.max(this.origin.y, this.destination.y)+this.threshold);
    if (!rect.containsPoint(aPoint)) { return false };
    return true;
}

/*VectorRectangle.prototype.isClicked = function(aPoint, bPoint) {
    if (aPoint.x === bPoint.x && aPoint.y === bPoint.y
        && this.containsPoint(aPoint)) return true;
    return false; 
}*/

VectorRectangle.prototype.isFound = function(selectionBox) {   
    if ((selectionBox.origin.x === selectionBox.destination.x 
        && selectionBox.origin.y === selectionBox.destination.y 
        && this.containsPoint(selectionBox.origin)) 
        || (selectionBox.containsPoint(this.origin) 
        && selectionBox.containsPoint(this.destination))) return true;
    return false;
}

VectorRectangle.prototype.getBounds = function() {
    return {left: Math.min(this.origin.x, this.destination.x),
                  top: Math.min(this.origin.y, this.destination.y),
                  right: Math.max(this.origin.x, this.destination.x), 
                  bottom: Math.max(this.origin.y, this.destination.y)
                 };
}

VectorRectangle.prototype.isInBoundingBox = function(aPoint) {
    var bounds = this.getBounds();
    var result = this.isEndPointInBoundingBox(new Point(bounds.left, bounds.top),
            new Point(bounds.left, bounds.bottom),
            new Point(bounds.right, bounds.top),
            new Point(bounds.right, bounds.bottom),
            aPoint);
    if(!result) return this.containsPoint(aPoint);
    return result;
}

VectorRectangle.prototype.exportAsSVG = function() {
    var borderColor, fillColor, height = Math.abs(this.origin.y-this.destination.y), 
        width = Math.abs(this.origin.x-this.destination.x),
        x = Math.min(this.origin.x, this.destination.x),
        y = Math.min(this.origin.y, this.destination.y);
    borderColor = this.borderColor != 'transparent'? '" stroke="' + this.borderColor + '"': '" stroke=none"';
    fillColor = this.fillColor != 'transparent'? ' fill="' + this.fillColor + '"': '" fill=none"';
    return '<rect height="' + height + '" width="' + width + '" y="' + y
        + '" x="' + x + '" stroke-width="' + this.borderWidth + borderColor 
        + fillColor + '/>';
}

// VectorLine

var VectorLine;

VectorLine.prototype = new VectorShape();
VectorLine.prototype.constructor = VectorLine;
VectorLine.uber = VectorShape.prototype;

function VectorLine(borderWidth, borderColor, fillColor, origin, destination, threshold) {
    VectorLine.uber.init.call(this, borderWidth, borderColor, threshold);
    this.init(fillColor, origin, destination);
}

VectorLine.prototype.init = function(fillColor, origin, destination) {
    this.origin = origin;
    this.destination = destination;
}

VectorLine.prototype.copy = function () {
    var newLine = new VectorLine(
        this.borderWidth, 
        this.borderColor, 
        this.fillColor, 
        this.origin, 
        this.destination
    );
    return VectorLine.uber.init.call(this, newLine);
}

VectorLine.prototype.toString = function () {
    return VectorLine.uber.toString.call(this) + ' from: ' + this.origin.toString() + ' to: ' + this.destination.toString();
}

VectorLine.prototype.containsPoint = function(aPoint) {
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

VectorLine.prototype.isFound = function(selectionBox) {
    if ((selectionBox.origin.x === selectionBox.destination.x 
        && selectionBox.origin.y === selectionBox.destination.y
        && this.containsPoint(selectionBox.origin)) 
        || (selectionBox.containsPoint(this.origin) 
        && selectionBox.containsPoint(this.destination))) return true;
    return false;
}

VectorLine.prototype.getBounds = function() {
    return {left: Math.min(this.origin.x, this.destination.x),
                  top: Math.min(this.origin.y, this.destination.y),
                  right: Math.max(this.origin.x, this.destination.x), 
                  bottom: Math.max(this.origin.y, this.destination.y)
                 };
}

VectorLine.prototype.isInBoundingBox = function(aPoint) {
    var bounds = this.getBounds();
    var result = this.isEndPointInBoundingBox(new Point(bounds.left, bounds.top),
            new Point(bounds.left, bounds.bottom),
            new Point(bounds.right, bounds.top),
            new Point(bounds.right, bounds.bottom),
            aPoint);
    if(!result) return this.containsPoint(aPoint);
    return result;
}

VectorLine.prototype.exportAsSVG = function() {
    var borderColor = this.borderColor != 'transparent'? '" stroke="' + this.borderColor + '"': '" stroke=none"';
    return '<line x1="' + this.origin.x + '" y1="' + this.origin.y + '" x2="' + this.destination.x
        + '" y2="' + this.destination.y + '" stroke-width="' + this.borderWidth + borderColor + '/>';
}

// VectorBrush

var VectorBrush;

VectorBrush.prototype = new VectorShape();
VectorBrush.prototype.constructor = VectorBrush;
VectorBrush.uber = VectorShape.prototype;

function VectorBrush(borderWidth, borderColor, fillColor, origin, destination, threshold) {
    VectorBrush.uber.init.call(this, borderWidth, borderColor, threshold);
    this.init(fillColor, origin, destination);
}

VectorBrush.prototype.init = function(fillColor, origin, destination) {
    this.origin = origin.slice();
}

VectorBrush.prototype.copy = function () {
    var newBrush = new VectorBrush(
        this.borderWidth, 
        this.borderColor, 
        this.fillColor, 
        this.origin, 
        this.destination
    );
    return VectorBrush.uber.init.call(this, newBrush);
}

VectorBrush.prototype.toString = function () {
    /* Brusher */
    var coordinates = "";
    coordinates += this.origin.length + this.origin.length-1;
    for (i = 0; i < this.origin.length; ++i) {
        coordinates += "[" + this.origin[i][0].toString() + "@" + this.origin[i][1].toString() + "]";
        if (this.origin.length != (this.origin.length - 1)) coordinates += ", ";
    }
    return VectorBrush.uber.toString.call(this) + coordinates;
}

VectorBrush.prototype.containsPoint = function(aPoint) {
    for (i = 0; i < this.origin.length - 1; ++i) {
              var line = new VectorLine(null, null, null, new Point(this.origin[i][0], this.origin[i][1]), new Point(this.origin[i][0], this.origin[i][1]));
              if (line.containsPoint(aPoint)) return true;
    }
    return false;
}

VectorBrush.prototype.isFound = function(selectionBox) {
    var bounds = this.getBounds();
    if ((selectionBox.origin.x === selectionBox.destination.x 
        && selectionBox.origin.y === selectionBox.destination.y
        && this.containsPoint(selectionBox.origin))
        || (selectionBox.containsPoint(new Point(bounds.left, bounds.top)) 
        && selectionBox.containsPoint(new Point(bounds.right, bounds.bottom)))) return true;
    return false;
}

VectorBrush.prototype.getBounds = function() {
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

VectorBrush.prototype.isInBoundingBox = function(aPoint) {
    var bounds = this.getBounds();
    var result = this.isEndPointInBoundingBox(new Point(bounds.left, bounds.top),
            new Point(bounds.left, bounds.bottom),
            new Point(bounds.right, bounds.top),
            new Point(bounds.right, bounds.bottom),
            aPoint);
    if(!result) return this.containsPoint(aPoint);
    return result;
}

VectorBrush.prototype.drawBoundingBox = function(context) {
    var bounds = this.getBounds();
    VectorBrush.uber.drawBoundingBox.call(this, context, new Point(bounds.left, bounds.top), new Point(bounds.right, bounds.bottom));
}

VectorBrush.prototype.exportAsSVG = function() {
    var path = "M " + this.origin[0][0] + " " + this.origin[0][1]; 
    this.origin.forEach(function(each) {
        path = path + " L " + each[0] + " " + each[1]; //[0] = x & [1] = y
    });
    var borderColor = this.borderColor != 'transparent'? '" stroke="' + this.borderColor + '"': '" stroke=none"';
    return '<path d="' + path + '" stroke-width="' + this.borderWidth + borderColor + ' fill=none />';
}

// VectorEllipse

var VectorEllipse;

VectorEllipse.prototype = new VectorShape();
VectorEllipse.prototype.constructor = VectorEllipse;
VectorEllipse.uber = VectorShape.prototype;

function VectorEllipse(borderWidth, borderColor, fillColor, origin, destination, hRadius, vRadius, threshold) {
    VectorEllipse.uber.init.call(this, borderWidth, borderColor, threshold);
    this.init(fillColor, origin, destination, hRadius, vRadius);
}

VectorEllipse.prototype.init = function(fillColor, origin, destination, hRadius, vRadius) {
    this.fillColor = fillColor;
    this.origin = origin;
    this.destination = destination;
    this.hRadius = hRadius;
    this.vRadius = vRadius;
}

VectorEllipse.prototype.copy = function () {
    var newEllipse = new VectorEllipse(
        this.borderWidth, 
        this.borderColor, 
        this.fillColor, 
        this.origin,
        this.destination,
        this.hRadius,
        this.vRadius
    );
    return VectorEllipse.uber.init.call(this, newEllipse);
}

VectorEllipse.prototype.toString = function () {
    return VectorEllipse.uber.toString.call(this) + ' center: ' + this.origin.toString() + ' radius: (' + this.hRadius.toString() + ',' + this.vRadius.toString() + ')';
}

VectorEllipse.prototype.containsPoint = function(aPoint) {
    return (Math.pow(aPoint.x-this.origin.x,2)/Math.pow(this.hRadius+this.threshold,2) + Math.pow(aPoint.y-this.origin.y,2)/Math.pow(this.vRadius+this.threshold,2)) < 1 ? true: false;
}

VectorEllipse.prototype.isFound = function(selectionBox) {
    var bounds = this.getBounds();
    if ((selectionBox.origin.x === selectionBox.destination.x 
        && selectionBox.origin.y === selectionBox.destination.y
        && this.containsPoint(selectionBox.origin))
        || (selectionBox.containsPoint(new Point(bounds.left, bounds.top)) 
        && selectionBox.containsPoint(new Point(bounds.left, bounds.bottom)) 
        && selectionBox.containsPoint(new Point(bounds.right, bounds.top))
        && selectionBox.containsPoint(new Point(bounds.right, bounds.bottom)))) return true;
    return false;
}

VectorEllipse.prototype.isInBoundingBox = function(aPoint) {
    var bounds = this.getBounds();
    var result = this.isEndPointInBoundingBox(new Point(bounds.left, bounds.top),
            new Point(bounds.left, bounds.bottom),
            new Point(bounds.right, bounds.top),
            new Point(bounds.right, bounds.bottom),
            aPoint);
    if(!result) return this.containsPoint(aPoint);
    return result;
}

VectorEllipse.prototype.getBounds = function() {
    return {left: this.origin.x-this.hRadius,
            top: this.origin.y-this.vRadius,
            right: this.origin.x+this.hRadius,
            bottom: this.origin.y+this.vRadius
            };
}

VectorEllipse.prototype.drawBoundingBox = function(context) {
    VectorEllipse.uber.drawBoundingBox.call(this, context, new Point(this.origin.x-this.hRadius, this.origin.y-this.vRadius), new Point(this.origin.x+this.hRadius, this.origin.y+this.vRadius));
}

VectorEllipse.prototype.exportAsSVG = function() {
    var borderColor = this.borderColor != 'transparent'? '" stroke="' + this.borderColor + '"': '" stroke=none"';
    var fillColor = this.fillColor != 'transparent'? ' fill="' + this.fillColor + '"': '" fill=none"';
    return '<ellipse cx="' + this.origin.x + '" cy="' + this.origin.y + '" rx="' + this.hRadius
        + '" ry="' + this.vRadius + '" stroke-width="' + this.borderWidth + borderColor 
        + fillColor + '/>';
}

// VectorClosedBrushPath

var VectorClosedBrushPath;

VectorClosedBrushPath.prototype = new VectorShape();
VectorClosedBrushPath.prototype.constructor = VectorClosedBrushPath;
VectorClosedBrushPath.uber = VectorShape.prototype;

function VectorClosedBrushPath(borderWidth, borderColor, fillColor, origin, destination, threshold) {
    VectorClosedBrushPath.uber.init.call(this, borderWidth, borderColor, threshold);
    this.init(origin, fillColor);
}

VectorClosedBrushPath.prototype.init = function(origin, fillColor) {
    this.origin = origin.slice();
    this.fillColor = fillColor;
}

VectorClosedBrushPath.prototype.copy = function () {
    var newBrush = new VectorClosedBrushPath(
        this.borderWidth, 
        this.borderColor, 
        this.fillColor, 
        this.origin, 
        this.destination
    );
    return VectorClosedBrushPath.uber.init.call(this, newBrush);
}

VectorClosedBrushPath.prototype.toString = function () {
    /* Brusher */
    var coordinates = "";
    coordinates += this.origin.length + this.origin.length-1;
    for (i = 0; i < this.origin.length; ++i) {
        coordinates += "[" + this.origin[i][0].toString() + "@" + this.origin[i][1].toString() + "]";
        if (this.origin.length != (this.origin.length - 1)) coordinates += ", ";
    }
    return VectorClosedBrushPath.uber.toString.call(this) + coordinates;
}

VectorClosedBrushPath.prototype.getBounds = function() {
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
VectorClosedBrushPath.prototype.drawBoundingBox = function(context) {
    var bounds = this.getBounds();
    VectorClosedBrushPath.uber.drawBoundingBox.call(this, context, new Point(bounds.left, bounds.top), new Point(bounds.right, bounds.bottom));
}

VectorClosedBrushPath.prototype.containsPoint = function(aPoint) {
    /* Only detec borders */
    for (i = 0; i < this.origin.length - 1; ++i) {
              var line = new VectorLine(null, null, null, new Point(this.origin[i][0], this.origin[i][1]), new Point(this.origin[i][0], this.origin[i][1]));
              if (line.containsPoint(aPoint)) return true;
    }
    return false;
}

VectorClosedBrushPath.prototype.isFound = function(selectionBox) {
    var bounds = this.getBounds();
    if ((selectionBox.origin.x === selectionBox.destination.x 
        && selectionBox.origin.y === selectionBox.destination.y
        && this.containsPoint(selectionBox.origin))
        || (selectionBox.containsPoint(new Point(bounds.left, bounds.top)) 
        && selectionBox.containsPoint(new Point(bounds.right, bounds.bottom)))) return true;
    return false;
}

VectorClosedBrushPath.prototype.isInBoundingBox = function(aPoint) {
    var bounds = this.getBounds();
    var result = this.isEndPointInBoundingBox(new Point(bounds.left, bounds.top),
            new Point(bounds.left, bounds.bottom),
            new Point(bounds.right, bounds.top),
            new Point(bounds.right, bounds.bottom),
            aPoint);
    if(!result) return this.containsPoint(aPoint);
    return result;
}

VectorClosedBrushPath.prototype.exportAsSVG = function() {
    var path = "M " + this.origin[0][0] + " " + this.origin[0][1]; 
    this.origin.forEach(function(each) {
        path = path + " L " + each[0] + " " + each[1]; //[0] = x & [1] = y
    });
    var fillColor = this.fillColor != 'transparent'? ' fill="' + this.fillColor + '"': '" fill=none"';
    var borderColor = this.borderColor != 'transparent'? '" stroke="' + this.borderColor + '"': '" stroke=none"';
    return '<path d="' + path + ' Z" stroke-width="' + this.borderWidth + '"' + borderColor + fillColor + ' />';
}

// VectorPolygon

VectorPolygon.prototype = new VectorShape();
VectorPolygon.prototype.constructor = VectorPolygon;
VectorPolygon.uber = VectorShape.prototype;

function VectorPolygon(borderWidth, borderColor, fillColor, origin, destination, threshold) {
    VectorPolygon.uber.init.call(this, borderWidth, borderColor, threshold);
    this.init(fillColor, origin, destination);
}

VectorPolygon.prototype.init = function(fillColor, origin, destination) {
    this.origin = origin
    this.fillColor = fillColor;
}

VectorPolygon.prototype.copy = function () {
    var newPolygon = new VectorPolygon(
        this.borderWidth, 
        this.borderColor, 
        this.fillColor, 
        this.origin, 
        this.destination
    );
    return VectorPolygon.uber.init.call(this, newPolygon);
}

VectorPolygon.prototype.toString = function () {
    /* Brusher */
    var coordinates = "";
    coordinates += this.origin.length + this.origin.length-1;
    for (i = 0; i < this.origin.length; ++i) {
        coordinates += "[" + this.origin[i][0] + "@" + this.origin[i][0] + "]";
        if (this.origin.length != (this.origin.length - 1)) coordinates += ", ";
    }
    return VectorPolygon.uber.toString.call(this) + coordinates;
}

/*VectorPolygon.prototype.containsPoint = function(aPoint) {
    var countTop = 0, countBottom = 0, countLeft = 0, countRight = 0;  
    for (i = 0; i < this.origin.length - 1; ++i) {
        if(apoint.x === this.origin.x) apoint.y >= this.origin.y ? ++countBottom : ++countTop;
        if(apoint.y === this.origin.y) apoint.x >= this.origin.x ? ++countRight : ++countLeft;
    }
    console.log(countTop + countBottom + countLeft + countRight);
    if(countBottom % 2 !== 0 && countRight % 2 !== 0 && countLeft % 2 !== 0 && countTop % 2 !== 0) return true;
    return false;
}*/

VectorPolygon.prototype.containsPoint = function(aPoint) {
    for (i = 1; i < this.origin.length; ++i) {
        var line = new VectorLine(null, null, null, new Point(this.origin[i-1][0], this.origin[i-1][1]), new Point(this.origin[i][0], this.origin[i][1]));
        if (line.containsPoint(aPoint)) return true;
    };
    return false;
}

VectorPolygon.prototype.isFound = function(selectionBox) {
    var bounds = this.getBounds();
    if ((selectionBox.origin.x === selectionBox.destination.x 
        && selectionBox.origin.y === selectionBox.destination.y
        && this.containsPoint(selectionBox.origin))
        || (selectionBox.containsPoint(new Point(bounds.left, bounds.top)) 
        && selectionBox.containsPoint(new Point(bounds.right, bounds.bottom)))) return true;
    return false;
}

VectorPolygon.prototype.getBounds = function() {
    console.log(this.origin);
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
VectorPolygon.prototype.drawBoundingBox = function(context) {
    var bounds = this.getBounds();
    VectorPolygon.uber.drawBoundingBox.call(this, context, new Point(bounds.left, bounds.top), new Point(bounds.right, bounds.bottom));
}

VectorPolygon.prototype.isInBoundingBox = function(aPoint) {
    var bounds = this.getBounds();
    var result = this.isEndPointInBoundingBox(new Point(bounds.left, bounds.top),
            new Point(bounds.left, bounds.bottom),
            new Point(bounds.right, bounds.top),
            new Point(bounds.right, bounds.bottom),
            aPoint);
    if(!result) return this.containsPoint(aPoint);
    return result;
}

VectorPolygon.prototype.exportAsSVG = function() {
    var path = "M " + this.origin[0].x + " " + this.origin[0].y; 
    this.origin.forEach(function(each) {
        path = path + " L " + each.x + " " + each.y; //[0] = x & [1] = y
    });
    var fillColor = this.fillColor != 'transparent'? ' fill="' + this.fillColor + '"': '" fill=none"';
    var borderColor = this.borderColor != 'transparent'? '" stroke="' + this.borderColor + '"': '" stroke=none"';
    return '<path d="' + path + ' Z" stroke-width="' + this.borderWidth + '"' + borderColor + fillColor + ' />';
}


// Decorator Pattern
// =================
// Modificar comportament de funcions sense sobreescriure-les

// CostumeEditorMorph inherits from Morph:

PaintEditorMorph.prototype.originalBuildEdits = PaintEditorMorph.prototype.buildEdits;
PaintEditorMorph.prototype.buildEdits = function () {
    var myself = this;

    this.originalBuildEdits();
    this.edits.add(this.pushButton(
            "Vector",
            function () { 
                editor = new VectorPaintEditorMorph();
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
                //myself.cancel();
            }
    ));
    this.edits.fixLayout();
};

// VectorPaintEditorMorph //////////////////////////

var VectorPaintEditorMorph;

VectorPaintEditorMorph.prototype = new PaintEditorMorph();
VectorPaintEditorMorph.prototype.constructor = VectorPaintEditorMorph;
VectorPaintEditorMorph.uber = PaintEditorMorph.prototype;

function VectorPaintEditorMorph() {
    this.init();
}

VectorPaintEditorMorph.prototype.init = function () {
    var myself = this;

    // additional properties:
    this.paper = null; // paint canvas
    this.vectorObjects = []; // collection of VectorShapes
    this.vectorObjectsSelected = []; // collection of VectorShapes
    this.currentObject = null; // object being currently painted / edited
    //this.selectionContext = null; // drawing context for selection box

    // initialize inherited properties:
    VectorPaintEditorMorph.uber.init.call(this);

    /* potser hi cal this.buildToolbox(); */
    // override inherited properties:
    this.labelString = "Vector Paint Editor";
    this.createLabel();
    this.fixLayout();

    // build contents:
    //this.buildContents();
};

VectorPaintEditorMorph.prototype.buildEdits = function () {
    var myself = this;
    this.originalBuildEdits();

    this.edits.add(this.pushButton(
            "Bitmap",
            function () {
                editor = new PaintEditorMorph();
                editor.oncancel = myself.oncancel || nop();
                var can = newCanvas(myself.paper.extent());
                myself.vectorObjects.forEach(function(each) {
                    can.getContext("2d").drawImage(each.image, 0, 0);
                });
                editor.openIn(
                    myself.world(),
                    can,
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
}

VectorPaintEditorMorph.prototype.buildLayersBox = function () {
    var mctx = this.paper.mask.getContext("2d");
    this.scaleBox.add(this.pushButton(
        "Top", 
        this.jumpToTop = function() {
                    for(z = this.vectorObjectsSelected.length-1; z >= 0; --z) {
                        var index = this.vectorObjects.indexOf(this.vectorObjectsSelected[z]);

                        mctx.save();
                        this.vectorObjects[index].drawBoundingBox(mctx);
                        this.paper.changed();
                        mctx.restore(); 

                        this.vectorObjects.splice(index,1);
                        this.vectorObjects.push(this.vectorObjectsSelected[z]);
       
                    }
                    this.paper.drawNew();
                }
            ));
    this.scaleBox.add(this.pushButton(
        "Bottom", this.jumpToBottom  = function() {
                    for(z = 0; z < this.vectorObjectsSelected.length; ++z) {    
                        var index = this.vectorObjects.indexOf(this.vectorObjectsSelected[z]);

                        mctx.save();
                        this.vectorObjects[index].drawBoundingBox(mctx);
                        this.paper.changed();
                        mctx.restore();
                        
                        this.vectorObjects.splice(index,1);
                        this.vectorObjects.unshift(this.vectorObjectsSelected[z]);
                    }
                    this.paper.drawNew();
                }
            ));
    this.scaleBox.add(this.pushButton(
        "Up", this.jumpToUp = function() {
                    var lastIndexChanged = this.vectorObjects.length;
                    for(z = 0; z < this.vectorObjectsSelected.length; ++z) {
                        var index = this.vectorObjects.indexOf(this.vectorObjectsSelected[z]);
                        mctx.save();
                        this.vectorObjects[index].drawBoundingBox(mctx);
                        this.paper.changed();
                        mctx.restore();
                        if(lastIndexChanged-index > 1) {
                            var t = this.vectorObjects[index];
                            this.vectorObjects[index] = this.vectorObjects[index+1];
                            this.vectorObjects[index+1] = t;
                            lastIndexChanged = index;
                        }
                        else lastIndexChanged = index;
                    }
                    this.paper.drawNew();
                }
            ));
    this.scaleBox.add(this.pushButton(
        "Down", this.jumpToDown = function() {
                    var lastIndexChanged = -1;
                    for(z = this.vectorObjectsSelected.length-1; z >= 0; --z) {
                        var index = this.vectorObjects.indexOf(this.vectorObjectsSelected[z]);
                        mctx.save();
                        this.vectorObjects[index].drawBoundingBox(mctx);
                        this.paper.changed();
                        mctx.restore();
                        if(index-lastIndexChanged > 1) {
                            var t = this.vectorObjects[index];
                            this.vectorObjects[index] = this.vectorObjects[index-1];
                            this.vectorObjects[index-1] = t;
                            lastIndexChanged = index;
                        }
                        else lastIndexChanged = index;                
                    }
                    this.paper.drawNew();
                }
            ));
    this.scaleBox.fixLayout();
}

VectorPaintEditorMorph.prototype.buildScaleBox = VectorPaintEditorMorph.prototype.buildLayersBox;

// a) Convertim els vectorObjects a un SVG en format text, i després reutilitzem tot SVG_Costume:
//
// i = new Image();
// i.src = 'data:image/svg+xml, <svg xmlns="http://www.w3.org/2000/svg" width="744.09448819" height="1052.3622047" version="1.1" > <rect style="fill:#ff0000;fill-opacity:1;stroke:none" width="368.57144" height="271.42856" x="177.14285" y="278.07648" rx="60.594475" ry="60.594482" /> </svg>';
// new VectorCostume(i, name, blahblahblah...)
// 
// i.src = 'data:image/svg+xml, ' + this.getSVG(); 
// on _this_ és l'editor
//     img.src = 'data:image/svg+xml,' + this.getSVG() + "'";

VectorPaintEditorMorph.prototype.openIn = function (world, oldim, oldrc, callback) {

    VectorPaintEditorMorph.uber.openIn.call(this, world, oldim, oldrc, callback);
    this.processKeyDown = function () {
        /* Shift key */
        this.shift = this.world().currentKey === 16;
        switch (this.world().currentKey) {
            /* Del key */
            case 46:
                this.delete = function() {
                    for(z = 0; z < this.vectorObjectsSelected.length; ++z) {
                        var index = this.vectorObjects.indexOf(this.vectorObjectsSelected[z]);
                        this.vectorObjects.splice(index,1);
                    }
                    this.drawNew();
                    //this.vectorObjectsSelected = [];
                }
                this.delete();
            break;
            /* Page Up key */
            case 33:
                this.jumpToUp();
            break;
            /* Page Down key */
            case 34:
                this.jumpToDown();
            break;
            /* Home key */
            case 36:
                this.jumpToTop();
            break;
            /* End key */
            case 35:
                this.jumpToBottom();
            break;
            default:
                nop();

        }
        this.propertiesControls.constrain.refresh();
    };
}

VectorPaintEditorMorph.prototype.buildContents = function() {

    VectorPaintEditorMorph.uber.buildContents.call(this);

    var myself = this;

    this.paper.destroy();
    this.paper = new VectorPaintCanvasMorph(myself.shift);
    this.paper.setExtent(StageMorph.prototype.dimensions);
    this.body.add(this.paper);

    this.refreshToolButtons();
    this.fixLayout();
    this.drawNew();
}

VectorPaintEditorMorph.prototype.buildToolbox = function () {
    //VectorPaintEditorMorph.uber.buildToolbox.call(this);
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
            "Pipette tool\n(pick a color anywhere)",
        polygon:
            "Pipette tool\n(pick a color anywhere)",
        closedBrushPath:
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

VectorPaintEditorMorph.prototype.populatePropertiesMenu = function () {
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
    pc.penSizeField = new InputFieldMorph("3", true, null, false);
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

VectorPaintEditorMorph.prototype.getSVG = function () {
    var srcSVG = "";
    this.vectorObjects.forEach(function(each) {
       srcSVG = srcSVG + each.getSVG();
    });
    return srcSVG;
};

// VectorPaintCanvasMorph //////////////////////////

VectorPaintCanvasMorph.prototype = new PaintCanvasMorph();
VectorPaintCanvasMorph.prototype.constructor = VectorPaintCanvasMorph;
VectorPaintCanvasMorph.uber = PaintCanvasMorph.prototype;

function VectorPaintCanvasMorph(shift) {
    this.init(shift);
}

VectorPaintCanvasMorph.prototype.init = function (shift) {
    VectorPaintCanvasMorph.uber.init.call(this, shift);
    this.vectorbrushBuffer = [];
    this.currentTool = "selection";
    this.settings = {
        "primarycolor": new Color(0, 0, 0, 255), // stroke color
        "secondarycolor": "transparent", // fill color
        "linewidth": 3 // stroke width
    };
    this.polygonBuffer = [];
};

VectorPaintCanvasMorph.prototype.drawNew = function(isPrintVectObject) {
    var editor = this.parentThatIsA(VectorPaintEditorMorph),
        myself = this,
        can = newCanvas(this.extent());
    if(typeof isPrintVectObject === 'undefined') var isPrintVectObject = true;
    this.merge(this.background, can);
    this.merge(this.paper, can);
    if(isPrintVectObject) {
        editor.vectorObjects.forEach(function(each) {
            myself.merge(each.image, can)
        });
    }
    this.merge(this.mask, can);
    this.image = can;
    this.drawFrame();
};

VectorPaintCanvasMorph.prototype.floodfill = function (aPoint) {
    var editor = this.parentThatIsA(VectorPaintEditorMorph);
    for (j = editor.vectorObjects.length-1; j >= 0; --j) {
        if(editor.vectorObjects[j].containsPoint(aPoint)) {
            var shape = editor.vectorObjects[j];
            var mctx = this.mask.getContext("2d");
            console.log(this.settings.secondarycolor);
            this.isShiftPressed() ? shape.fillColor = this.settings.secondarycolor
                : shape.borderColor = this.settings.primarycolor;
            mctx.save();
            mctx.fillStyle = this.settings.secondarycolor.toString();
            mctx.strokeStyle = this.settings.primarycolor.toString();
            if(this.settings.secondarycolor !== "transparent") mctx.fillRect(shape.origin.x, shape.origin.y, Math.abs(shape.origin.x-shape.destination.x), Math.abs(shape.origin.y-shape.destination.y));
            if(this.settings.primarycolor !== "transparent") mctx.strokeRect(shape.origin.x, shape.origin.y, Math.abs(shape.origin.x-shape.destination.x), Math.abs(shape.origin.y-shape.destination.y));
            //editor.vectorObjects[j].image.width = this.mask.width;
            //editor.vectorObjects[j].image.height = this.mask.height;
            editor.vectorObjects[j].image.getContext('2d').drawImage(this.mask, 0, 0); 
            this.drawNew();
            this.changed();
            mctx.restore();
            return;
        }
    }
};

VectorPaintCanvasMorph.prototype.mouseMove = function (pos) {
    if (this.currentTool === "paintbucket") {
        return;
    }
    var relpos = pos.subtract(this.bounds.origin),      // relative position
        mctx = this.mask.getContext("2d"), // current tool temporary context
        tmask = newCanvas(this.extent()),
        tmctx = tmask.getContext("2d"), // temporal draing context          
        pctx = this.paper.getContext("2d"),             // drawing context
        x = this.dragRect.origin.x, // original drag X
        y = this.dragRect.origin.y, // original drag y
        p = relpos.x,               // current drag x
        q = relpos.y,               // current drag y
        w = (p - x) / 2,            // half the rect width
        h = (q - y) / 2,            // half the rect height
        i,                          // iterator number
        tool,
        index,
        action,
        width = this.paper.width,
        editor = this.parentThatIsA(VectorPaintEditorMorph),
        myself = this;

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
    
    mctx.fillStyle = this.settings.secondarycolor.toString();
    mctx.strokeStyle = this.settings.primarycolor.toString();

    action = false;
    for(ii = 0; ii < editor.vectorObjectsSelected.length && action === false; ++ii) {
        action = editor.vectorObjectsSelected[ii].isInBoundingBox(new Point(x,y));
    }
    if (action === false) editor.vectorObjectsSelected = [];

    /* Resize or move shape */
    if(this.currentTool === 'selection' && editor.vectorObjectsSelected.length) {
        action = false;
        for(ii = 0; ii < editor.vectorObjectsSelected.length && action === false; ++ii) {
            action = editor.vectorObjectsSelected[ii].isInBoundingBox(new Point(x,y));
        }
        if(action !== false) {
            //for(ii = editor.vectorObjectsSelected.length-1; ii >= 0; --ii) {
            var currentObjectIterator = -1;
            for(ii = 0; ii < editor.vectorObjects.length; ++ii) {
            //for(ii = 0; ii < editor.vectorObjectsSelected.length; ++ii) {
                if(editor.vectorObjectsSelected.indexOf(editor.vectorObjects[ii]) === -1) {
                    mctx.drawImage(editor.vectorObjects[ii].image, 0, 0);
                }
                else {
                    ++currentObjectIterator;
                    var shapeSelected = editor.vectorObjects[ii];
                    tool = shapeSelected.constructor.name;
                    if(typeof shapeSelected.fillColor !== 'undefined') tmctx.fillStyle = shapeSelected.fillColor.toString();
                    tmctx.strokeStyle = shapeSelected.borderColor.toString();
                    tmctx.lineWidth = shapeSelected.borderWidth;
                    var movementX = relpos.x-this.dragRect.origin.x, 
                    movementY = relpos.y-this.dragRect.origin.y;
                    console.log(action);
                    if (action === true){
                        /* Move figure */
                        if(tool === 'VectorBrush' || tool === 'VectorClosedBrushPath' || tool === 'VectorPolygon') {
                            var moveBuffer = [], tmp;
                            /* Clone array */
                            for(z = 0; z < shapeSelected.origin.length; ++z) {
                                tmp = new Point(shapeSelected.origin[z][0], shapeSelected.origin[z][1]);
                                moveBuffer.push([tmp.x+movementX, tmp.y+movementY]);
                            }
                        }
                        else {
                            /* Line, Rectangle, Ellipse,  */
                            console.log("x: " + shapeSelected.origin.x + " y: " + shapeSelected.origin.y + " p: " + shapeSelected.destination.x + " q: " + shapeSelected.destination.y);
                            x = shapeSelected.origin.x + movementX; 
                            y = shapeSelected.origin.y + movementY;
                            p = shapeSelected.destination.x + movementX;
                            q = shapeSelected.destination.y + movementY;
                            console.log("x: " + x + " y: " + y + " p: " + p + " q: " + q);
                        }
                    }
                    else {
                        if(tool === 'VectorRectangle') {
                            var bounds = shapeSelected.getBounds();
                            if(action === 'leftTop' || action === 'leftBottom') x = bounds.left + movementX;
                            else x = bounds.left;
                            if(action === 'leftTop' || action === 'rightTop') y = bounds.top + movementY;
                            else y = bounds.top;
                            if(action === 'rightBottom' || action === 'rightTop') p = bounds.right + movementX;
                            else p = bounds.right;
                            if(action === 'leftBottom' || action === 'rightBottom') q = bounds.bottom + movementY;
                            else q = bounds.bottom; 
                        } else if(tool === 'VectorEllipse') {
                            x = shapeSelected.origin.x;
                            y = shapeSelected.origin.y;
                            if(action === 'rightBottom') {
                                p = shapeSelected.destination.x + movementX;
                                q = shapeSelected.destination.y + movementY;
                            }
                            else if(action === 'leftBottom') {
                                p = shapeSelected.destination.x - movementX;
                                q = shapeSelected.destination.y + movementY;
                            }
                            else if(action === 'leftTop') {
                                p = shapeSelected.destination.x - movementX;
                                q = shapeSelected.destination.y - movementY;
                            }
                            else if(action === 'rightTop') {
                                p = shapeSelected.destination.x + movementX;
                                q = shapeSelected.destination.y - movementY;
                            }
                        } else if(tool === 'VectorLine') {
                            var bounds = shapeSelected.getBounds();
                            var leftmost = shapeSelected.origin.x <= shapeSelected.destination.x ? shapeSelected.origin : shapeSelected.destination;
                            var rightmost = shapeSelected.origin.x > shapeSelected.destination.x ? shapeSelected.origin : shapeSelected.destination;
                            if(action === 'leftTop' && (bounds.left === shapeSelected.origin.x && bounds.top === shapeSelected.origin.y || 
                                bounds.left  === shapeSelected.destination.x && bounds.top  === shapeSelected.destination.y)) {
                                x = bounds.left + movementX;
                                y = bounds.top + movementY;
                                p = bounds.right;
                                q = bounds.bottom;
                            } else if(action === 'leftBottom' && (bounds.left === shapeSelected.origin.x && bounds.bottom === shapeSelected.origin.y || 
                                bounds.left  === shapeSelected.destination.x && bounds.bottom  === shapeSelected.destination.y)) {
                                x = bounds.left + movementX;
                                y = bounds.bottom + movementY;
                                p = bounds.right;
                                q = bounds.top;
                            } else if(action === 'leftTop' || action === 'leftBottom') {

                                x = leftmost.x + movementX;
                                y = leftmost.y;
                                p = rightmost.x;
                                q = rightmost.y + movementY;
                            } else if(action === 'rightTop' && (bounds.right === shapeSelected.origin.x && bounds.top === shapeSelected.origin.y || 
                                bounds.right  === shapeSelected.destination.x && bounds.top  === shapeSelected.destination.y)) {
                                x = bounds.right + movementX;
                                y = bounds.top + movementY;
                                p = bounds.left;
                                q = bounds.bottom;
                            } else if(action === 'rightBottom' && (bounds.right === shapeSelected.origin.x && bounds.bottom === shapeSelected.origin.y || 
                                bounds.right  === shapeSelected.destination.x && bounds.bottom  === shapeSelected.destination.y)) {
                                x = bounds.right + movementX;
                                y = bounds.bottom + movementY;
                                p = bounds.left;
                                q = bounds.top;
                            }
                            else if(action === 'rightTop' || action === 'rightBottom'){
                                x = leftmost.x;
                                y = leftmost.y + movementY;
                                p = rightmost.x + movementX;
                                q = rightmost.y;
                            }
                        } else if(tool === 'VectorBrush') {
                            var tmp, resizeRatioX, resizeRatioY, moveBuffer = [], bounds = shapeSelected.getBounds();
                            resizeRatioX = (bounds.right-bounds.left+movementX)/(bounds.right-bounds.left);
                            resizeRatioY = (bounds.bottom-bounds.top+movementY)/(bounds.bottom-bounds.top);
                            for(z = 0; z < shapeSelected.origin.length; ++z) {
                                tmp = new Point(shapeSelected.origin[z][0], shapeSelected.origin[z][1]);
                                moveBuffer.push([tmp.x*resizeRatioX, tmp.y*resizeRatioY]);
                            }
                        }
                        /* VectorPolygon - VectorClosedBrushPath */
                    }
                        
                    w = (p - x) / 2,            // recalculate half the rect width
                    h = (q - y) / 2;            // recalculate half the rect height
                    /* drawing actioned */
                    if (editor.currentObject === null) editor.currentObject = [];
                    switch (tool) {
                        case "VectorRectangle":
                            if(shapeSelected.fillColor !== "transparent") tmctx.fillRect(x, y, w * 2, h * 2);
                            if(shapeSelected.borderColor !== "transparent") tmctx.strokeRect(x, y, w * 2, h * 2);
                            if (currentObjectIterator < editor.currentObject.length) {
                                editor.currentObject[currentObjectIterator][1].origin = new Point(x,y);
                                editor.currentObject[currentObjectIterator][1].destination = new Point(p,q);
                            } else {
                                editor.currentObject.push([ii, new VectorRectangle(shapeSelected.borderWidth, shapeSelected.borderColor, shapeSelected.fillColor, new Point(x,y), new Point(p,q))]);
                            }
                        break;
                        case "VectorLine":
                            tmctx.beginPath();
                            tmctx.moveTo(x, y);
                            tmctx.lineTo(p, q); // lineTo = create a line position
                            if (currentObjectIterator < editor.currentObject.length) {
                                editor.currentObject[currentObjectIterator][1].origin = new Point(x,y);
                                editor.currentObject[currentObjectIterator][1].destination = new Point(p, q);
                            } else {
                                /* borderWidth, borderColor, fillColor, origin, destination */
                                editor.currentObject.push([ii, new VectorLine(shapeSelected.borderWidth, shapeSelected.borderColor, shapeSelected.fillColor, new Point(x,y), new Point(p,q))]);
                            }
                            tmctx.stroke();
                        break;
                        case "VectorEllipse":
                            tmctx.beginPath();
                            var hRadius, vRadius, pathCircle;
                            vRadius = 0;
                            for (i = 0; i < width; ++i) {
                                pathCircle = 2 - Math.pow((i - x) / (2 * w),2);
                                tmctx.lineTo(
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
                                tmctx.lineTo(
                                    i,
                                    -1 * (2 * h) * Math.sqrt(2 - Math.pow(
                                        (i - x) / (2 * w),
                                        2
                                        )) + y
                                    );
                            }
                            if (currentObjectIterator < editor.currentObject.length) {
                                editor.currentObject[currentObjectIterator][1].origin = new Point(x,y);
                                editor.currentObject[currentObjectIterator][1].destination = new Point(p,q);
                                editor.currentObject[currentObjectIterator][1].hRadius = hRadius;
                                editor.currentObject[currentObjectIterator][1].vRadius = vRadius;
                            }
                            else {
                                editor.currentObject.push([ii, new VectorEllipse(shapeSelected.borderWidth, shapeSelected.borderColor, shapeSelected.fillColor, new Point(x,y), new Point(p,q), hRadius , vRadius)]);
                            }
                            tmctx.closePath();
                            tmctx.stroke();
                            tmctx.fill();
                        break;
                        case "VectorBrush": case "VectorClosedBrushPath":
                            tmctx.lineCap = "round";
                            tmctx.lineJoin = "round";
                            tmctx.beginPath();
                            tmctx.moveTo(moveBuffer[0][0], moveBuffer[0][1]); // first Point 
                            for (i = 0; i < moveBuffer.length; ++i) {
                                tmctx.lineTo(moveBuffer[i][0], moveBuffer[i][1]);
                            }
                            if(currentObjectIterator < editor.currentObject.length) {
                                editor.currentObject[currentObjectIterator][1].origin = moveBuffer;
                            } else {
                                if(tool === 'VectorBrush') editor.currentObject.push([ii, new VectorBrush(shapeSelected.borderWidth, shapeSelected.borderColor, shapeSelected.fillColor, moveBuffer, null)]);
                                else editor.currentObject.push([ii, new VectorClosedBrushPath(shapeSelected.borderWidth, shapeSelected.borderColor, shapeSelected.fillColor, moveBuffer, null)]);
                            }
                            if(tool === 'VectorClosedBrushPath') {
                                tmctx.closePath();
                                if(shapeSelected.fillColor !== "transparent") tmctx.fill();
                            }
                            tmctx.stroke();
                        break;
                        case "VectorPolygon":
                                tmctx.lineCap = "round"; // "A rounded end cap is added to each end of the line"
                                tmctx.lineJoin = "round";
                                tmctx.beginPath();
                                tmctx.moveTo(moveBuffer[0][0], moveBuffer[0][1]);
                                for (i = 0; i < moveBuffer.length; ++i) {
                                    tmctx.lineTo(moveBuffer[i][0], moveBuffer[i][1]);
                                }
                                if(currentObjectIterator < editor.currentObject.length) {
                                    editor.currentObject[currentObjectIterator][1].origin = moveBuffer;
                                } else {
                                    editor.currentObject.push([ii, new VectorPolygon(shapeSelected.borderWidth, shapeSelected.borderColor, shapeSelected.fillColor, moveBuffer, null)]);
                                }
                                tmctx.closePath();
                                if(shapeSelected.fillColor !== "transparent") tmctx.fill();
                                tmctx.stroke();
                            break;
                        default:
                            nop();
                        }
                        /* Save only one image */
                        editor.currentObject[currentObjectIterator][1].image.width = tmask.width;
                        editor.currentObject[currentObjectIterator][1].image.height = tmask.height;
                        editor.currentObject[currentObjectIterator][1].image.getContext('2d').drawImage(tmask, 0, 0);
                        mctx.drawImage(tmask, 0, 0);
                        tmctx.clearRect(0, 0, this.bounds.width(), this.bounds.height());
                    }
                }
            }
            this.drawNew(false);
            this.changed();
            mctx.restore();
        } else {
        // traditional 
            switch (this.currentTool) {

                case "selection":
                if (!editor.vectorObjectsSelected.length) {
                    var auxColor = mctx.strokeStyle;
                    mctx.strokeStyle = "black";
                    mctx.lineWidth = 1;
                    mctx.setLineDash([6]);
                    mctx.strokeRect(x, y, w * 2, h * 2);
                    mctx.strokeStyle = auxColor;
                    mctx.setLineDash([]);
                }
                break;
                case "rectangle":
                if (this.isShiftPressed()) {
                    if(this.settings.secondarycolor !== "transparent") mctx.fillRect(x, y, newW() * 2, newH() * 2);
                    if(this.settings.primarycolor !== "transparent") mctx.strokeRect(x, y, newW() * 2, newH() * 2);
                    if (editor.currentObject) {
                        editor.currentObject.origin = new Point(x,y);
                        editor.currentObject.destination = new Point(x + newW() * 2, y + newH() * 2);
                    } else {
                        editor.currentObject = new VectorRectangle(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), new Point(x + newW() * 2, y + newH() * 2));
                    }
                } else {
                    if(this.settings.secondarycolor !== "transparent") mctx.fillRect(x, y, w * 2, h * 2);
                    if(this.settings.primarycolor !== "transparent") mctx.strokeRect(x, y, w * 2, h * 2);
                    if (editor.currentObject) {
                        editor.currentObject.origin = new Point(x,y);
                        editor.currentObject.destination = new Point(p,q);
                    } else {
                        editor.currentObject = new VectorRectangle(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), new Point(p,q));
                    }

                }   
                break;
                case "brush": case "closedBrushPath":
                /* Save each point in a VectorBrusher */
                this.brush = function(isClosed) {
                    mctx.lineWidth = this.settings.linewidth;
                    mctx.fillStyle = this.settings.secondarycolor.toString();
                    mctx.strokeStyle = this.settings.primarycolor.toString();
                    mctx.lineCap = "round"; // "A rounded end cap is added to each end of the line"
                    mctx.lineJoin = "round";
                    mctx.beginPath();
                    mctx.moveTo(this.brushBuffer[0][0], this.brushBuffer[0][1]); // first Point 
                    for (i = 0; i < this.brushBuffer.length; ++i) {
                        mctx.lineTo(this.brushBuffer[i][0], this.brushBuffer[i][1]);
                    }
                    if (editor.currentObject) {
                        editor.currentObject.origin = this.brushBuffer.slice();
                    } else {
                        editor.currentObject = new VectorBrush(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, this.brushBuffer.slice(), null);
                    }
                    if(isClosed) {
                        editor.currentObject = new VectorClosedBrushPath(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, this.brushBuffer.slice(), null);
                        mctx.closePath();
                        mctx.fill();
                    }
                    mctx.stroke();
                    }
                    this.brush(false);
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
                                    editor.currentObject = new VectorLine(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), new Point(x, q));
                                }
                            } else {
                            mctx.lineTo(p, y); // lineTo = create a line position
                            if (editor.currentObject) {
                                editor.currentObject.origin = new Point(x,y);
                                editor.currentObject.destination = new Point(p, y);
                            } else {
                                /* borderWidth, borderColor, fillColor, origin, destination */
                                editor.currentObject = new VectorLine(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), new Point(p, y));
                            }
                        }
                        } else {
                            mctx.lineTo(p, q);
                            if (editor.currentObject) {
                                editor.currentObject.origin = new Point(x,y);
                                editor.currentObject.destination = new Point(p,q); // p & q
                            } else {
                                editor.currentObject = new VectorLine(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), relpos);
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
                            editor.currentObject.destination = new Point(p,q);
                            editor.currentObject.hRadius = hRadius;
                            editor.currentObject.vRadius = vRadius;
                        }
                        else {
                            editor.currentObject = new VectorEllipse(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y),  new Point(p,q), hRadius, vRadius);
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
                            editor.currentObject.destination = new Point(p,q);
                            editor.currentObject.hRadius = hRadius;
                            editor.currentObject.vRadius = vRadius;
                        }
                        else {
                            editor.currentObject = new VectorEllipse(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, new Point(x,y), new Point(p,q), hRadius , vRadius);
                        }
                    }
                    mctx.closePath();
                    mctx.stroke();
                    mctx.fill();
                break;
                case "polygon":
                    if(!this.polygonBuffer.length) this.polygonBuffer.push([x,y]);
                    this.polygon = function(isClosedYet) {
                        mctx.lineWidth = this.settings.linewidth;
                        mctx.fillStyle = this.settings.secondarycolor.toString();
                        mctx.strokeStyle = this.settings.primarycolor.toString();
                        mctx.lineCap = "round"; // "A rounded end cap is added to each end of the line"
                        mctx.lineJoin = "round";
                        mctx.beginPath();
                        mctx.moveTo(this.polygonBuffer[0][0], this.polygonBuffer[0][1]);
                        for (i = 1; i < this.polygonBuffer.length; ++i) {
                            mctx.lineTo(this.polygonBuffer[i][0], this.polygonBuffer[i][1]);
                        }
                        if (editor.currentObject) {
                            /* Is it necessary? */
                            editor.currentObject.origin = this.polygonBuffer.slice();
                        } else {
                            editor.currentObject = new VectorPolygon(this.settings.linewidth, this.settings.primarycolor, this.settings.secondarycolor, this.polygonBuffer.slice(), null);
                        }
                        mctx.lineTo(p, q);
                        if(isClosedYet) {
                            editor.currentObject.origin = this.polygonBuffer.slice();
                            console.log(editor.currentObject.origin);
                            mctx.closePath();
                            mctx.fill();
                        }
                        mctx.stroke();
                    }
                    this.polygon(false);
                    break;
                case "crosshairs":
                    this.rotationCenter = relpos.copy();
                    this.drawcrosshair(mctx);
                break;
                default:
                    nop();
                break;
            }
            this.drawNew(true);
            this.changed();
            mctx.restore();
        }
    this.previousDragPoint = new Point(p,q);
};

VectorPaintCanvasMorph.prototype.mouseClickLeft = function () {
    console.log(this.currentTool);
    var editor = this.parentThatIsA(VectorPaintEditorMorph);
    var mctx = this.mask.getContext("2d");
    function deselect() {
                /* erase selection*/
        editor.vectorObjectsSelected = [];
    }
    if (this.currentTool === "selection" && editor.currentObject === null) {
        deselect();
        mctx.save();
        mctx.clearRect(0, 0, editor.bounds.width(), editor.bounds.height()); // clear dashed rectangle
        this.drawNew();
        this.changed();
        mctx.restore();
        var selectionBounds = new VectorRectangle(null, null, null, this.dragRect.origin, this.previousDragPoint);
        for (j = editor.vectorObjects.length-1; j >= 0; --j) {
            if(editor.vectorObjects[j].isFound(selectionBounds)) {
                console.log("Found it");
                mctx.save();
                editor.vectorObjects[j].drawBoundingBox(mctx);
                this.drawNew();
                this.changed();
                mctx.restore();
                editor.vectorObjectsSelected.push(editor.vectorObjects[j]);
                if(selectionBounds.origin.x === selectionBounds.destination.x 
                    && selectionBounds.origin.y === selectionBounds.destination.y) {
                    break;
                    }
            }
        }
    }
    else if (this.currentTool === "selection" && editor.currentObject !== null) {
        editor.vectorObjectsSelected = [];
        for (ii = editor.currentObject.length-1; ii >= 0; --ii) {
            console.log(editor.currentObject[ii][1]);
            editor.vectorObjects.splice(editor.currentObject[ii][0],1);
            editor.vectorObjects.splice(editor.currentObject[ii][0], 0, editor.currentObject[ii][1]); // splice(position, numberOfItemsToRemove, item)   
            editor.vectorObjectsSelected.push(editor.vectorObjects[editor.currentObject[ii][0]]);
            mctx.save();
            editor.vectorObjects[editor.currentObject[ii][0]].drawBoundingBox(mctx);
            this.drawNew();
            this.changed();
            mctx.restore();
        }
        editor.currentObject = null;
    }
    else if (this.currentTool === "closedBrushPath") {
        this.brush(true);
        this.drawNew();
        this.changed();
        mctx.restore();
    }

    if(this.currentTool === "polygon") {
        if(this.polygonBuffer[0][0] === this.previousDragPoint.x && 
            this.polygonBuffer[0][0] === this.previousDragPoint.y ||
            this.polygonBuffer[this.polygonBuffer.length-1][0] === this.previousDragPoint.x && 
            this.polygonBuffer[this.polygonBuffer.length-1][1] === this.previousDragPoint.y) {
            this.polygon(true);
            this.polygonBuffer.length = 0;
            this.drawNew();
            this.changed();
            mctx.restore();
            console.log(editor.currentObject);
            editor.vectorObjects.push(editor.currentObject);
            editor.currentObject.image.width = this.mask.width;
            editor.currentObject.image.height = this.mask.height;
            editor.currentObject.image.getContext('2d').drawImage(this.mask, 0, 0);
            editor.currentObject = null;
        }
        else {
            this.polygonBuffer.push([this.previousDragPoint.x, this.previousDragPoint.y]);
        }
    }
    else if (editor.currentObject !== null && this.currentTool !== "crosshairs" 
        && this.currentTool !== "selection" 
        && this.currentTool !== "paintbucket") {
        editor.vectorObjects.push(editor.currentObject);
        editor.currentObject.image.width = this.mask.width;
        editor.currentObject.image.height = this.mask.height;
        editor.currentObject.image.getContext('2d').drawImage(this.mask, 0, 0);
        editor.currentObject = null;
        deselect();
    }
    this.brushBuffer.length = 0;
}

// VectorCostume /////////////////////////////////////////////////////////////

VectorCostume.prototype = new SVG_Costume();
VectorCostume.prototype.constructor = VectorCostume;
VectorCostume.uber = SVG_Costume.prototype;

// VectorCostume instance creation

function VectorCostume(image, name, rotationCenter, vectorObjects) {
    this.contents = image;
    this.vectorObjects = vectorObjects;
    this.shrinkToFit(this.maxExtent());
    this.name = name || null;
    this.rotationCenter = rotationCenter || this.center();
    this.version = Date.now(); // for observer optimization
    this.loaded = null; // for de-serialization only
}

VectorCostume.prototype.toString = function () {
    return 'a VectorCostume(' + this.name + ')';
};

// VectorCostume duplication

VectorCostume.prototype.copy = function () {
    var img = new Image(),
        cpy,
        myself = this;
    img.src = this.contents.src;
    cpy = new VectorCostume(img, this.name ? copy(this.name) : null);
    cpy.rotationCenter = this.rotationCenter.copy();
    this.vectorObjects.forEach(function(each) {
        cpy.vectorObjects.push(each.copy());
    });
    return cpy;
};

VectorCostume.prototype.edit = function (aWorld, anIDE, isnew, oncancel, onsubmit) {
    var myself = this,
        editor = new VectorialPaintEditorMorph();
    editor.oncancel = oncancel || nop;
    editor.openIn(
        aWorld,
        isnew ?
                newCanvas(StageMorph.prototype.dimensions) : 
                this.contents,
        isnew ?
                new Point(240, 180) :
                this.rotationCenter,
        function (img, rc) {
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
            (onsubmit || nop)();
        }
    );
};
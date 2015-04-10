// Smart Proxy Pattern
// ===================
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
				myself.oldim, // ← Imatge nova!!! nou HTMLCanvasElement en blanc!!!
				new Point(240, 180),

				// Aquesta funció ha de guardar la nova imatge allà on toqui
				// Haurem de guardar-nos la referència a l'sprite d'alguna manera
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
				});
	  		myself.cancel();
		}
    ));

    this.edits.fixLayout();
};

var SvgPaintEditorMorph;

// SvgPaintEditorMorph //////////////////////////

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

    // initialize inherited properties:
    SvgPaintEditorMorph.uber.init.call(this);

    // override inherited properties:
    this.labelString = "SVG Paint Editor";
    this.createLabel();

    // build contents:
    this.buildContents(); // ← S'haurà de sobreescriure aquesta funció
};


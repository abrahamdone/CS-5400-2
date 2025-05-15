// ------------------------------------------------------------------
// 
// This is the graphics object.  It provides a pseudo pixel rendering
// space for use in demonstrating some basic rendering techniques.
//
// ------------------------------------------------------------------
MySample.graphics = (function(pixelsX, pixelsY, showPixels) {
    'use strict';

    const canvas = document.getElementById('canvas-main');
    const context = canvas.getContext('2d', { alpha: false });

    const deltaX = canvas.width / pixelsX;
    const deltaY = canvas.height / pixelsY;

    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();

        //
        // Draw a very light background to show the "pixels" for the framebuffer.
        if (showPixels) {
            context.save();
            context.lineWidth = .1;
            context.strokeStyle = 'rgb(150, 150, 150)';
            context.beginPath();
            for (let y = 0; y <= pixelsY; y++) {
                context.moveTo(1, y * deltaY);
                context.lineTo(canvas.width, y * deltaY);
            }
            for (let x = 0; x <= pixelsX; x++) {
                context.moveTo(x * deltaX, 1);
                context.lineTo(x * deltaX, canvas.width);
            }
            context.stroke();
            context.restore();
        }
    }

    //------------------------------------------------------------------
    //
    // Public function that renders a "pixel" on the framebuffer.
    //
    //------------------------------------------------------------------
    function drawPixel(x, y, color) {
        x = Math.trunc(x);
        y = Math.trunc(y);

        context.fillStyle = color;
        context.fillRect(x * deltaX, y * deltaY, deltaX, deltaY);
    }

    //------------------------------------------------------------------
    //
    // Helper function used to draw an X centered at a point.
    //
    //------------------------------------------------------------------
    function drawPoint(x, y, ptColor) {
        x = Math.trunc(x);
        y = Math.trunc(y);

        drawPixel(x - 1, y - 1, ptColor);
        drawPixel(x + 1, y - 1, ptColor);
        drawPixel(x, y, ptColor);
        drawPixel(x + 1, y + 1, ptColor);
        drawPixel(x - 1, y + 1, ptColor);
    }

    //------------------------------------------------------------------
    //
    // Bresenham line drawing algorithm.
    //
    //------------------------------------------------------------------
    function drawLine(x1, y1, x2, y2, color) {
        // vertical line would divide by 0 so special case
        if (x1 == x2) {
            let y = Math.min(y1, y2);
            let d = Math.abs(y2 - y1);
            for (let i = 0; i < d; i++) {
                drawPixel(x1, y + i, color);
            }
            return;
        }

        let o = octant(x1, y1, x2, y2);
        // adjust for octant
        // octant 5-7 are mirrored over x-axis so swap start and end points
        if (o >= 4) {
            [x1, x2] = [x2, x1];
            [y1, y2] = [y2, y1];
            o = o - 4;
        }
        switch (o) {
            case 0:
                // mirror over x = y
                [x1, y1, x2, y2] = [y1, x1, y2, x2];
                break;
            case 1:
                // no change
                break;
            case 2:
                // mirror over y-axis
                [y1, y2] = [-y1, -y2];
                break;
            case 3:
                // mirror over x = y and y-axis
                [x1, y1, x2, y2] = [-y1, x1, -y2, x2];
                break;
        }

        let dx = x2 - x1;
        let dy = y2 - y1;
        let pk = 2 * dy - dx;

        // start from origin
        let x = 0;
        let y = 0;

        while (x <= Math.abs(x2 - x1)) {
            // draw pixel adjusted for octant
            // move back from origin (add x1 and y1)
            // also reverse mirror operations for specific octant
            switch (o) {
                case 0:
                    drawPixel(y + y1, x + x1, color);
                    break;
                case 1:
                    drawPixel(x + x1, y + y1, color);
                    break;
                case 2:
                    drawPixel(x + x1, -y - y1, color);
                    break;
                case 3:
                    drawPixel(y + y1, -x - x1, color);
                    break;
            }
            // calculate p_(k + 1)
            if (pk >= 0) {
                y = y + 1;
                pk = pk + 2 * dy - 2 * dx;
            } else {
                pk = pk + 2 * dy;
            }
            x = x + 1;
        }
    }

    //------------------------------------------------------------------
    //
    // Find the quadrant the slope lies in.
    //
    //------------------------------------------------------------------
    function octant(x1, y1, x2, y2) {
        let m = (y2 - y1) / (x2 - x1);
        let o = x2 > x1 ? 0 : 4;

        if (m >= 0) {
            if (m >= 1) {
                return o;
            } else {
                return o + 1;
            }
        } else {
            if (m >= -1) {
                return o + 2;
            } else {
                return o + 3;
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Renders an Hermite curve based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawCurveHermite(controls, segmentColors, showPoints, showLine, showControl) {
        if (segmentColors.length === 0) {
            return;
        }
        let u = 0.0;
        let du = 1 / segmentColors.length;
        let segmentPoints = [];

        for (let i = 0; i < segmentColors.length; i++) {
            let xu = hermiteBlending(controls.start.x, controls.controlOne.x, controls.end.x, controls.controlTwo.x, u);
            let yu = hermiteBlending(controls.start.y, controls.controlOne.y, controls.end.y, controls.controlTwo.y, u);

            segmentPoints.push({x: xu, y: yu});
            u += du;
        }

        segmentPoints.push(controls.end);

        drawSegments(controls, segmentPoints, segmentColors, showPoints, showLine, showControl);
    }

    function hermiteBlending(p0, pp0, p1, pp1, u) {
        return p0 * (2 * u ** 3 - 3 * u ** 2 + 1)
            + p1 * (-2 * u ** 3 + 3 * u ** 2)
            + pp0 * (u ** 3 - 2 * u ** 2 + u)
            + pp1 * (u ** 3 - u ** 2);
    }

    //------------------------------------------------------------------
    //
    // Renders a Cardinal curve based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawCurveCardinal(controls, segmentColors, showPoints, showLine, showControl) {
        if (segmentColors.length === 0) {
            return;
        }
        let u = 0.0;
        let du = 1 / segmentColors.length;
        let segmentPoints = [];
        let s = (1 - controls.tension) / 2;

        for (let i = 0; i < segmentColors.length; i++) {
            let xu = cardinalBlending(controls.controlOne.x, controls.start.x, controls.end.x, controls.controlTwo.x, s, u);
            let yu = cardinalBlending(controls.controlOne.y, controls.start.y, controls.end.y, controls.controlTwo.y, s, u);

            segmentPoints.push({x: xu, y: yu});
            u += du;
        }

        segmentPoints.push(controls.end);

        drawSegments(controls, segmentPoints, segmentColors, showPoints, showLine, showControl);
    }

    function cardinalBlending(pk_1, pk, pk1, pk2, s, u) {
        return pk_1 * (-s * u ** 3 + 2 * s * u ** 2 - s * u)
            + pk * ((2 - s) * u ** 3 + (s - 3) * u ** 2 + 1)
            + pk1 * ((s - 2) * u ** 3 + (3 - 2 * s) * u ** 2 + s * u)
            + pk2 * (s * u ** 3 - s * u ** 2);
    }

    //------------------------------------------------------------------
    //
    // Renders a Bezier curve based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawCurveBezier(controls, segmentColors, showPoints, showLine, showControl) {

        drawSegments(controls, [controls.start, controls.end], segmentColors, showPoints, showLine, showControl);
    }

    //------------------------------------------------------------------
    //
    // Renders a set of line segments based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawSegments(controls, segmentPoints, segmentColors, showPoints, showLine, showControl) {
        if (showControl) {
            drawPoint(controls.controlOne.x, controls.controlOne.y, 'rgb(180, 180, 180)');
            drawPoint(controls.controlTwo.x, controls.controlTwo.y, 'rgb(180, 180, 180)');
        }
        if (showPoints) {
            for (let i = 0; i < segmentPoints.length; i++) {
                drawPoint(segmentPoints[i].x, segmentPoints[i].y, 'rgb(255, 255, 255)');
            }
        }
        if (showLine) {
            for (let i = 0; i < segmentColors.length; i++) {
                drawLine(segmentPoints[i].x, segmentPoints[i].y, segmentPoints[i + 1].x, segmentPoints[i + 1].y, segmentColors[i]);
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Entry point for rendering the different types of curves.
    // I know a different (functional) JavaScript pattern could be used
    // here.  My goal was to keep it looking Java or C++'ish to keep it familiar
    // to those not experts in JavaScript.
    //
    //------------------------------------------------------------------
    function drawCurve(type, controls, segmentColors, showPoints, showLine, showControl) {
        switch (type) {
            case api.Curve.Hermite:
                drawCurveHermite(controls, segmentColors, showPoints, showLine, showControl);
                break;
            case api.Curve.Cardinal:
                drawCurveCardinal(controls, segmentColors, showPoints, showLine, showControl);
                break;
            case api.Curve.Bezier:
                drawCurveBezier(controls, segmentColors, showPoints, showLine, showControl);
                break;
        }
    }

    //
    // This is what we'll export as the rendering API
    const api = {
        clear: clear,
        drawPixel: drawPixel,
        drawLine: drawLine,
        drawCurve: drawCurve
    };

    Object.defineProperty(api, 'sizeX', {
        value: pixelsX,
        writable: false
    });
    Object.defineProperty(api, 'sizeY', {
        value: pixelsY,
        writable: false
    });
    Object.defineProperty(api, 'Curve', {
        value: Object.freeze({
            Hermite: 0,
            Cardinal: 1,
            Bezier: 2
        }),
        writable: false
    });

    return api;
}(500, 500, true));

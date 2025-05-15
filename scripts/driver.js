
MySample.main = (function(graphics) {
    'use strict';

    let previousTime = performance.now();
    let start = {x: graphics.sizeX / 4, y: graphics.sizeY / 4};
    let end = {x: graphics.sizeX / 4 * 3, y: graphics.sizeY / 4 * 3};
    let controlOne = {x: graphics.sizeX / 2, y: graphics.sizeY / 4};
    let controlTwo = {x: graphics.sizeX / 2, y: graphics.sizeY / 4 * 3};
    let segments = 1000;
    let nextHue = 0;
    let colors = [];
    let frameBuffer = 0;

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        frameBuffer += 1;
        if (frameBuffer < 50) {
            return;
        }
        colors.length = 0;
        for (let i = 0; i < segments; i += 1) {
            colors.push(`hsl(${nextHue}, 80%, 50%)`);
            if (nextHue > 360) {
                nextHue = 0;
            }
            nextHue += 1;
        }
        frameBuffer = 0;
    }

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();
        graphics.drawCurve(
            graphics.Curve.Hermite,
            {
                start: start,
                end: end,
                controlOne: controlOne,
                controlTwo: controlTwo
            },
            colors,
            false,
            true,
            true
        );
        // graphics.drawLine(start.x, start.y, end.x, end.y, 'rgb(255,255,255)');
    }

    //------------------------------------------------------------------
    //
    // This is the animation loop.
    //
    //------------------------------------------------------------------
    function animationLoop(time) {

        const elapsedTime = time - previousTime;
        previousTime = time;
        update(elapsedTime);
        render();

        requestAnimationFrame(animationLoop);
    }

    console.log('initializing...');
    requestAnimationFrame(animationLoop);

}(MySample.graphics));

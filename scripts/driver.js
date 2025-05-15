
MySample.main = (function(graphics) {
    'use strict';

    let previousTime = performance.now();
    let start = {x: graphics.sizeX / 4, y: graphics.sizeY / 2};
    let end = {x: 3 * graphics.sizeX / 4, y: graphics.sizeY / 2};
    let controlOne = {x: graphics.sizeX / 4, y: 3 * graphics.sizeY / 4};
    let controlTwo = {x: 3 * graphics.sizeX / 4, y: 3 * graphics.sizeY / 4};
    let segments = 1;
    let nextHue = 0;
    let colors = [];
    let frameBuffer = 0;

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        // frameBuffer += 1;
        // if (frameBuffer < 50) {
        //     return;
        // }
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
            graphics.Curve.Cardinal,
            {
                start: start,
                end: end,
                controlOne: controlOne,
                controlTwo: controlTwo,
                tension: 2
            },
            colors,
            false,
            true,
            true
        );
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

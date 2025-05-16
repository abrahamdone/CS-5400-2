
MySample.main = (function(graphics) {
    'use strict';

    let previousTime = performance.now();
    let start = {x: graphics.sizeX * 0.1, y: graphics.sizeY * 0.5};
    let end = {x: graphics.sizeX * 0.9, y: graphics.sizeY * 0.5};
    let controlOne = {x: graphics.sizeX * 0.1, y: -graphics.sizeY * 0.75};
    let controlTwo = {x: graphics.sizeX * 0.1, y: graphics.sizeY * 0.75};
    let segments = 100;
    let startHue = 0;
    let colors = [];
    let frameBuffer = 0;

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        colors.length = 0;
        startHue += 1;
        if (startHue > 360) {
            startHue = 0;
        }
        let nextHue = startHue;
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
                controlTwo: controlTwo,
                tension: 0
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

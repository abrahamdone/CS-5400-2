
MySample.main = (function(graphics) {
    'use strict';

    let previousTime = performance.now();
    let start = {x: -0.8, y: 0.0};
    let end = {x: 0.8, y: 0.0};
    let controlOne = {x: 0.2, y: -0.5};
    let controlTwo = {x: -0.2, y: 0.5};
    let segments = 100;
    let startHue = 0;
    let colors = [];
    let curve = graphics.Curve.Hermite;
    let display = 0.0;
    let displayMultiplier = 5000.0;

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        if (display <= 0) {
            colors.length = 0;
            for (let i = 0; i < segments; i += 1) {
                colors.push(`rgb(255, 255, 255)`);
            }
        }

        if (display < displayMultiplier) {
            curve = graphics.Curve.Hermite;
            display += elapsedTime;
        } else if (display < 2 * displayMultiplier) {
            curve = graphics.Curve.Cardinal;
            display += elapsedTime;
        } else if (display < 3 * displayMultiplier) {
            curve = graphics.Curve.Bezier;
            display += elapsedTime;
        } else if (display < 4 * displayMultiplier) {
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

            let random0 = (Math.floor(Math.random() * 3) - 1) * 0.005;
            let random1 = (Math.floor(Math.random() * 3) - 1) * 0.005;
            let random2 = (Math.floor(Math.random() * 3) - 1) * 0.005;
            let random3 = (Math.floor(Math.random() * 3) - 1) * 0.005;
            controlOne = {
                x: Math.max(-1, Math.min(1, controlOne.x + random0)),
                y: Math.max(-1, Math.min(1, controlOne.y + random1))
            };
            controlTwo = {
                x: Math.max(-1, Math.min(1, controlTwo.x + random2)),
                y: Math.max(-1, Math.min(1, controlTwo.y + random3))
            };
        }
    }

    function convertWorldTODevice(point) {
        return {
            x: math.floor(graphics.sizeX / 2 + point.x * graphics.sizeX / 2),
            y: math.floor(graphics.sizeY / 2 + point.y * graphics.sizeY / 2)
        };
    }

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();
        graphics.drawCurve(
            curve,
            {
                start: convertWorldTODevice(start),
                end: convertWorldTODevice(end),
                controlOne: convertWorldTODevice(controlOne),
                controlTwo: convertWorldTODevice(controlTwo),
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

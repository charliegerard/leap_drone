Description
=======================

Control a Parrot AR Drone 2.0 using a Leap Motion.

How to Fly
=======================

(TODO: Need to improve commands. May be really sensitive.)

1. To takeoff, hold hand over Leap Motion.
2. Keeping fingers together, move hand right to move drone right, left to move drone left, up to move drone up, down to move drone down, forward to move drone forward and backward to move drone backwards.
3. To rotate, make a circle with pointer finger in a clockwise or counterclockwise motion.
4. To land, remove hand.

Stack
=======================

Node.js for server
Express for web app deployment
Faye for publishing and subscribing between leap, server and drone
Leap.js for converting leap motions into javascript
jQuery for browser displays

Learn More
=======================

I also recreated the same project using the Cylon.js framework. You can find a tutorial for this here: https://charliegerard.wordpress.com/2015/01/20/drone-leap-motion-cylon-js/

Next steps
=======================

Improve the commands to make the 'stop' functionality work.
Change the gesture to take off and land.
Pair with the Myo armband.

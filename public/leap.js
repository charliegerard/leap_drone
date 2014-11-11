var controller, flying, speed, faye, timeout, speedAdjuster, stopped;

var droneCommandsHandler = function () {
  console.log("do i even get in leapjs?")
  console.log('this is so weird');

  faye = new Faye.Client("/faye", {
    timeout: 60 // may need to adjust. If server doesn't send back any data for the given period of time, the client will assume the server has gone away and will attempt to reconnect. Timeout is given in seconds and should be larger than timeout on server side to give the server ample time to respond.
  });

  flying = false; // used to prevent action while drone is dormant
  timeout = 400;  // used for each server publish
  speedAdjuster = 2.5; // higher number decreases action speed.  DO NOT set to less than 1

  var mainRoutine = function (frame) { // Runs on every frame
    gestureHandler(frame);
    flyingDrone(frame);
    handPos(frame);
  };

  var takeoff = function () {
  	flying = true;
  	return faye.publish("/drone/drone", {
      action: 'takeoff'
    });
  };

  var land = function () {
  	flying = false;	// prevents faye from publishing actions when drone has landed
  	return faye.publish("/drone/drone", {
      action: 'land'
    });
  };

  var goLeft = function(){
    console.log('going left');
    stopped = false;
    $(".left").attr({id: 'highlight'})
    $(".right").attr({id: ''})
    setTimeout(function (){
      return faye.publish("/drone/move", {
        action: 'left'
        // speed: adjustXspeed
      })
    }, timeout);
  };

  var goRight = function(){
    console.log('going right');
    stopped = false;
    $(".right").attr({id: 'highlight'})
    $(".left").attr({id: ''})
    setTimeout(function (){
      return faye.publish("/drone/move", {
        action: 'right'
            // speed: adjustXspeed
      })
    }, timeout);
  };

  var goUp = function(){
    stopped = false;
    $(".up").attr({id: 'highlight'})
    $(".down").attr({id: ''})
    setTimeout(function (){
      return faye.publish("/drone/move", {
        action: 'up'
        // speed: adjustYspeed
      })
    }, timeout/2);
  };

  var goDown = function(){
    stopped = false;
    $(".down").attr({id: 'highlight'})
    $(".up").attr({id: ''})
    setTimeout(function (){
      return faye.publish("/drone/move", {
        action: 'down'
        // speed: adjustYspeed
      })
    }, timeout/2);
  };

  var goForward = function(){
    console.log('going forward');
    stopped = false;
    $(".front").attr({id: 'highlight'})
    $(".back").attr({id: ''})
    setTimeout(function (){
      return faye.publish("/drone/move", {
        action: 'front'
        // speed: adjustZspeed
      })
    }, timeout/3);
  };

  var goBackwards = function(){
    stopped = false;
    $(".back").attr({id: 'highlight'})
    $(".front").attr({id: ''})
    setTimeout(function (){
      return faye.publish("/drone/move", {
        action: 'back'
        // speed: adjustZspeed
      })
    }, timeout/3);
  };

  var stopDrone = function(){
    console.log('stooooooooop')
    stopped = true;
    setTimeout(function (){
      return faye.publish("/drone/drone", {
        action: 'stop'
      })
    }, timeout);
  };

  var handPos = function (frame) {
    var hands = frame.hands
    if (hands.length === 0 && !stopped) {
      stopDrone();
    } else if (hands.length > 0){
      var handOne = hands[0];
      var position = handOne.palmPosition;
      var xPosition = position[0];
      var yPosition = position[1];
      var zPosition = position[2];

      var adjustX = xPosition / 250; // -1.5 to 1.5
      var adjustXspeed = Math.abs(adjustX)/ speedAdjuster; // left/right speed
      var adjustY = (yPosition - 60) / 500; // 0 to .8
      var adjustYspeed = Math.abs(.4-adjustY) // up/down speed
      var adjustZ = zPosition / 250; // -2 to 2
      var adjustZspeed = Math.abs(adjustZ) / speedAdjuster; // front/back speed

      if (adjustX < 0 && flying) {
        return goLeft();
      } else if (adjustX > 0 && flying) {
        return goRight();
      }

      if (adjustY > 0.4 && flying) {
        return goUp();
      } else if (adjustY < 0.4 && flying) {
        return goDown();
      }

      if (adjustZ < 0 && flying) {
        return goForward();
      } else if (adjustZ > 0 && flying) {
        return goBackwards();
      }
    };
  };

  var gestureHandler = function (frame) { // handles rotation
    var gestures = frame.gestures;
    if (gestures && gestures.length > 0) {
      stopped = false;
      for( var i = 0; i < gestures.length; i++ ) {
        var gesture = gestures[i];
        if (gesture.type === 'circle' && gesture.state === 'start' && flying) {
          gesture.pointable = frame.pointable(gesture.pointableIds[0]);
          direction = gesture.pointable.direction;
          if(direction) {
            var normal = gesture.normal;
            clockwisely = Leap.vec3.dot(direction, normal) > 0;
            if(clockwisely) {
              return clockwise();
            } else {
              return counterClockwise();
            };
          };
        };
      };
    };
  };

  var flyingDrone = function(frame){
    if(frame.hands.length > 0){
      takeoff();
      console.log('taking off');
    } else {
      land();
      console.log('landing');
    };
  };

  speed = 0.5; // used for rotation speed
  var counterClockwise = function () {
    $(".counterClockwise").attr({id: 'highlight'})
    $(".clockwise").attr({id: ''})
    faye.publish("/drone/move", {
      action: 'counterClockwise',
      speed: speed
    })
    setTimeout(function (){
      return faye.publish("/drone/drone", {
        action: 'stop'
      })
    }, timeout);
  };

  var clockwise = function () {
    $(".clockwise").attr({id: 'highlight'})
    $(".counterClockwise").attr({id: ''})
    faye.publish("/drone/move", {
      action: 'clockwise',
      speed: speed
    })
    setTimeout(function (){
      return faye.publish("/drone/drone", {
        action: 'stop'
      })
    }, timeout);
  };

  Leap.loop({ enableGestures: true }, mainRoutine);

};

droneCommandsHandler();
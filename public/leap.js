var flying, speed, faye, timeout, speedAdjuster, stopped;
var direction = "?";
var pastDirection;

var controller = Leap.loop({frameEventName:'deviceFrame', enableGestures:true});

var droneCommandsHandler = function () {

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
        // speed: speedAdjuster
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
            // speed: speedAdjuster
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
        // speed: speedAdjuster
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
        // speed: speedAdjuster
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
        // speed: speedAdjuster
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
        // speed: speedAdjuster
      })
    }, timeout/3);
  };

  var stopDrone = function(){
    console.log('STOP')
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
      var previousFrame = controller.frame(1);
      var handOne = hands[0];
      var movement = handOne.translation(previousFrame);
      pastDirection = direction;

      if(movement[0] > 4){
        direction = 'RIGHT'
      } else if(movement[0] < -4){
        direction = 'LEFT'
      }

      if(movement[1] > 4){
        direction = 'UP'
      } else if(movement[1] < -4){
        direction = 'DOWN'
      }

      if(movement[2] > 4){
        direction = 'REVERSE'
      } else if(movement[2] < -4){
        direction = 'FORWARD'
      }

      if(pastDirection != direction){
        switch (direction) {
          case 'LEFT':
            goLeft();
            break;
          case 'RIGHT':
            goRight();
            break;
          case 'UP':
            goUp();
            break;
          case 'DOWN':
            goDown();
            break;
          case 'FORWARD':
            goForward();
            break;
          case 'REVERSE':
            goBackwards();
            break;
        }
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
    if(frame.hands.length > 0 && !flying){
      takeoff();
      console.log('taking off');
    } else if(frame.hands.length === 0 && flying){
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

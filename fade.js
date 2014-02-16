function State(properties, speed, treshold) {
    this.properties = properties;
    this.speed = speed || 0.1;
    this.treshold = treshold || 0.5;
}

State.prototype.entering = null;
State.prototype.entered = null;
State.prototype.leaving = null;
State.prototype.left = null;

function tween(object, state) {
    if(object.state) {
        if(object.state.leaving) object.state.leaving(object);
        if(object.state.left) {
            object.leavingStates = object.leavingStates || [];
            object.leavingStates.push(object.state);
        }
    }
    object.state = state;
    if(object.state.entering) object.state.entering(object);
};

function tweenStep(object) {
    if(!object.state) return;
    var done = true;
    for(var k in object.state.properties) {
        var d = object.state.properties[k] - object[k];
        if(Math.abs(d) > object.state.treshold) done = false;
        object[k] += d * object.state.speed;
    }
    if(done) {
        for(var k in object.state.properties) {
            object[k] = object.state.properties[k];
        }
        if(object.leavingStates)
            for(var i = 0; i < object.leavingStates.length; ++i)
                object.leavingStates[i].left(object);
        if(object.state.entered) object.state.entered(object);
    }
};
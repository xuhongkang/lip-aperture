// ZoomController.js
// Version: 0.0.1
// Event: Initialized
// Description: creates screen space zoom effect.
// Pack: Refinement Pack

// @input float zoomAmount {"widget":"slider", "min":0.0, "max":1.0, "step":0.01}
// @input SceneObject target
//@ui {"widget":"separator"}
// @input Component.Camera camera
// @input Asset.Material material

var properties = ["x", "y", "z", "w"];
var pass;
var centerProperty = "center";
var zoomProperty = "zoom";
var init = false;
var targetTransform;

function initialize() {
    if (validateInputs()) {
        pass = script.material.mainPass;
        
        var zoomValue = Math.abs(1 - script.zoomAmount);
        pass[zoomProperty] = new vec2(zoomValue,zoomValue);
        
        targetTransform = script.target.getTransform();
        init = true;
    }
}

function onUpdate() {
    if (!init) {
        return;
    }
    
    var screenPoint = script.camera.worldSpaceToScreenSpace(targetTransform.getWorldPosition());
    var parentPoint = new vec2(screenPoint.x-.5,.5-screenPoint.y).uniformScale(2.0);
    pass[centerProperty] = parentPoint;
}

function validateInputs() {
    if (!script.target) {
        showError("Please make sure to set a target for zoom.");
        return false;
    }
    if (!script.camera) {
        showError("Please make sure to set the main camera.");
        return false;
    }
    if (!script.material) {
        showError("Please make assign a material to the script.");
        return false;
    }
    if (script.material.mainPass[centerProperty] == undefined) {
        showError("Material " + script.material.name + " doesn't have a " + centerProperty + " property");
        return false;
    }
    if (!typeIsMatching(vec2.zero(), script.material.mainPass[centerProperty])) {
        showError("Material property needs to be vector2, Please select a pass that has a vector2 input.");
        return false;
    }
    if (script.material.mainPass[zoomProperty] == undefined) {
        showError("Material " + script.material.name + " doesn't have a " + zoomProperty + " property");
        return false;
    }
    if (!typeIsMatching(vec2.zero(), script.material.mainPass[zoomProperty])) {
        showError("Material property needs to be vector2, Please select a pass that has a vector2 input.");
        return false;
    }
    return true;
}

// Print custom error logs
function showError(message) {
    print("ZoomController, ERROR: " + message);
}

function typeIsMatching(val, prop) {
    if (typeof val == "number" && typeof prop == "number") {
        return true;
    } else {
        var haveSameProperty = false;
        for (var i = 0; i < properties.length; i++) {
            if ((val[properties[i]] == undefined) == (prop[properties[i]] == undefined)) {
                if (val[properties[i]] != undefined) {
                    haveSameProperty = true;
                }
            } else {
                return false;
            }
        }
        return haveSameProperty; // have at least one matching property
    }
}

initialize();

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);
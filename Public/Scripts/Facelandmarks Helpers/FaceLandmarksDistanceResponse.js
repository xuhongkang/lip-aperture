// FaceLandmarksDistanceResponse.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Translate data from LandmarksDistanceTrigger.js script to blandshapes, position or scale.

// @input Component.ScriptComponent distanceScript {"label":"Distance Script"}
//@ui {"widget":"separator"}

// @input int mode {"widget":"combobox", "values":[{"label":"Transform", "value":0}, {"label":"Blendshapes", "value":1}, {"label":"Opacity", "value":2}]}

//@ui {"widget":"group_start", "label":"Transform Properties", "showIf" : "mode", "showIfValue" : 0}
// @input int transformMode {"widget":"combobox", "values":[{"label":"Position", "value":0}, {"label":"Scale", "value":1}]}
// @input SceneObject[] objects {"label" : "Object"}
// @input vec3 multiplier = {1,1,1} {"label" : "Axis Multiplier"}
//@ui {"widget":"group_end"}

//@ui {"widget":"group_start", "label":"Blendshape Properties", "showIf" : "mode", "showIfValue" : 1}
// @input Component.BlendShapes[] blendshapeObject {"label" : "Blendshape"}
// @input string blendshapeName {"label" : "Name"}
// @input bool invert
//@ui {"widget":"group_end"}

//@ui {"widget":"group_start", "label":"Opacity Properties", "showIf" : "mode", "showIfValue" : 2}
// @input Component.MaterialMeshVisual[] meshObj {"label" : "Mesh Visual Objects"}
//@ui {"widget":"group_end"}


var getDistanceFunc = null;
var isInitialized = false;
var objTransform = [];
var meshPasses = [];
var meshColor = [];
var blendshapes = [];
var finalBlendValue = 0.0;
var modifiedTransform = vec3.zero();

function onLensTurnOn() {
    if (validateInputs()) {
        setInputs();
        isInitialized = true;
        
    }
}

function onUpdate() {
    if (isInitialized) {
        updateBlendShapes();
        updateObjectTransform();
        updateOpacity();
    }
}


function updateObjectTransform() {
    if (script.mode == 0) {
        if (script.transformMode == 0) {
            for (var i = 0; i < objTransform.length; i++) {
                objTransform[i].setLocalPosition(getModifiedTransform());
            }
        }

        if (script.transformMode == 1) {
            for (var j = 0; j < objTransform.length; j++) {
                objTransform[j].setLocalScale(getModifiedTransform());
            }
        }
    }
}

function getModifiedTransform() {
    var distance = getDistanceFunc();

    modifiedTransform.x = distance * script.multiplier.x;
    modifiedTransform.y = distance * script.multiplier.y;
    modifiedTransform.z = distance * script.multiplier.z;

    return modifiedTransform;
}

function updateBlendShapes() {
    if (script.mode == 1) {
        if (script.invert) {
            finalBlendValue = 1 - getDistanceFunc();
        } else {
            finalBlendValue = getDistanceFunc();
        }

        for (var i = 0; i < blendshapes.length; i++) {
            blendshapes[i].setBlendShape(script.blendshapeName, finalBlendValue);
        }
    }
}

function updateOpacity() {
    if (script.mode == 2) {
        for (var i = 0; i < meshPasses.length; i++) {
            meshPasses[i].baseColor = getColorWithAlpha(meshColor[i], getDistanceFunc());
        }
    }
}

function getColorWithAlpha(color, alpha) {
    return new vec4(color.x, color.y, color.z, alpha);
}

function validateInputs() {
    if (!script.distanceScript) {
        print("FaceLandmarksDistanceResponse, ERROR: Please make sure Distance script exist and assign the script component to this script");
        return false;
    }
    
    if (!script.distanceScript.api || !script.distanceScript.api.getDistance) {
        print("FaceLandmarksDistanceResponse, ERROR: Please make sure the Distance script contains the getDistance api");
        return false;
    }

    if (script.mode == 0) {
        if (script.objects.length == 0) {
            print("FaceLandmarksDistanceResponse, ERROR: Please make sure to assign Object(s) to the script");
            return false;
        }
    } else if (script.mode == 1) {
        if (script.blendshapeObject.length == 0) {
            print("FaceLandmarksDistanceResponse, ERROR: Please make sure to assign object(s) with a blendshape component on it to the script");
            return false;
        }

        if (script.blendshapeName.length == 0) {
            print("FaceLandmarksDistanceResponse, ERROR: Please make sure to assign a blendshape name to the script");
            return false;
        }
    } else {
        if (script.meshObj.length == 0) {
            print("FaceLandmarksDistanceResponse, ERROR: Please make sure to assign object(s) with a mesh visual component on it to the script");
            return false;
        }
    }
    

    return true;
}

function setInputs() {
    if (script.mode == 0) {
        for (var i = 0; i < script.objects.length; i++) {
            if (script.objects[i]) {
                objTransform[i] = script.objects[i].getTransform();
            }
        }
    } else if (script.mode == 1) {
        for (var j = 0; j < script.blendshapeObject.length; j++) {
            if (script.blendshapeObject[j]) {
                blendshapes[j] = script.blendshapeObject[j];
            }
        }
    } else {
        for (var k = 0; k < script.meshObj.length; k++) {
            if (script.meshObj[k]) {
                meshPasses[k] = script.meshObj[k].mainPass;
                meshColor[k] = new vec3(meshPasses[k].baseColor.x,
                    meshPasses[k].baseColor.y,
                    meshPasses[k].baseColor.z);
            }
        }
    }
    
    getDistanceFunc = script.distanceScript.api.getDistance;
}


var turnOnEvent = script.createEvent("TurnOnEvent");
turnOnEvent.bind(onLensTurnOn);

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

// PinToFaceLandmarks.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: This is the main script which attach the children of the objects to landmarks.

// @input int placementMode {"widget":"combobox", "values":[{"label":"Stick In Between Points", "value":0}, {"label":"Spawn At Each Points", "value":1}]}
// @input int pointsMode {"widget":"combobox", "values":[{"label":"Custom Points", "value":0}, {"label":"Predefined Points", "value":1}]}
// @input int[] points = 0 {"showIf" : "pointsMode", "showIfValue":0}
// @input int predefinedPoints {"label": "Defined Points", "showIf" : "pointsMode", "showIfValue":1, "widget":"combobox", "values":[{"label":"Forehead", "value":0}, {"label":"Left Top Eyelid", "value":1}, {"label":"Left Bottom Eyelid", "value":2}, {"label":"Left Eyebrow", "value":3}, {"label":"Left Pupil", "value":4}, {"label":"Lower Face", "value":5}, {"label":"Lower Lip", "value":6}, {"label":"Mouth", "value":7}, {"label":"Nose Bridge", "value":8}, {"label":"Nose Tip", "value":9}, {"label":"Right Top Eyelid", "value":10}, {"label":"Right Bottom Eyelid", "value":11}, {"label":"Right Eyebrow", "value":12}, {"label":"Right Pupil", "value":13}, {"label":"Upper Lip", "value":14}]}
// @input vec3 positionOffset {"label": "Offset"}

//@ui {"widget":"separator"}

// @input Component.Camera camera
// @input Component.Head headBinding

var disableRotation = false;
var isInitialized = false;
var childTransform = [];
var landmarksPoint = [];
var duplicatedObjects = [];
var thisSceneObject;
var childCount;
var headBindingTransform;
var selectedPoints = [];
var pointsWorldPos = [];
var isFaceTracking = false;
var customPoints = [[68,69,70,71,72,73,74],
    [36,37,38,39],
    [36,39,40,41],
    [17,18,19,20,21],
    [75,76,77,78,79,80,81,82,83],
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
    [48,54,55,56,57,58,59],
    [60,61,62,63,64,65,66,67],
    [27,28,29,30],
    [31,32,33,34,35],
    [42,43,44,45],
    [42,45,46,47],
    [22,23,24,25,26],
    [84,85,86,87,88,89,90,91,92],
    [48,49,50,51,52,53,54]];

                    
script.api.getPointsWorldPosition = getPointsWorldPosition;

function initialize() {
    if (validateInputs()) {
        setInputs();
        setEvents();
        isInitialized = true;
    }
}

function onUpdate() {
    if (isInitialized && isFaceTracking) {
        getLandmarkPoints(selectedPoints);
        pinToFaceLandmarks();
    }
}

function getLandmarkPoints(requestedPoints) {
    for (var i = 0; i < requestedPoints.length; i++) {
        landmarksPoint[i] = script.headBinding.getLandmark(requestedPoints[i]);
    }
}

function pinToFaceLandmarks() {
    if (script.placementMode == 0) {
        var landmarksCenter = getLandmarkCenter(landmarksPoint);
        var landmarkWorldCenter = script.camera.screenSpaceToWorldSpace(landmarksCenter, getDepth());
        landmarkWorldCenter = landmarkWorldCenter.add(new vec3(script.positionOffset.x, script.positionOffset.y, 0));

        for (var i = 0; i < childTransform.length; i++) {
            pointsWorldPos[i] = landmarkWorldCenter;

            if (!isNull(childTransform[i])) {
                childTransform[i].setWorldPosition(landmarkWorldCenter);

                if (!disableRotation) {
                    childTransform[i].setWorldRotation(headBindingTransform.getWorldRotation());
                }   
            }
        }
    } else {
        for (var j = 0; j < duplicatedObjects.length; j++) {
            pointsWorldPos[j] = script.camera.screenSpaceToWorldSpace(landmarksPoint[j], getDepth());
            pointsWorldPos[j] = pointsWorldPos[j].add(new vec3(script.positionOffset.x, script.positionOffset.y, 0));

            if (!isNull(duplicatedObjects[j])) {
                duplicatedObjects[j].getTransform().setWorldPosition(pointsWorldPos[j]);

                if (!disableRotation) {
                    duplicatedObjects[j].getTransform().setWorldRotation(headBindingTransform.getWorldRotation());
                }
            }
        }
    }
}

function getLandmarkCenter(points) {
    var center = vec2.zero();

    for (var i = 0; i < points.length; i++) {
        center = center.add(points[i]);
    }

    center.x = center.x / selectedPoints.length;
    center.y = center.y / selectedPoints.length;

    return center;
}

function getDepth() {
    return -(headBindingTransform.getLocalPosition().z + script.positionOffset.z);
}

function createObjects(count) {
    for (var i = 0; i < count; i++) {
        var childIndex = getIndex(i, childCount);

        if (i < childCount) {
            duplicatedObjects[i] = thisSceneObject.getChild(childIndex);
        } else {
            duplicatedObjects[i] = thisSceneObject.copyWholeHierarchy(thisSceneObject.getChild(childIndex));
        }
    }

    if (childCount > count) {
        for (var j = count; j < childCount; j++) {
            thisSceneObject.getChild(j).enabled = false;
        }
    }

    childCount = count;
}

function onFaceFound() {
    isFaceTracking = true;
    toggleAllObjects(isFaceTracking);
}

function onFaceLost() {
    isFaceTracking = false;
    toggleAllObjects(isFaceTracking);
}

function toggleAllObjects(isEnabled) {
    for (var i = 0; i < childCount; i++) {
        thisSceneObject.getChild(i).enabled = isEnabled;
    }
}

function getIndex(count, max) {
    var objectIndex = count % max;
    return objectIndex;
}

function setEvents() {
    var faceFoundEvent = script.createEvent("FaceFoundEvent");
    faceFoundEvent.faceIndex = script.headBinding.faceIndex;
    faceFoundEvent.bind(onFaceFound);

    var faceLostEvent = script.createEvent("FaceLostEvent");
    faceLostEvent.faceIndex = script.headBinding.faceIndex;
    faceLostEvent.bind(onFaceLost);

    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
}

function setInputs() {
    headBindingTransform = script.headBinding.getTransform();

    if (script.pointsMode == 0) {
        selectedPoints = script.points;
    } else {
        selectedPoints = customPoints[script.predefinedPoints];
    }
        
    if (script.placementMode == 1) {
        createObjects(selectedPoints.length);
    }

    for (var i = 0; i < childCount; i++) {
        childTransform[i] = thisSceneObject.getChild(i).getTransform();
    }

    toggleAllObjects(false);
}

function getPointsWorldPosition() {
    return pointsWorldPos;
}

function validateInputs() {
    thisSceneObject = script.getSceneObject();
    childCount = thisSceneObject.getChildrenCount();

    if (childCount == 0) {
        print("PinToFaceLandmarks:, ERROR: No Children found in  " + script.getSceneObject().name + " ,Please make sure to set your object as a children of the scene object.");
        return false;
    }

    if (!script.headBinding) {
        print("PinToFaceLandmarks, ERROR: Please make sure Head Binding object exist and assign the Head Binding object to the script");
        return false;
    }

    if (!script.camera) {
        print("PinToFaceLandmarks, ERROR: Please make sure main Camera object exist and assign the Camera object to the script");
        return false;
    }

    if (script.points.length == 0) {
        print("PinToFaceLandmarks, ERROR: Please add at least one attachment point number to the Points array");
        return false;
    }
    
    if (script.pointsMode == 0) {
        for (var i = 0; i < script.points.length; i++) {
            if (script.points[i] > 92 || script.points[i] < 0) {
                print("PinToFaceLandmarks, ERROR: Face points values must be between 0 and 92 inclusive, please make sure to choose numbers within that range.");
                return false;
            }
        }
    }
    
    return true;
}


initialize();
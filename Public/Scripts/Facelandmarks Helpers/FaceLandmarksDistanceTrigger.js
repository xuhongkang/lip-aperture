// FaceLandmarksDistanceTrigger.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Gets distance from two points or couple points as well as sending trigger to Behavior script.

// @input int pointsMode {"widget":"combobox", "values":[{"label":"Custom Points", "value": 0}, {"label":"Predefined Points", "value":1}]}
// @input int[] firstPoint = 0 {"showIf" : "pointsMode", "showIfValue" : 0, "label" : "First Landmarks Set"}
// @input int[] secondPoint = 0 {"showIf" : "pointsMode", "showIfValue" : 0, "label" : "Second Landmarks Set"}
// @input int firstPredefinedPoints {"label": "First Points", "showIf" : "pointsMode", "showIfValue":1, "widget":"combobox", "values":[{"label":"Forehead", "value":0}, {"label":"Left Top Eyelid", "value":1}, {"label":"Left Bottom Eyelid", "value":2}, {"label":"Left Eyebrow", "value":3}, {"label":"Left Pupil", "value":4}, {"label":"Lower Face", "value":5}, {"label":"Lower Lip", "value":6}, {"label":"Mouth", "value":7}, {"label":"Nose Bridge", "value":8}, {"label":"Nose Tip", "value":9}, {"label":"Right Top Eyelid", "value":10}, {"label":"Right Bottom Eyelid", "value":11}, {"label":"Right Eyebrow", "value":12}, {"label":"Right Pupil", "value":13}, {"label":"Upper Lip", "value":14}]}
// @input int secondPredefinedPoints {"label": "Second Points", "showIf" : "pointsMode", "showIfValue":1, "widget":"combobox", "values":[{"label":"Forehead", "value":0}, {"label":"Left Top Eyelid", "value":1}, {"label":"Left Bottom Eyelid", "value":2}, {"label":"Left Eyebrow", "value":3}, {"label":"Left Pupil", "value":4}, {"label":"Lower Face", "value":5}, {"label":"Lower Lip", "value":6}, {"label":"Mouth", "value":7}, {"label":"Nose Bridge", "value":8}, {"label":"Nose Tip", "value":9}, {"label":"Right Top Eyelid", "value":10}, {"label":"Right Bottom Eyelid", "value":11}, {"label":"Right Eyebrow", "value":12}, {"label":"Right Pupil", "value":13}, {"label":"Upper Lip", "value":14}]}

//@ui {"widget":"separator"}

// @input float minValue {"label" : "Min Distance"}
// @input float maxValue {"label" : "Max Distance"}
// @input bool smoothing
// @input float smoothingAmount {"widget":"slider", "min":0.01, "max":1.0, "step":0.01, "showIf" : "smoothing"}
// @input bool printDistance

//@ui {"widget":"separator"}

// @input bool customTrigger
//@ui {"widget":"group_start", "label":"Triggers", "showIf" : "customTrigger"}
// @input string minTrigger = "minTrigger"
// @input string maxTrigger = "maxTrigger"
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}

// @input Component.Head headBinding
// @input Component.Camera camera

var isInitialized = false;
var isFaceTracking = false;
var firstSelectedPoints = [];
var firstSetPosition = [];
var secondSelectedPoints = [];
var secondSetPosition = [];
var distance = 0.0;
var min = script.minValue;
var max = script.maxValue;
var normalizedDistance = 0.0;
var finalDistance = 0.0;
var currentSmoothedValue = 0.0;
var headBindingTransform;
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


script.api.getDistance = getDistance;

function onLensTurnOn() {
    if (validateInputs()) {
        setInputs();
        setEvents();
    }
}

function onUpdate() {
    if (isInitialized && isFaceTracking) {
        firstSetPosition = getLandmarkPosition(firstSelectedPoints);
        secondSetPosition = getLandmarkPosition(secondSelectedPoints);

        distance = getYDistance(firstSetPosition, secondSetPosition);
        normalizedDistance = normalize(distance);
        finalDistance = smoothValue(normalizedDistance);

        sendEvent(finalDistance);

        if (script.printDistance) {
            print("Distance: " + distance + "\n" +  "Adjust the Close and Open distance, so the value be 0 on close and 1 on open: " + finalDistance);
        }
    }
    
}

function sendEvent(currentValue) {
    if (script.customTrigger) {
        if (currentValue >= 1) {
            global.behaviorSystem.sendCustomTrigger(script.maxTrigger);
        }

        if (currentValue <= 0) {
            global.behaviorSystem.sendCustomTrigger(script.minTrigger);
        }
    }
}

function smoothValue(a) {
    if (script.smoothing) {
        currentSmoothedValue = lerp(currentSmoothedValue, a, getSmoothingAmount() * getDeltaTime());
        return currentSmoothedValue;
    } else {
        return a;
    }
}

function getSmoothingAmount() {
    return ((1 - script.smoothingAmount) * 7) + 4;
}

function getLandmarkPosition(points) {
    var landmarksPoint = [];

    for (var i = 0; i < points.length; i++) {
        landmarksPoint[i] = script.headBinding.getLandmark(points[i]);
    }
    return landmarksPoint;
}

function normalize(a) {
    var ratio = (a - min) / (max - min);
    ratio = Math.max(0, Math.min (ratio, 1.0));
    return ratio;
}

function getYDistance(a, b) {
    var centerA = getLandmarkCenter(a);
    var centerB = getLandmarkCenter(b);
    var worldCenterA = getWorldPosition(centerA);
    var worldCenterB = getWorldPosition(centerB);
    return Math.abs(worldCenterB.y - worldCenterA.y);
}

function getWorldPosition(pos) {
    return script.camera.screenSpaceToWorldSpace(pos, -headBindingTransform.getLocalPosition().z);
}

function getLandmarkCenter(points) {
    var center = vec2.zero();
    var pointsCount = points.length;

    for (var i = 0; i < pointsCount; i++) {
        center = center.add(points[i]);
    }

    center.x = center.x / pointsCount;
    center.y = center.y / pointsCount;

    return center;
}

function onFaceFound() {
    isFaceTracking = true;
}

function onFaceLost() {
    isFaceTracking = false;
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
    if (script.pointsMode == 0) {
        firstSelectedPoints = script.firstPoint;
        secondSelectedPoints = script.secondPoint;
    } else {
        firstSelectedPoints = customPoints[script.firstPredefinedPoints];
        secondSelectedPoints = customPoints[script.secondPredefinedPoints];
    }
    
    headBindingTransform = script.headBinding.getTransform();
    isInitialized = true;
}

function lerp(a, b, t) {
    return a + t * (b - a);
}

function getDistance() {
    return finalDistance;
}

function validateInputs() {
    if (!script.headBinding) {
        print("FaceLandmarksDistanceTrigger, ERROR: Please make sure Head Binding object exist and assign the Head Binding object to the script");
        return false;
    }

    if (!script.camera) {
        print("FaceLandmarksDistanceTrigger, ERROR: Please make sure Camera object exist and assign the Camera object to the script");
        return false;
    }

    if (script.customTrigger && !global.behaviorSystem) {
        print("FaceLandmarksDistanceTrigger, ERROR: Please make sure Behavior script exist in the objects panel or add it by pressing Add New -> Helper Scripts -> Behavior");
        return false;
    }
    
    if (script.pointsMode == 0) {
        for (var i = 0; i < script.firstPoint.length; i++) {
            if (script.firstPoint[i] > 92 || script.firstPoint[i] < 0) {
                print("FaceLandmarksDistanceTrigger, ERROR: First Landmarks Set values must be between 0 and 92 inclusive, please make sure to choose numbers within that range.");
                return false;
            }
        }
        
        for (var j = 0; j < script.secondPoint.length; j++) {
            if (script.secondPoint[j] > 92 || script.secondPoint[j] < 0) {
                print("FaceLandmarksDistanceTrigger, ERROR: Second Landmarks Set values must be between 0 and 92 inclusive, please make sure to choose numbers within that range.");
                return false;
            }
        }
    }

    return true;
}

var turnOnEvent = script.createEvent("TurnOnEvent");
turnOnEvent.bind(onLensTurnOn);
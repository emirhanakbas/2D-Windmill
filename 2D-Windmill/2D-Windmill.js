"use strict";

var canvas;
var gl;

var bufferTri, bufferRect, triVertices, rectVertices;
var vPosition;
var transformationMatrixLoc;
var rotationSpeed = 0.5, angle = 0;
var triangleColor = [0.0, 0.0, 0.0]; 
var wingColors = [
    [1.0, 0.0, 0.0],  
    [0.0, 1.0, 0.0],  
    [0.0, 0.0, 1.0]   
]; 

var tx = 0.0, ty = 0.0, scale = 1.0, rotation = 0.0;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }
	
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    triVertices = [
        vec2(-0.1, -0.2),
        vec2(0.1, -0.2),
        vec2(0.0, 0.3)
    ];
    rectVertices = [
        vec2(-0.05, 0.0),
        vec2(0.05, 0.0),
        vec2(-0.05, 0.4),
        vec2(0.05, 0.4)
    ];

    bufferTri = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTri);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triVertices), gl.STATIC_DRAW);

    bufferRect = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferRect);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(rectVertices), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    transformationMatrixLoc = gl.getUniformLocation(program, "transformationMatrix");
    var uTriangleColorLoc = gl.getUniformLocation(program, "uTriangleColor");

    gl.uniform3fv(uTriangleColorLoc, triangleColor);

    document.getElementById("inp_objX").oninput = function(event) {
        tx = parseFloat(event.target.value);
    };

    document.getElementById("inp_objY").oninput = function(event) {
        ty = parseFloat(event.target.value);
    };

    document.getElementById("inp_obj_scale").oninput = function(event) {
        scale = parseFloat(event.target.value);
    };

    document.getElementById("inp_obj_rotation").oninput = function(event) {
        rotation = parseFloat(event.target.value);
    };

    document.getElementById("inp_wing_speed").oninput = function(event) {
        rotationSpeed = parseFloat(event.target.value);
    };

    document.getElementById("redSlider").oninput = function(event) {
        triangleColor[0] = parseFloat(event.target.value);
        updateTriangleColor(uTriangleColorLoc);
    };
    document.getElementById("greenSlider").oninput = function(event) {
        triangleColor[1] = parseFloat(event.target.value);
        updateTriangleColor(uTriangleColorLoc);
    };
    document.getElementById("blueSlider").oninput = function(event) {
        triangleColor[2] = parseFloat(event.target.value);
        updateTriangleColor(uTriangleColorLoc);
    };

    render();
};

function updateTriangleColor(uTriangleColorLoc) {
    gl.uniform3fv(uTriangleColorLoc, triangleColor);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    let triangleTransformation = mult(translate(tx, ty, 0), scalem(scale, scale, 1));
    triangleTransformation = mult(triangleTransformation, rotateZ(rotation));

    gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(triangleTransformation));
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTri);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

    gl.uniform3fv(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "uColor"), triangleColor);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    let centerX = 0.0;
    let centerY = 0.25;

    for (let i = 0; i < 3; i++) {
        let angleOffset = angle + i * 120;
        let rotationTransform = rotateZ(angleOffset);

        let wingTransformation = mult(translate(centerX, centerY, 0), rotationTransform);
        wingTransformation = mult(triangleTransformation, wingTransformation);

        gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(wingTransformation));

        gl.uniform3fv(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "uColor"), wingColors[i]);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferRect);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    angle += rotationSpeed;
    window.requestAnimFrame(render);
}


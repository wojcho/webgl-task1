const vertexShaderTxt = `
precision mediump float;

attribute vec2 vertPosition;
attribute vec4 vertColor;

varying vec4 fragColor;

void main() {
    gl_Position = vec4(vertPosition, 0.0, 1.0);
    fragColor = vertColor; // Pass color to fragment shader
}
`
const fragmentShaderTxt = `
precision mediump float;

varying vec4 fragColor;

void main() {
    gl_FragColor = vec4(fragColor); // Use interpolated color
}
`

const square = function() {
    const canvas = document.getElementById("main-canvas");
    const gl = canvas.getContext("webgl");
    let canvasColor = [0.0, 0.0, 0.0, 1.0];
    
    checkGl(gl);
    
    gl.clearColor(...canvasColor); // R,G,B,A
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    gl.shaderSource(vertexShader, vertexShaderTxt);
    gl.shaderSource(fragmentShader, fragmentShaderTxt);
    
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    
    const program = gl.createProgram();
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    
    gl.linkProgram(program);
    
    gl.detachShader(program, vertexShader); // zeby zmniejszyc narzut
    gl.detachShader(program, fragmentShader);
    
    gl.validateProgram(program);
    
    let triangleVertices = [
    //  X     Y
         0.5,  0.5,
        -0.5,  0.5,
         0.5, -0.5,
        -0.5, -0.5,
    ]
    
    const triangleVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
    const positionAttributeLocation = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(
        positionAttributeLocation,
        2, // ilosc podelementow w elemencie
        gl.FLOAT, // typ danych
        gl.FALSE, // nie normalizowac
        2 * Float32Array.BYTES_PER_ELEMENT, // wielkosc na element
        0 // offset od poczatku tablicy
    )
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    let triangleColors = [
    //  R     G     B     A
         0.9,  0.4,  0.1,  1.0,
         0.4,  0.1,  0.4,  1.0,
         0.1,  0.4,  0.9,  1.0,
         0.4,  0.9,  0.4,  1.0,
    ]
    
    const triangleColorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleColors), gl.STATIC_DRAW);
    const colorAttributeLocation = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(
        colorAttributeLocation,
        4, // ilosc podelementow w elemencie
        gl.FLOAT, // typ danych
        gl.FALSE, // nie normalizowac
        4 * Float32Array.BYTES_PER_ELEMENT, // wielkosc na element
        0 // offset od poczatku tablicy
    )
    gl.enableVertexAttribArray(colorAttributeLocation);
    
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangleVertices.length / 2);
}

function checkGl(gl) {
    if (!gl) {
        console.log("WebGL is not supported");
    }
}

function checkShaderCompile(gl, shader) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader not compiled", gl.getShaderInfoLog(shader));
    }
}

function checkLink(gl, program) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Error at linking of program", gl.getProgramInfoLog(shader));
    }
}

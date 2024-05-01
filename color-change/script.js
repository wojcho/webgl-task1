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

class ColorProvider {
    static JUMP_AMOUNT = 16;
    static highlightBase = [16, 0, 9];
    static standardBase = [1, 1, 9];
    static getColorsArray(verticesAmount) {
        let retval = new Array(verticesAmount * 4);
        if (verticesAmount >= 1) {
            retval[0] = this.highlightBase[0] / ColorProvider.JUMP_AMOUNT; // R
            retval[1] = this.highlightBase[1] / ColorProvider.JUMP_AMOUNT; // G
            retval[2] = this.highlightBase[2] / ColorProvider.JUMP_AMOUNT; // B
            retval[3] = 1.0; // A
        }
        for (let currentIndex = 4; currentIndex < retval.length; currentIndex += 4) {
            retval[currentIndex]     = this.standardBase[0] / ColorProvider.JUMP_AMOUNT; // R
            retval[currentIndex + 1] = this.standardBase[1] / ColorProvider.JUMP_AMOUNT; // G
            retval[currentIndex + 2] = this.standardBase[2] / ColorProvider.JUMP_AMOUNT; // B
            retval[currentIndex + 3] = 1.0; // B
        }
        ColorProvider.incrementState();
        return retval;
    };
    static incrementState = function() {
        for (let i = 0; i < 3; ++i) {
            this.highlightBase[i] += Math.floor(Math.random() * 2);
            this.highlightBase[i] %= ColorProvider.JUMP_AMOUNT;
            this.standardBase[i] += Math.floor(Math.random() * 2);
            this.standardBase[i] %= ColorProvider.JUMP_AMOUNT;
            if (this.highlightBase[i] == this.standardBase[i]) {
                if (Math.random() < 0.5) {
                    this.highlightBase[i] += 2;
                    this.standardBase[i] -= 2;
                } else {
                    this.highlightBase[i] -= 2;
                    this.standardBase[i] += 2;
                }
                this.highlightBase[i] %= ColorProvider.JUMP_AMOUNT;
                this.standardBase[i] %= ColorProvider.JUMP_AMOUNT;
                if (this.highlightBase[i] < 0) {
                    this.highlightBase[i] = Math.abs(this.highlightBase[i]);
                }
                if (this.standardBase[i] < 0) {
                    this.standardBase[i] = Math.abs(this.standardBase[i]);
                }
            }
        }
    };
};

function clearCanvas(gl) {
    const canvasColor = [0.0, 0.0, 0.0, 1.0];
    gl.clearColor(...canvasColor); // R,G,B,A
    gl.clear(gl.COLOR_BUFFER_BIT);
}

const triangleVertices = [
    //  X     Y
         0.0,  0.0,
         0.0,  0.9,
        -0.9,  0.4,
        -0.9, -0.4,
         0.0, -0.9,
         0.9, -0.4,
         0.9,  0.4,
         0.0,  0.9,
    ];

const square = function() {
    const canvas = document.getElementById("main-canvas");
    const gl = canvas.getContext("webgl");
    checkGl(gl);

    clearCanvas(gl);
    
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
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    const triangleColorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorProvider.getColorsArray(triangleVertices.length / 2)), gl.STATIC_DRAW);
    const colorAttributeLocation = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(
        colorAttributeLocation,
        4, // ilosc podelementow w elemencie
        gl.FLOAT, // typ danych
        gl.FALSE, // nie normalizowac
        4 * Float32Array.BYTES_PER_ELEMENT, // wielkosc na element
        0 // offset od poczatku tablicy
    );
    gl.enableVertexAttribArray(colorAttributeLocation);
    
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, triangleVertices.length / 2);
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

function updateColors() {    
    const canvas = document.getElementById("main-canvas");
    const gl = canvas.getContext("webgl");
    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    const colorAttributeLocation = gl.getAttribLocation(program, "vertColor");
    
    newColors = ColorProvider.getColorsArray(triangleVertices.length / 2);
    
    const triangleColorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newColors), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(
        colorAttributeLocation,
        4, // Number of elements per vertex (R, G, B, A)
        gl.FLOAT,
        gl.FALSE,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    
    gl.enableVertexAttribArray(colorAttributeLocation);
    
    clearCanvas(gl);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, newColors.length / 4); // Dividing by 4 because each vertex has 4 color components
}

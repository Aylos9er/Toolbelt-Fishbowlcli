let points = [];
let numPoints = 100; // Number of points for Voronoi
let cellColors = [];
let fishX, fishY; // Fish position
let fishSize = 100; // Fish size
let angle = 0; // Angle for fish movement
let grid; // Cellular automaton grid
let cols, rows; // Grid dimensions
let cellSize = 10; // Size of each cell
let transparency = 127; // Default transparency for the glass bowl
let editorVisible = false; // Track visibility of the editor
let codeEditorContent = ""; // Store code editor content

function setup() {
    createCanvas(windowWidth, windowHeight);
    cols = floor(width / cellSize);
    rows = floor(height / cellSize);
    grid = createGrid(cols, rows);
    
    for (let i = 0; i < numPoints; i++) {
        points.push(createVector(random(width), random(height)));
        cellColors.push(color(random(255), random(255), random(255), 150)); // Random colors for cells
    }
    
    fishX = width / 2;
    fishY = height / 2;
}

function draw() {
    background(220);
    drawVoronoi();
    drawCellularAutomaton();
    drawFish(fishX, fishY, fishSize); // Draw fish
    updateFishPosition(); // Update fish position
    drawGlassBowl(); // Draw the glass bowl effect
    drawEditor(); // Draw the code editor if visible
}

function createGrid(cols, rows) {
    let arr = [];
    for (let i = 0; i < cols; i++) {
        arr[i] = [];
        for (let j = 0; j < rows; j++) {
            arr[i][j] = floor(random(2)); // Randomly initialize cells
        }
    }
    return arr;
}

function drawVoronoi() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let closestIndex = -1;
            let closestDist = Infinity;
            for (let i = 0; i < points.length; i++) {
                let d = dist(x, y, points[i].x, points[i].y);
                if (d < closestDist) {
                    closestDist = d;
                    closestIndex = i;
                }
            }
            stroke(0);
            fill(cellColors[closestIndex]);
            rect(x, y, 1, 1); // Draw a pixel for the Voronoi cell
        }
    }
}

function drawCellularAutomaton() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            fill(grid[i][j] === 1 ? color(255, 0, 0) : color(255)); // Alive or dead cell
            stroke(200);
            rect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }
}

function drawFish(x, y, size) {
    // Body
    fill(0, 153, 204); // Blue color
    beginShape();
    vertex(x, y);
    bezierVertex(x + size * 0.5, y - size * 0.3, x + size * 0.5, y + size * 0.3, x, y + size * 0.5);
    bezierVertex(x - size * 0.5, y + size * 0.3, x - size * 0.5, y - size * 0.3, x, y);
    endShape(CLOSE);

    // Tail
    fill(0, 102, 153); // Darker blue
    beginShape();
    vertex(x - size * 0.5, y);
    vertex(x - size * 0.8, y - size * 0.2);
    vertex(x - size * 0.8, y + size * 0.2);
    endShape(CLOSE);

    // Eye
    fill(255); // White
    ellipse(x + size * 0.2, y - size * 0.1, size * 0.15, size * 0.15);
    fill(0); // Black
    ellipse(x + size * 0.2, y - size * 0.1, size * 0.07, size * 0.07);
}

function updateFishPosition() {
    fishX += cos(angle) * 2; // Move fish in x direction
    fishY += sin(angle) * 2; // Move fish in y direction

    if (frameCount % 60 === 0) {
        angle += random(-PI / 4, PI / 4); // Change direction every second
    }

    fishX = constrain(fishX, 0, width);
    fishY = constrain(fishY, 0, height);
}

function drawGlassBowl() {
    noStroke();
    fill(255, 255, 255, transparency); // White with adjustable transparency
    ellipse(width / 2, height / 2, width * 0.8, height * 0.8); // Draw the glass bowl effect
}

function drawEditor() {
    if (editorVisible) {
        fill(255, 255, 255, 200);
        rect(20, 20, 300, 200); // Draw editor background
        fill(0);
        textSize(16);
        text("Code Editor:", 30, 40);
        fill(0);
        text(codeEditorContent, 30, 60);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    cols = floor(width / cellSize);
    rows = floor(height / cellSize);
    grid = createGrid(cols, rows); // Recreate grid on resize
}

// Handle transparency adjustment
function adjustTransparency(value) {
    transparency = map(value, 0, 100, 0, 255);
}

// Toggle editor visibility
function toggleEditor() {
    editorVisible = !editorVisible;
}

// Update code editor content
function updateCode() {
    codeEditorContent = document.getElementById('code-editor').value;
}

// Run code from the editor
function runCode() {
    try {
        eval(codeEditorContent); // Run the code in the editor
    } catch (error) {
        console.error("Error executing code:", error);
    }
}

// Chat functionality
function sendMessage() {
    const input = document.getElementById('chat-input').value;
    const output = document.getElementById('chat-output');
    output.innerHTML += `<div>User: ${input}</div>`;
    document.getElementById('chat-input').value = '';

    // Simulate a response from a lightweight LLM
    const response = `Echo: ${input}`; // Replace with actual LLM response logic
    output.innerHTML += `<div>LLM: ${response}</div>`;
}

// Command Line Interface (CLI) functionality
function executeCommand() {
    const input = document.getElementById('cli-input').value;
    const output = document.getElementById('cli-output');
    const args = input.split(" ");
    const command = args[0];
    const commandArgs = args.slice(1);

    if (command === "help") {
        output.innerHTML += "<div>Available commands: help, deploy, scale, chat, fetch</div>";
    } else if (command === "deploy") {
        Toolbelt.kubernetes.deploy();
        output.innerHTML += "<div>Deployment initiated.</div>";
    } else if (command === "scale") {
        Toolbelt.kubernetes.scale();
        output.innerHTML += "<div>Scaling initiated.</div>";
    } else if (command === "chat") {
        Toolbelt.llmChat.sendMessage(commandArgs.join(" "));
        output.innerHTML += "<div>Message sent to LLM.</div>";
    } else if (command === "fetch") {
        Toolbelt.apiFunctions.fetchData(commandArgs[0]).then(data => {
            output.innerHTML += `<div>Fetched data: ${JSON.stringify(data)}</div>`;
        });
    } else {
        output.innerHTML += "<div>Unknown command. Type 'help' for a list of commands.</div>";
    }

    document.getElementById('cli-input').value = '';
}

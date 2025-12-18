let numProcesses = 3;
let numResources = 3;
let allocation = [];
let max = [];
let need = [];
let available = [];

function toIntOrNaN(value) {
    const num = Number(value);
    return Number.isInteger(num) && num >= 0 ? num : NaN;
}

function initZeroData() {
    allocation = Array(numProcesses).fill().map(() => Array(numResources).fill(0));
    max = Array(numProcesses).fill().map(() => Array(numResources).fill(0));
    need = Array(numProcesses).fill().map(() => Array(numResources).fill(0));
    available = Array(numResources).fill(0);
}
function calculateNeedMatrix() {
    need = [];
    for (let i = 0; i < numProcesses; i++) {
        need[i] = [];
        for (let j = 0; j < numResources; j++) {
            need[i][j] = max[i][j] - allocation[i][j];
            if (need[i][j] < 0) need[i][j] = 0;
        }
    }
}

function readAndValidateAllInputs() {
    const availVals = [];
    const allocVals = [];
    const maxVals = [];


    for (let j = 0; j < numResources; j++) {
        const input = document.getElementById(`avail-${j}`);
        const v = toIntOrNaN(input ? input.value : "");
        availVals.push(v);
    }

    for (let i = 0; i < numProcesses; i++) {
        allocVals[i] = [];
        for (let j = 0; j < numResources; j++) {
            const input = document.getElementById(`alloc-${i}-${j}`);
            const v = toIntOrNaN(input ? input.value : "");
            allocVals[i][j] = v;
        }
    }

    for (let i = 0; i < numProcesses; i++) {
        maxVals[i] = [];
        for (let j = 0; j < numResources; j++) {
            const input = document.getElementById(`max-${i}-${j}`);
            const v = toIntOrNaN(input ? input.value : "");
            maxVals[i][j] = v;
        }
    }

    const flatAlloc = allocVals.flat();
    const flatMax = maxVals.flat();

    if (
        availVals.some(isNaN) ||
        flatAlloc.some(isNaN) ||
        flatMax.some(isNaN)
    ) {
        showNotification("error", "Error", "Invalid input detected");
        throw new Error("Invalid input detected");
    }

    available = availVals.slice();
    allocation = allocVals.map(row => row.slice());
    max = maxVals.map(row => row.slice());

    calculateNeedMatrix();
    updateNeedTable();
}

function createTables(populateWithCurrentData = true) {
    try {
        const p = toIntOrNaN(document.getElementById('processes').value);
        const r = toIntOrNaN(document.getElementById('resources').value);

        if (isNaN(p) || isNaN(r)) {
            showNotification("error", "Error", "Invalid input detected");
            throw new Error("Invalid input detected");
        }

        numProcesses = p;
        numResources = r;

        if (numResources > 8) {
            numResources = 8;
            document.getElementById('resources').value = 8;
        }

        if (numProcesses > 10) {
            numProcesses = 10;
            document.getElementById('processes').value = 10;
        }

        if (allocation.length !== numProcesses || allocation[0]?.length !== numResources) {
            initZeroData();
        }

        const tablesContainer = document.getElementById('tables-container');
        const isManyResources = numResources >= 5;

        tablesContainer.innerHTML = `
            <!-- Available Resources -->
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Available Resources</h3>
                </div>
                <div class="table-container">
                    <table id="available-table" ${isManyResources ? 'class="many-columns"' : ''}>
                        <thead>
                            <tr>
                                ${Array.from({length: numResources}, (_, j) => `<th>R${j}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                ${Array.from({length: numResources}, (_, j) =>
                                    `<td><input type="number" id="avail-${j}" value="${populateWithCurrentData ? available[j] : 0}" min="0"></td>`
                                ).join('')}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Allocation Matrix -->
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Allocation Matrix</h3>
                </div>
                <div class="table-container">
                    <table id="allocation-table" ${isManyResources ? 'class="many-columns"' : ''}>
                        <thead>
                            <tr>
                                <th>Process</th>
                                ${Array.from({length: numResources}, (_, j) => `<th>R${j}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.from({length: numProcesses}, (_, i) => `
                                <tr>
                                    <td><strong>P${i}</strong></td>
                                    ${Array.from({length: numResources}, (_, j) => `
                                        <td><input type="number" id="alloc-${i}-${j}" value="${populateWithCurrentData ? allocation[i][j] : 0}" min="0"></td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Maximum Need Matrix -->
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Maximum Need Matrix</h3>
                </div>
                <div class="table-container">
                    <table id="max-table" ${isManyResources ? 'class="many-columns"' : ''}>
                        <thead>
                            <tr>
                                <th>Process</th>
                                ${Array.from({length: numResources}, (_, j) => `<th>R${j}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.from({length: numProcesses}, (_, i) => `
                                <tr>
                                    <td><strong>P${i}</strong></td>
                                    ${Array.from({length: numResources}, (_, j) => `
                                        <td><input type="number" id="max-${i}-${j}" value="${populateWithCurrentData ? max[i][j] : 0}" min="0"></td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Need Matrix -->
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Need Matrix (Max - Allocation)</h3>
                </div>
                <div class="table-container">
                    <table id="need-table" ${isManyResources ? 'class="many-columns"' : ''}>
                        <thead>
                            <tr>
                                <th>Process</th>
                                ${Array.from({length: numResources}, (_, j) => `<th>R${j}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.from({length: numProcesses}, (_, i) => `
                                <tr>
                                    <td><strong>P${i}</strong></td>
                                    ${Array.from({length: numResources}, (_, j) => `
                                        <td><div id="need-${i}-${j}" class="need-cell">${populateWithCurrentData ? (max[i][j] - allocation[i][j]) : 0}</div></td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        if (populateWithCurrentData) {
            calculateNeedMatrix();
            updateNeedTable();
        }

        updateStatus("Tables Created", "ready");
        addToResults("Tables created for " + numProcesses + " processes and " + numResources + " resources\n");
    } catch (error) {
    }
}

function loadDeadlockExample() {
    numProcesses = 3;
    numResources = 3;

    document.getElementById('processes').value = numProcesses;
    document.getElementById('resources').value = numResources;

    allocation = [
        [1, 0, 1],
        [1, 1, 0],
        [0, 1, 1]
    ];

    max = [
        [2, 1, 1],
        [1, 2, 1],
        [1, 1, 2]
    ];

    available = [0, 0, 0];

    createTables(true);

    clearResults();
    addToResults("SIMPLE DEADLOCK EXAMPLE:\n");
    addToResults("=".repeat(50) + "\n\n");
    addToResults("Classic circular wait scenario:\n");
    addToResults("P0 holds R0,R2 and needs R1\n");
    addToResults("P1 holds R0,R1 and needs R2\n");
    addToResults("P2 holds R1,R2 and needs R0\n");
    addToResults("No resources available - Circular Wait!\n");
    updateStatus("Deadlock Example", "unsafe");
}

function loadClassicDeadlockExample() {
    numProcesses = 5;
    numResources = 5;

    document.getElementById('processes').value = numProcesses;
    document.getElementById('resources').value = numResources;

    allocation = [
        [1, 0, 0, 0, 1],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0]
    ];

    max = [
        [2, 1, 0, 0, 1],
        [0, 2, 1, 0, 0],
        [0, 0, 2, 1, 0],
        [1, 0, 0, 2, 0],
        [0, 0, 0, 0, 2]
    ];

    available = [0, 0, 0, 0, 0];

    createTables(true);

    clearResults();
    addToResults("CLASSIC DEADLOCK (Dining Philosophers):\n");
    addToResults("=".repeat(50) + "\n\n");
    addToResults("Each philosopher needs two chopsticks to eat:\n");
    addToResults("Circular wait: P0→P1→P2→P3→P0\n");
    addToResults("All resources held, none available!\n");
    updateStatus("Classic Deadlock", "unsafe");
}

function loadResourceStarvationExample() {
    numProcesses = 4;
    numResources = 3;

    document.getElementById('processes').value = numProcesses;
    document.getElementById('resources').value = numResources;

    allocation = [
        [2, 0, 0],
        [0, 2, 0],
        [0, 0, 2],
        [0, 0, 0]
    ];

    max = [
        [3, 2, 2],
        [2, 3, 2],
        [2, 2, 3],
        [1, 1, 1]
    ];

    available = [0, 0, 1];

    createTables(true);

    clearResults();
    addToResults("RESOURCE STARVATION EXAMPLE:\n");
    addToResults("=".repeat(50) + "\n\n");
    addToResults("System appears to have resources, but:\n");
    addToResults("No single process can complete with available resources.\n");
    addToResults("This leads to starvation - processes wait indefinitely!\n");
    updateStatus("Resource Starvation", "unsafe");
}

function loadSafeExample() {
    numProcesses = 5;
    numResources = 3;

    document.getElementById('processes').value = numProcesses;
    document.getElementById('resources').value = numResources;

    allocation = [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 2],
        [2, 1, 1],
        [0, 0, 2]
    ];

    max = [
        [7, 5, 3],
        [3, 2, 2],
        [9, 0, 2],
        [4, 3, 3],
        [5, 3, 3]
    ];

    available = [3, 3, 2];

    createTables(true);

    clearResults();
    addToResults("SIMPLE SAFE EXAMPLE:\n");
    addToResults("=".repeat(50) + "\n\n");
    addToResults("Classic safe state from OS textbooks.\n");
    addToResults("Safe sequence exists: P1 → P3 → P4 → P0 → P2\n");
    updateStatus("Safe Example", "safe");
}

function loadClassicSafeExample() {
    numProcesses = 4;
    numResources = 3;

    document.getElementById('processes').value = numProcesses;
    document.getElementById('resources').value = numResources;

    allocation = [
        [0, 0, 1],
        [2, 0, 0],
        [0, 1, 0],
        [1, 0, 0]
    ];

    max = [
        [0, 0, 2],
        [3, 1, 0],
        [1, 2, 1],
        [2, 1, 1]
    ];

    available = [2, 1, 1];

    createTables(true);

    clearResults();
    addToResults("CLASSIC SAFE EXAMPLE:\n");
    addToResults("=".repeat(50) + "\n\n");
    addToResults("Very clear progression:\n");
    addToResults("P0 can finish immediately (needs only 1 more R2)\n");
    addToResults("Safe sequence: P0 → P2 → P3 → P1\n");
    updateStatus("Classic Safe", "safe");
}

function loadResourceRichExample() {
    numProcesses = 5;
    numResources = 4;

    document.getElementById('processes').value = numProcesses;
    document.getElementById('resources').value = numResources;

    allocation = [
        [1, 2, 0, 1],
        [0, 1, 1, 0],
        [2, 0, 0, 1],
        [1, 1, 0, 0],
        [0, 0, 1, 2]
    ];

    max = [
        [3, 3, 2, 2],
        [1, 2, 2, 1],
        [3, 1, 1, 2],
        [2, 2, 1, 1],
        [1, 1, 2, 3]
    ];

    available = [5, 4, 3, 4];

    createTables(true);

    clearResults();
    addToResults("RESOURCE-RICH EXAMPLE:\n");
    addToResults("=".repeat(50) + "\n\n");
    addToResults("Plenty of resources available:\n");
    addToResults("Available: [" + available.join(", ") + "]\n");
    addToResults("Any process can finish immediately!\n");
    addToResults("Multiple safe sequences exist.\n");
    updateStatus("Resource Rich", "safe");
}

function generateRandomExample() {
    try {
        const p = toIntOrNaN(document.getElementById('processes').value);
        const r = toIntOrNaN(document.getElementById('resources').value);

        if (isNaN(p) || isNaN(r)) {
            showNotification("error", "Error", "Invalid input detected");
            throw new Error("Invalid input detected");
        }

        numProcesses = p;
        numResources = r;

        allocation = Array(numProcesses).fill().map(() => Array(numResources).fill(0));
        max = Array(numProcesses).fill().map(() => Array(numResources).fill(0));
        available = Array(numResources).fill(0);

        for (let i = 0; i < numProcesses; i++) {
            for (let j = 0; j < numResources; j++) {
                allocation[i][j] = Math.floor(Math.random() * 3);
            }
        }

        for (let i = 0; i < numProcesses; i++) {
            for (let j = 0; j < numResources; j++) {
                max[i][j] = allocation[i][j] + Math.floor(Math.random() * 4) + 1;
            }
        }

        for (let j = 0; j < numResources; j++) {
            let totalAlloc = 0;
            for (let i = 0; i < numProcesses; i++) {
                totalAlloc += allocation[i][j];
            }
            available[j] = totalAlloc + Math.floor(Math.random() * 3) + 2;
        }

        calculateNeedMatrix();
        createTables(true);

        clearResults();
        addToResults("Random example generated!\n");
        addToResults("Available: [" + available.join(", ") + "]\n\n");
        updateStatus("Example Generated", "info");
    } catch (error) {
        
    }
}

function updateNeedTable() {
    calculateNeedMatrix();
    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            const cell = document.getElementById(`need-${i}-${j}`);
            if (cell) {
                cell.textContent = need[i][j];
            }
        }
    }
}

function updateAllData() {
    try {
        readAndValidateAllInputs();
        addToResults("✓ All values updated!\n");
        addToResults("Available resources: [" + available.join(", ") + "]\n\n");
        updateStatus("Updated", "info");
    } catch (error) {
        
    }
}

function addToResults(text) {
    const output = document.getElementById('results-output');
    output.textContent += text;
    output.scrollTop = output.scrollHeight;
}

function clearResults() {
    const output = document.getElementById('results-output');
    output.textContent = "";
}

function updateStatus(message, state) {
    const statusLabel = document.getElementById('status');
    const statusMessage = document.getElementById('status-message');

    statusLabel.className = 'status-label';
    if (state === 'safe') {
        statusLabel.classList.add('status-safe');
        statusLabel.textContent = 'SAFE';
    } else if (state === 'unsafe') {
        statusLabel.classList.add('status-unsafe');
        statusLabel.textContent = 'UNSAFE';
    } else if (state === 'info') {
        statusLabel.classList.add('status-ready');
        statusLabel.textContent = 'INFO';
    } else {
        statusLabel.classList.add('status-ready');
        statusLabel.textContent = 'READY';
    }

    statusMessage.textContent = message;
}

function checkSafety() {
    if (!allocation || allocation.length === 0) {
        showNotification("error", "Error", "Invalid input detected");
        return;
    }

    try {
        readAndValidateAllInputs();
    } catch (e) {
        
        return;
    }

    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            if (allocation[i][j] > max[i][j]) {
                addToResults("ERROR: Allocation cannot exceed Maximum for P" + i + ", R" + j + "\n");
                updateStatus("Invalid Data", "unsafe");
                return;
            }
        }
    }

    addToResults("\n" + "=".repeat(60) + "\n");
    addToResults("RUNNING BANKER'S ALGORITHM\n");
    addToResults("=".repeat(60) + "\n\n");

    addToResults("Initial State:\n");
    addToResults("Available resources: [" + available.join(", ") + "]\n\n");
    addToResults("Step-by-step analysis:\n");

    const work = [...available];
    const finish = Array(numProcesses).fill(false);
    const safeSequence = [];

    let step = 1;
    let found;

    do {
        found = false;
        addToResults("\nStep " + step + " (Work = [" + work.join(", ") + "]):\n");

        for (let i = 0; i < numProcesses; i++) {
            if (!finish[i]) {
                let canFinish = true;
                for (let j = 0; j < numResources; j++) {
                    if (need[i][j] > work[j]) {
                        canFinish = false;
                        break;
                    }
                }

                if (canFinish) {
                    addToResults("  P" + i + " can finish (Need[" + need[i].join(", ") + "] <= Work)\n");

                    for (let j = 0; j < numResources; j++) {
                        work[j] += allocation[i][j];
                    }

                    finish[i] = true;
                    safeSequence.push(i);
                    found = true;

                    addToResults("     Releases resources -> New Work = [" + work.join(", ") + "]\n");
                    break;
                } else {
                    addToResults("  P" + i + " must wait (Need[" + need[i].join(", ") + "] > Work)\n");
                }
            }
        }
        step++;
    } while (found);

    let allFinished = true;
    let deadlockedProcesses = [];

    for (let i = 0; i < numProcesses; i++) {
        if (!finish[i]) {
            allFinished = false;
            deadlockedProcesses.push(i);
        }
    }

    addToResults("\n" + "=".repeat(60) + "\n");
    addToResults("FINAL RESULT:\n");

    if (allFinished) {
        addToResults("SAFE STATE!\n\n");
        addToResults("Safe execution sequence: ");
        addToResults(safeSequence.map(p => "P" + p).join(" -> ") + "\n");
        addToResults("All processes can complete without deadlock.\n");
        updateStatus("SAFE", "safe");
    } else {
        addToResults("UNSAFE STATE - POTENTIAL DEADLOCK!\n\n");
        addToResults("Deadlocked processes: P" + deadlockedProcesses.join(", P") + "\n");
        updateStatus("UNSAFE", "unsafe");
    }
    addToResults("=".repeat(60) + "\n\n");

    document.getElementById('results-output').scrollTop =
        document.getElementById('results-output').scrollHeight;
}

function explainAlgorithm() {
    clearResults();
    addToResults("BANKER'S ALGORITHM EXPLANATION\n");
    addToResults("=".repeat(50) + "\n\n");

    addToResults("The Banker's Algorithm prevents deadlock by:\n\n");
    addToResults("1. Need Matrix = Max - Allocation\n");
    addToResults("2. Start with Work = Available resources\n");
    addToResults("3. Find a process where Need <= Work\n");
    addToResults("4. If found, assume it finishes and releases resources\n");
    addToResults("5. Add released resources to Work\n");
    addToResults("6. Repeat until all processes finish (SAFE) or no progress (UNSAFE)\n\n");

    addToResults("DEADLOCK CONDITIONS (All 4 must be present):\n");
    addToResults("1. Mutual Exclusion - Resources cannot be shared\n");
    addToResults("2. Hold and Wait - Processes hold resources while waiting\n");
    addToResults("3. No Preemption - Resources cannot be taken away\n");
    addToResults("4. Circular Wait - Processes waiting for each other\n");
}

window.addEventListener('load', () => {
    initZeroData();
    createTables(false);
});
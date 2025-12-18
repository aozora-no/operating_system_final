function addProcess() {
  const table = document.getElementById("inputTable");
  const maxRows = 21;

  if (table.rows.length >= maxRows) {
    showNotification("error", "Error", "Maximum of 20 processes reached");
    return;
  }

  const rowCount = table.rows.length;
  const row = table.insertRow();
  row.innerHTML = `
      <td>P${rowCount}</td>
      <td><input type="number" class="at" value="0"></td>
      <td><input type="number" class="bt" value="1"></td>
  `;
  showNotification("success", "Successfully", "Added a process");
}

function removeProcess() {
  const table = document.getElementById("inputTable");
  if (table.rows.length > 2) {
    table.deleteRow(-1);
    showNotification("success", "Successfully", "Removed a process");
  } else {
    showNotification("error", "Error", "Rows should be more than two");
  }
}

function getTableData() {
  const at = [...document.querySelectorAll(".at")].map((x) =>
    parseInt(x.value)
  );
  const bt = [...document.querySelectorAll(".bt")].map((x) =>
    parseInt(x.value)
  );

  if (at.some(isNaN) || bt.some(isNaN)) {
    showNotification("error", "Error", "Invalid input detected");
    throw new Error("Invalid input detected");
  }

  return { processes: bt.map((_, i) => i + 1), arrival: at, burst: bt };
}

function FCFS(processes, arrival, burst) {
  let gantt = [];
  let time = 0;
  let wt = [],
    tat = [];

  for (let i = 0; i < processes.length; i++) {
    if (time < arrival[i]) {
      time = arrival[i];
    }

    gantt.push({
      p: "P" + processes[i],
      start: time,
      end: time + burst[i],
    });
    time += burst[i];

    tat[i] = time - arrival[i];
    wt[i] = tat[i] - burst[i];
  }
  return { gantt, wt, tat, processes, arrival, burst };
}


function SJF(arrival, burst) {
  const n = arrival.length;
  let time = 0;
  let completed = 0;
  const remaining = burst.slice();
  const wt = Array(n).fill(0);
  const tat = Array(n).fill(0);
  const gantt = [];

  if (n > 0) {
    time = Math.min(...arrival);
  }

  while (completed < n) {
    let idx = -1;
    let minBT = Infinity;

    for (let i = 0; i < n; i++) {
      if (arrival[i] <= time && remaining[i] > 0 && burst[i] < minBT) {
        minBT = burst[i];
        idx = i;
      }
    }

    if (idx === -1) {
      let nextTime = Infinity;
      for (let i = 0; i < n; i++) {
        if (
          remaining[i] > 0 &&
          arrival[i] > time &&
          arrival[i] < nextTime
        ) {
          nextTime = arrival[i];
        }
      }
      if (nextTime === Infinity) {
        break; 
      }
      time = nextTime;
      continue;
    }

    const start = time;
    const finish = time + burst[idx];

    gantt.push({ p: "P" + (idx + 1), start: start, end: finish });

    time = finish;
    tat[idx] = time - arrival[idx];
    wt[idx] = tat[idx] - burst[idx];
    remaining[idx] = 0;
    completed++;
  }

  return {
    gantt,
    wt,
    tat,
    processes: burst.map((_, i) => i + 1),
    arrival,
    burst,
  };
}

function createGanttChart(gantt) {
  const chart = document.getElementById("ganttChart");
  const scale = document.getElementById("timeScale");
  chart.innerHTML = scale.innerHTML = "";

  if (!gantt || gantt.length === 0) {
    return;
  }

  gantt.forEach((b, i) => {
    const d = document.createElement("div");
    d.className = "gantt-block";
    d.style.width = (b.end - b.start) * 40 + "px";
    d.textContent = b.p;
    chart.appendChild(d);
    setTimeout(() => d.classList.add("show"), i * 150);
  });

  gantt.forEach((b) => {
    const s = document.createElement("span");
    s.style.display = "inline-block";
    s.style.width = (b.end - b.start) * 40 + "px";
    s.textContent = b.start;
    scale.appendChild(s);
  });

  const end = document.createElement("span");
  end.textContent = gantt[gantt.length - 1].end;
  scale.appendChild(end);
}

function displayTable(result) {
  const table = document.getElementById("resultsTable");

  let html = `
      <tr>
          <th>Process</th>
          <th>Arrival Time</th>
          <th>Burst Time</th>
          <th>Finish Time</th>
          <th>Turnaround Time</th>
          <th>Waiting Time</th>
      </tr>
  `;

  result.processes.forEach((p, i) => {
    const finish = result.arrival[i] + result.tat[i];
    html += `
          <tr>
              <td>P${p}</td>
              <td>${result.arrival[i]}</td>
              <td>${result.burst[i]}</td>
              <td>${finish}</td>
              <td>${result.tat[i]}</td>
              <td>${result.wt[i]}</td>
          </tr>
      `;
  });

  html += `
      <tr>
          <th colspan="4">AVERAGE</th>
          <th>${(
            result.tat.reduce((a, b) => a + b) / result.tat.length
          ).toFixed(2)}</th>
          <th>${(
            result.wt.reduce((a, b) => a + b) / result.wt.length
          ).toFixed(2)}</th>
      </tr>
  `;
  table.innerHTML = html;
}


function runFCFS() {
  const data = getTableData();
  const result = FCFS(data.processes, data.arrival, data.burst);
  createGanttChart(result.gantt);
  displayTable(result);
  showNotification("success", "Successfully", "Run FCFS");
}

function runSJF() {
  const data = getTableData();
  const result = SJF(data.arrival, data.burst);
  createGanttChart(result.gantt);
  displayTable(result);
  showNotification("success", "Successfully", "Run SJF");
}
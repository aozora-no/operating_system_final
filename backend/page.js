function pageReplacement(algo, reference, num_frames) {
    if (!['fifo', 'lru', 'optimal'].includes(algo)) {
        throw new Error('Invalid page replacement algorithm');
    }
    if (num_frames < 1) {
        throw new Error('Num_frames must be greater than 1');
    }

    let cache = [];
    let time_slice = [];
    let page_fault = [];
    let queue = [];

    for (let i = 0; i < reference.length; i++) {
        let page = reference[i];

        if (!cache.includes(page)) {
            page_fault.push(1);

            if (algo === 'fifo') {
                queue.push(page);
            }

            if (cache.length < num_frames) {
                cache.push(page);
            } else {
                let victim = cache[0];

                switch (algo) {
                    case 'fifo':
                        victim = queue.shift();
                        break;

                    case 'lru': {
                        let lastUseDistances = cache.map(() => Infinity);
                        for (let k = 0; k < cache.length; k++) {
                            const p = cache[k];
                            for (let t = i - 1; t >= 0; t--) {
                                if (reference[t] === p) {
                                    lastUseDistances[k] = i - t;
                                    break;
                                }
                            }
                        }
                        let victimIndex = 0;
                        let maxDist = -1;
                        for (let k = 0; k < cache.length; k++) {
                            if (lastUseDistances[k] > maxDist) {
                                maxDist = lastUseDistances[k];
                                victimIndex = k;
                            }
                        }
                        victim = cache[victimIndex];
                        break;
                    }

                    case 'optimal': {
                        let futureRef = reference.slice(i + 1);
                        let farthestIndex = -1;
                        let victimIndex = -1;

                        for (let k = 0; k < cache.length; k++) {
                            const p = cache[k];
                            const nextUse = futureRef.indexOf(p);

                            if (nextUse === -1) {
                                victimIndex = k;
                                farthestIndex = Infinity;
                                break;
                            }
                            if (nextUse > farthestIndex) {
                                farthestIndex = nextUse;
                                victimIndex = k;
                            }
                        }
                        victim = cache[victimIndex];
                        break;
                    }
                }

                let id = cache.indexOf(victim);
                cache.splice(id, 1, page);
            }
        } else {
            page_fault.push(0);
        }

        time_slice.push([...cache]);
    }

    return { time_slice, page_fault };
}

function generateTable(reference, num_frames, time_slice, page_fault) {
    let table = "<table class='table table-bordered'><thead><tr><th>Ref</th>";
    reference.forEach((ref) => { table += "<th>" + ref + "</th>"; });
    table += "</tr></thead><tbody>";

    for (let i = 0; i < num_frames; i++) {
        table += "<tr><td>fr</td>";
        for (let t = 0; t < time_slice.length; t++) {
            let className = "";
            if (time_slice[t][i] === reference[t]) {
                className = page_fault[t] ? 'table-danger' : 'table-success';
            }
            table += `<td class="${className}"> ${time_slice[t][i] || ""} </td>`;
        }
        table += "</tr>";
    }

    table += "<tr><td>Hit</td>";
    page_fault.forEach((miss) => {
        if (miss) table += "<td><i class='bx bx-x opacity-50'></i></td>";
        else table += "<td><i class='bx bx-check'></i></td>";
    });
    table += "</tr></tbody></table>";
    return table;
}

function displayTable(reference, num_frames, time_slice, page_fault) {
    document.getElementById("result").classList.remove("visually-hidden");
    document.getElementById("result-container").innerHTML =
        generateTable(reference, num_frames, time_slice, page_fault);
}

function displaySummary(summary_obj) {
    document.getElementById("summary").classList.remove("visually-hidden");
    for (const detail in summary_obj) {
        document.getElementById(detail).innerHTML = summary_obj[detail];
    }
}

function simulate(e) {
    e.preventDefault();
    const algorithm = document.getElementById("Algorithm").value;
    const ref_string = document.getElementById("ref-string").value.trim();
    const ref_error = document.getElementById("ref-error");
    const num_frames = parseInt(document.getElementById("num-frames").value, 10);

    if (ref_string === "") {
        ref_error.classList.remove("visually-hidden");
        return;
    } else {
        ref_error.classList.add("visually-hidden");
    }

    try {
        const tokens = ref_string.split(/\s+/g).filter(t => t.length > 0);
        const ref_string_array = tokens.map(t => {
            const n = Number(t);
            if (!Number.isInteger(n)) throw new Error("Invalid input detected");
            return String(n);
        });

        const { time_slice, page_fault } =
            pageReplacement(algorithm, ref_string_array, num_frames);
        displayTable(ref_string_array, num_frames, time_slice, page_fault);

        const faults = page_fault.reduce((acc, curr) => acc + curr, 0);
        const hits = ref_string_array.length - faults;

        const summary_ = {
            ref: ref_string_array.length,
            algorithm: algorithm.toUpperCase(),
            frames: num_frames,
            hits: hits,
            faults: faults,
            hit_rate: ((hits / ref_string_array.length) * 100).toFixed(2) + '%',
            miss_rate: ((faults / ref_string_array.length) * 100).toFixed(2) + '%'
        };

        displaySummary(summary_);
    } catch (err) {
        showNotification("error", "Error", "Invalid input detected");
    }
}

const framesInput = document.getElementById("num-frames");
framesInput.addEventListener("input", () => {
    let v = framesInput.value.replace(/[^\d]/g, "");
    if (v === "") {
        framesInput.value = "";
        return;
    }
    let n = parseInt(v, 10);
    if (isNaN(n)) {
        framesInput.value = "";
        return;
    }
    if (n < 1) n = 1;
    if (n > 50) n = 50;
    framesInput.value = n;
});

document.getElementById("form-btn").addEventListener("click", simulate);
document.getElementById("clear-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("result").classList.add("visually-hidden");
    document.getElementById("summary").classList.add("visually-hidden");
    document.getElementById("ref-error").classList.add("visually-hidden");
    document.getElementById("ref-string").value = "";
});

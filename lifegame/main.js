"use strict";

/**
 * Dependencies:
 *  - https://code.jquery.com/jquery-3.6.0.slim.min.js
 *  - https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.1.0/chroma.min.js
 */

// FUNCTION
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
const getRandom = (range) => { return Math.floor(Math.random() * range); };

// CONSTANT
const N = 100;
const TIME_WAIT = [0, 1, 5, 10, 25, 50, 75, 100, 150, 200, 250, 500, 750, 1000, 1500, 2000];
// const TIME_WAIT = 250;

// Color Generator
const cmap = chroma.scale(['whitesmoke', 'green']).domain([0, 1]);

// All of cell
let cell = Array.from(new Array(N), _ => [...Array(N)].map(_ => getRandom(2)));
let ctmp = JSON.parse(JSON.stringify(cell));

// variables
let loops = 0;
let time_wait = TIME_WAIT[7];  // 100
let requestId = null;

// HTML Elements' IDs
const btnStart = $("#start")[0];
const btnReset = $("#reset")[0];
const spanLoops = $("#loops")[0];
const canvas = $("#canvas")[0];
const inpSlider = $("#slider")[0];
const spanTW = $("#spanTW")[0];
const inpCheck = $("#check")[0];
const ctx = canvas.getContext('2d');

// Draw cells in canvas
function draw() {
    const stdLen = Math.min(canvas.clientWidth, window.innerHeight - 200);

    // メモリ上における実際のサイズを設定(ピクセル密度の分だけ倍増する)
    let scale = 1; // CSS解像度と物理解像度の比
    scale = window.devicePixelRatio;

    canvas.width = stdLen * scale;
    canvas.height = stdLen * scale;

    // CSS上のピクセル数を前提としているシステムに合わせる
    ctx.scale(scale, scale);
    let size = stdLen / N;

    // セルの描写
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            let [r, g, b] = cmap(cell[i][j]).rgb();
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            // fillRect(開始x座標, 開始y座標, 描画幅, 描画高さ)
            ctx.fillRect(j * size, i * size, size, size);
        }
    }

    // // 補足情報テキストの描写
    // ctx.font = `bold ${5 * size}px 'VT323', cursive`;
    // ctx.fillStyle = "#000";
    // ctx.fillText(`HELLO WORLD!`, (canvas.width - 20 * size) / 2, canvas.height / 2);
}

// update a cell
function update(y, x) {

    let neignbors = 0;

    // Sum of living neighbors
    // if ($(inpCheck).prop('checked')) {   // another condition
    if (inpCheck.checked) {
        // CYCLE WORLD
        for (let v = -1; v <= 1; v++) {
            for (let u = -1; u <= 1; u++) {
                if (!v && !u) continue;
                if (cell[(y + v + N) % N][(x + u + N) % N]) neignbors++
            }
        }
    }
    else {
        // OPENED WORLD
        for (let v = -1; v <= 1; v++) {
            for (let u = -1; u <= 1; u++) {
                if (!v && !u) continue;
                if (y + v < 0 || N <= y + v || x + u < 0 || N <= x + u) continue;
                if (cell[(y + v + N) % N][(x + u + N) % N]) neignbors++
            }
        }
    }

    // 
    // Rule of Life Game
    // 

    // Birth
    if (!cell[y][x] && neignbors == 3) {
        ctmp[y][x] = 1;
    }
    // Overcrowding
    else if (cell[y][x] && 4 <= neignbors) {
        ctmp[y][x] = 0;
    }
    // Depopulation
    else if (cell[y][x] && neignbors <= 1) {
        ctmp[y][x] = 0;
    }
    // // Stay alive
    // else if (cell[y][x] && 2 <= neignbors && neignbors <= 3) {
    //     ctmp[y][x] = 1;
    // }
    else {
        ctmp[y][x] = cell[y][x];
    }

}

// update cells to next condition
async function step() {
    // calculate next condition of cells
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            update(y, x);
        }
    }
    // swap reference
    let _tmp_ = cell;
    cell = ctmp;
    ctmp = _tmp_;
    // re-draw canvas
    draw();
    // increase the times of loops
    $(spanLoops).text(`LOOP: ${++loops} [times]`);
    // waiting
    await sleep(time_wait);
    // call next step recursively
    if (requestId) {
        requestId = requestAnimationFrame(step);
    }
}

// reset canvas
function reset() {
    // stop updating
    if (requestId) {
        cancelAnimationFrame(requestId);
        requestId = null;
    }
    // reset each cells
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const val = getRandom(2);
            cell[i][j] = val;
            ctmp[i][j] = val;
        }
    }
    // re-draw canvas
    draw();
    // increase the times of loops
    $(spanLoops).text(`LOOP: ${loops = 0} [times]`);
    // set inner text of start button to "START!"
    $(btnStart).text("START!").removeClass("run");
}

// init canvas and loops
$(document).ready(function () {
    // set input range attribute
    $(inpSlider)
        .attr('max', TIME_WAIT.length - 1)
        .attr('step', 1)
        .val(TIME_WAIT.findIndex(e => e == time_wait));
    // set background meter using input value
    let rate = (inpSlider.value / inpSlider.max) * 100;
    $(inpSlider).css(
        'background',
        `linear-gradient(to right, var(--accent-color-a) ${rate}%, gray ${rate}%)`
    );
    // 
    $(spanTW).text(`${time_wait} [msec]`);
    // initial drawing canvas
    draw();
});

// 
// addEventListner
// 

// start/stop button
$(btnStart).click(function (e) {
    if (requestId) {
        cancelAnimationFrame(requestId);
        requestId = null;
        $(btnStart).text("CONTINUE").removeClass("run");
    } else {
        requestId = requestAnimationFrame(step);
        $(btnStart).text("STOP!").addClass("run");
    }
});

// reset button
$(btnReset).click(() => reset());

// time_wait slider
$(inpSlider).on('input', function (e) {
    //* NOTE: e.target === inpSlider
    time_wait = TIME_WAIT[inpSlider.value];
    $(spanTW).text(`${time_wait} [msec]`);
    let rate = (inpSlider.value / inpSlider.max) * 100;
    // inpSlider.style = `background: linear-gradient(...)`;
    $(inpSlider).css(
        'background',
        `linear-gradient(to right, var(--accent-color-a) ${rate}%, gray ${rate}%)`
    );
});

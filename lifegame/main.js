"use strict";

/**
 * Dependencies:
 *  - https://code.jquery.com/jquery-3.6.0.slim.min.js
 *  - https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.1.0/chroma.min.js
 */

// FUNCTION
const getRandom = (range) => { return Math.floor(Math.random() * range); };

// CONSTANT
const N = 100;
const TIME_WAIT = 250;

// Color Generator
const cmap = chroma.scale(['whitesmoke', 'green']).domain([0, 1]);

// All of cell
let cell = Array.from(new Array(N), _ => [...Array(N)].map(_ => getRandom(2)));
let ctmp = JSON.parse(JSON.stringify(cell));

let loops = 0;
let intervalId = null;

// HTML Elements' IDs
const btnStart = $("#btn")[0];
const spanLoops = $("#loops")[0];
const canvas = $("#canvas")[0];
const ctx = canvas.getContext('2d');

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

// Rule of Life Game
function update(y, x) {

    let neignbors = 0;

    // Sum of living neighbors
    for (let v = -1; v <= 1; v++) {
        for (let u = -1; u <= 1; u++) {
            if (!v && !u) continue;
            if (cell[(y + v + N) % N][(x + u + N) % N]) neignbors++
        }
    }

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

function step() {
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            update(y, x);
        }
    }
    // swap reference
    let _tmp_ = cell;
    cell = ctmp;
    ctmp = _tmp_;
    draw();
    $(spanLoops).text(`loop: ${++loops} [times]`);
}

// init
$(document).ready(function () {
    draw();
});

// addEventListner
$(btnStart).click(function (e) {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        $(btnStart).text("START!");
    } else {
        intervalId = setInterval(() => step(), TIME_WAIT);
        $(btnStart).text("STOP!");
    }
});
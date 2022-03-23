"use strict";

/**
 * Dependencies:
 *  - https://code.jquery.com/jquery-3.6.0.slim.min.js
 *  - https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.1.0/chroma.min.js
 */

// 
const N = 100;
const cmap = chroma.scale(['whitesmoke', 'green']).domain([0, 1]);
const cell = [];
const getRandom = (range) => { return Math.floor(Math.random() * range); };

for (let i = 0; i < N; i++) {
    cell.push([]);
    for (let j = 0; j < N; j++) {
        cell[i].push(getRandom(2));
    }
}

function update(canvas, y, x) {

}

$(document).ready(function () {
    // HTML Elements' IDs
    const canvas = $("#canvas")[0];
    const ctx = canvas.getContext('2d');

    const stdLen = Math.min(canvas.clientWidth, window.innerHeight - 200);

    // メモリ上における実際のサイズを設定(ピクセル密度の分だけ倍増する)
    let scale = 1; // CSS解像度と物理解像度の比
    // scale = window.devicePixelRatio;

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

    // 補足情報テキストの描写
    ctx.font = `bold ${5 * size}px 'VT323', cursive`;
    ctx.fillStyle = "#000";
    ctx.fillText(`HELLO WORLD!`, (canvas.width - 20 * size) / 2, canvas.height / 2);
});
"use strict";

/**
 * Dependency: jquery-3.6.0.min.js
 */

const N = 100;

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

    // 補足情報テキストの描写
    ctx.font = `bold ${5 * size}px 'VT323', cursive`;
    ctx.fillStyle = "#000";
    ctx.fillText(`HELLO WORLD!`, (canvas.width - 20 * size) / 2, canvas.height / 2);
});
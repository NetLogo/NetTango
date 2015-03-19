/*
 * Frog Pond Evolution
 * Copyright (c) 2015 Michael S. Horn
 * 
 *       Michael S. Horn (michael-horn@northwestern.edu)
 *       Northwestern University
 *       2120 Campus Drive
 *       Evanston, IL 60613
 *       http://tidal.northwestern.edu
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation.
 * 
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 */
part of FrogPond2;

class Plot {

	int width = 300;
	int height = 300;
	bool mini = false;  // iconified version

	/* Graph dimensions */
	int MARGIN = 10;
	int gx, gy, gw, gh;

	/* Plot scale (TODO: autoscale) */
	int maxY = 10;
	int minY = 0;

	String fillStyle = "rgba(255, 255, 255, 0.7)";
	String strokeStyle = "rgba(255, 255, 255, 0.7)";
	num lineWidth = 2;

	CanvasRenderingContext2D ctx;

	/* fixed length sliding window of data points */
	int _len = 0;
	List<num> data;


	Plot(String id, [bool mini = false]) {
		CanvasElement canvas = querySelector("#$id");
		ctx = canvas.getContext("2d");
		resize(canvas.width, canvas.height);
		data = new List<num>.filled(50, 0);
	}


	void resize(int w, int h) {
		width = w;
		height = h;
		MARGIN = mini ? 6 : 20;
		gx = MARGIN;
		gy = MARGIN;
		gw = width - MARGIN * 2;
		gh = height - MARGIN * 2;
	}


	void update(num value) {
    data[_len % data.length] = value;
    _len++;
	}


	void clear() {
		_len = 0;
		data.fillRange(0, data.length, 0);
		resize(width, height);
		draw();
	}


	void draw() {
		ctx.clearRect(0, 0, width, height);

		// axis lines 
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(gx, gy);
		ctx.lineTo(gx, gy + gh);
		ctx.lineTo(gx + gw - 0.5, gy + gh);
		ctx.strokeStyle = strokeStyle;
		ctx.stroke();

		// scale tick mark
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.font = "200 12px Nunito, sans-serif";
		ctx.fillStyle = "white";
		ctx.fillText("${maxY}", gx + 3, gy);

		if (data.isEmpty) return;

		ctx.strokeStyle = strokeStyle;
		ctx.fillStyle = fillStyle;
		ctx.lineWidth = lineWidth;

		// autoscale 
		maxY = 10;
		for (int i=0; i<data.length; i++) {
			while (data[i] / maxY >= 1.0) {
				maxY *= 2;
			}
		}

		// data fill
		int start = (_len < data.length) ? 0 : _len % data.length;
		num dx = gw / data.length;
		ctx.beginPath();
		ctx.moveTo(gx + 0.5, gy + gh);
		int l = min(data.length, _len);
		for (int i=0; i<l; i++) {
			ctx.lineTo(gx + 0.5 + dx * i, _valueToScreenY(data[(start + i) % data.length]));
		}
		ctx.lineTo(gx + 0.5 + dx * (l - 1), gy + gh);
		ctx.closePath();
		ctx.fill();
	}


	num _valueToScreenY(num value) {
		num p = value / (maxY - minY);
		return (gy + gh) - (p * gh);
	}

}
import React, { JSX } from "react";

export namespace SVGElements {
  export interface Element {
    toJSX: (canvasOffset: { x: number; y: number }, canvasPixelSize: number, key: any) => JSX.Element;
    toText: () => string;
  }

  export class Rectangle implements Element {
    width: number;
    height: number;
    x: number;
    y: number;

    constructor(x: number, y: number, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    toJSX(canvasOffset: { x: number; y: number }, canvasPixelSize: number, key: any): JSX.Element {
      return <rect
            key={key}
            x={this.x * canvasPixelSize + canvasOffset.x}
            y={this.y * canvasPixelSize + canvasOffset.y}
            width={this.width * canvasPixelSize}
            height={this.height * canvasPixelSize}
      />;
    }

    toText(): string {
      return `<rect x="${this.x}" y="${this.y}" width="${this.width}" height="${this.height}" />`;
    }
  }

  export class Ellipse implements Element {
    cx: number;
    cy: number;
    rx = 0;
    ry = 0;

    constructor(cx: number, cy: number, rx = 0, ry = 0) {
      this.cx = cx;
      this.cy = cy;
      this.rx = rx;
      this.ry = ry;
    }

    toJSX(canvasOffset: { x: number; y: number }, canvasPixelSize: number, key: any): React.JSX.Element {
      return <ellipse key={key} cx={this.cx} cy={this.cy} rx={this.rx} ry={this.ry} />;
    }

    toText(): string {
      return `<ellipse cx="${this.cx}" cy="${this.cy}" rx="${this.rx}" ry="${this.ry}" />`;
    }
  }
}

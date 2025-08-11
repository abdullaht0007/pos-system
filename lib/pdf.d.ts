declare module "pdfkit" {
  export default class PDFDocument {
    constructor(options?: any);
    font(font: string): this;
    fontSize(size: number): this;
    text(text: string, x?: number, y?: number, options?: any): this;
    moveDown(lines?: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    end(): void;
    on(event: "data", listener: (chunk: Uint8Array) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (err: unknown) => void): this;
  }
}

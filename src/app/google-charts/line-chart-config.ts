export class LineChartConfig {
    title: string;
    subtitle: string;
    height: number;
    width: number;
    vAxisFormat: string;

    constructor(title: string, subtitle: string, height: number, width: number, vAxisFormat: string = '') {
        this.title = title;
        this.subtitle = subtitle;
        this.height = height;
        this.width = width;
        this.vAxisFormat = vAxisFormat;
    }
}
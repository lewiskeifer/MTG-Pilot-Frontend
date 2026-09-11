export class LineChartConfig {
    title: string;
    subtitle: string;
    height: number;
    width: number;
    vAxisFormat: string;
    colors: string[];

    constructor(title: string, subtitle: string, height: number, width: number, vAxisFormat: string = '', colors: string[] = []) {
        this.title = title;
        this.subtitle = subtitle;
        this.height = height;
        this.width = width;
        this.vAxisFormat = vAxisFormat;
        this.colors = colors;
    }
}

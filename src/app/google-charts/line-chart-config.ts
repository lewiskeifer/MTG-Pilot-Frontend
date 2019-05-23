export class LineChartConfig {
    title: string;
    subtitle: string;
    height: number;
    width: number;

    constructor(title: string, subtitle: string, height: number, width: number) {
        this.title = title;
        this.subtitle = subtitle;
        this.height = height;
        this.width = width;
    }
}
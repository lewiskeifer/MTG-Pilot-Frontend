/*
 * Categorical palette for the dashboard lines. The slot order is the colourblind-safety
 * mechanism, not decoration: these eight hues in this order clear the adjacent-pair CVD and
 * normal-vision separation gates against the #ffffff chart surface. Do not reorder, and do not
 * add a ninth colour - eight is the cap, which is why the dashboard limits how many series can
 * be plotted at once.
 *
 * Slots 3, 4 and 5 sit below 3:1 contrast against white, so every visible series also carries a
 * direct label with its latest value at the right edge of the plot. Identity and value are never
 * left to hue alone.
 */
export const SERIES_COLORS: string[] = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948'  // red
];

export const MAX_SERIES = SERIES_COLORS.length;

// Recessive chart chrome - grid and axis ink stay well behind the data.
export const CHART_INK = {
  surface: '#ffffff',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7',
  muted: '#898781',
  secondary: '#52514e'
};

/*
 * Colour follows the entity, not its position in the current selection. A series keeps the slot
 * it was given for as long as it stays selected, so removing one line never repaints the others.
 */
export class SeriesSlots {

  private slotByName = new Map<string, number>();

  claim(name: string): boolean {
    if (this.slotByName.has(name)) {
      return true;
    }

    const taken = new Set(this.slotByName.values());
    for (var slot = 0; slot < MAX_SERIES; ++slot) {
      if (!taken.has(slot)) {
        this.slotByName.set(name, slot);
        return true;
      }
    }

    return false;
  }

  release(name: string): void {
    this.slotByName.delete(name);
  }

  colorOf(name: string): string {
    return SERIES_COLORS[this.slotByName.get(name) ?? 0];
  }

  isFull(): boolean {
    return this.slotByName.size >= MAX_SERIES;
  }

  has(name: string): boolean {
    return this.slotByName.has(name);
  }
}

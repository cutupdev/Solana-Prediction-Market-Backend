export function formatNumber(value: number): string {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)}B`;  // Display billions
    } else if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;      // Display millions
    } else if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;          // Display thousands
    } else {
        return value.toString();                          // Return as string
    }
}

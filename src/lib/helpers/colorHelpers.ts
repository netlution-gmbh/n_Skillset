function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
}

function intToHSL(int: number): string {
	const hue = int % 360;
	const saturation = 65 + (int % 20); // 65-85%
	const lightness = 75 + (int % 10); // 45-55%
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getDepartmentColor(department: string): string {
	return intToHSL(hashString(department));
}

export function getCategoryColor(category: string): string {
	return intToHSL(hashString(category) + 180); // offset by 180 to get different color range than departments
}

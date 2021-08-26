export type ClassConstructor<T> = new (...args: any[]) => T
export function arrayInsert<T>(array: T[], thing: T, index: number): void {
	const tail = array.splice(index);
	array.push(thing, ...tail);
}

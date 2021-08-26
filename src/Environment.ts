export class Environment {
  protected deps: Map<any, string> = new Map();
  protected usedNames: Set<string> = new Set();

  protected determineName(value: any) {
    return `__env_${this.deps.size}`;
  }

  protected registerValue(name: string, value: any) {
    if (this.usedNames.has(name)) {
      throw new Error(`Name '${name}' is already in use`);
    }
    this.deps.set(value, name);
    this.usedNames.add(name);
  }

  value(value: any, name?: string): string {
    if (name) {
      this.registerValue(name, value);
      return name;
    }

    if (this.deps.has(value)) {
      return this.deps.get(value) as string;
    }

    name = this.determineName(value);
    this.registerValue(name, value);

    return name;
  }

  buildFunction(body: string): (...args: any[]) => any {
    return new Function(...this.deps.values(), body)(...this.deps.keys());
  }
}

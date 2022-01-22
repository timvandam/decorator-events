/**
 * Branded type. Used to type variables inside the context
 */
export type ContextVariable<T> = string & { __brand__: 'environment'; __type__: T };

/**
 * Represents an execution context of some Javascript code.
 * Allows for evaluation of Javascript code with the stored variables globally available.
 */
export class Context {
  protected valueToVariableNames: Map<unknown, Set<string>> = new Map();
  protected usedVariableNames: Set<string> = new Set();

  /**
   * Determines the name of a new variable
   */
  protected determineNewVariableName(): string {
    return `__env_${this.usedVariableNames.size}`;
  }

  /**
   * Returns a Set containing all variable names for some variable.
   * Initializes the set if needed
   */
  protected getValueVariableNames(value: unknown): Set<string> {
    if (this.valueToVariableNames.has(value)) {
      return this.valueToVariableNames.get(value) as Set<string>;
    }

    const set = new Set<string>();
    this.valueToVariableNames.set(value, set);
    return set;
  }

  /**
   * Adds named value to the context
   */
  protected registerValue(name: string, value: unknown): void {
    if (this.usedVariableNames.has(name) && !this.valueToVariableNames.get(value)?.has(name)) {
      throw new Error(`Name '${name}' is already in use`);
    }

    this.getValueVariableNames(value).add(name);
    this.usedVariableNames.add(name);
  }

  /**
   * Adds a value to the context if not yet present.
   * Returns the variable name inside the context (the provided name if present, else an auto-generated one)
   */
  value<T>(value: T, name?: string): ContextVariable<T> {
    if (name) {
      this.registerValue(name, value);
      return name as ContextVariable<T>;
    }

    if (this.valueToVariableNames.has(value)) {
      // If this value is already present, simply return the first variable name
      return this.getValueVariableNames(value).values().next().value;
    }

    name = this.determineNewVariableName();
    this.registerValue(name, value);

    return name as ContextVariable<T>;
  }

  /**
   * Evaluates a Javascript string inside this context.
   * Dangerous! NEVER allow user input to be evaluated.
   * Returns whatever the Javascript string returns
   */
  evaluate(body: string): unknown {
    const parameterNames = [];
    const parameterValues = [];
    for (const [value, names] of this.valueToVariableNames) {
      for (const name of names) {
        parameterNames.push(name);
        parameterValues.push(value);
      }
    }
    return new Function(...parameterNames, body)(...parameterValues);
  }
}

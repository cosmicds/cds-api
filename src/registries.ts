import { Class } from "./models";

export interface ClassSetupParams {
  cls: Class;
  storyName: string;
  options?: Record<string, unknown>;
}

type ClassSetupFunction = (params: ClassSetupParams) => Promise<void>;

class ClassSetupRegistry {

  private members: { [storyName: string]: ClassSetupFunction[] | undefined } = {};
  
  register(storyName: string, setup: ClassSetupFunction) {
    if (!(storyName in this.members)) {
      this.members[storyName] = [];
    }
    this.members[storyName]?.push(setup);
  }

  unregister(setup: ClassSetupFunction, storyName: string) {
    const setups = this.members[storyName];
    if (!setups) {
      return;
    }

    const index = setups.indexOf(setup);
    if (index > -1) {
      setups.splice(index, 1);
    }
  }

  setupFunctions(storyName: string): ClassSetupFunction[] | undefined {
    return this.members[storyName];
  }

}

export const classSetupRegistry = new ClassSetupRegistry();

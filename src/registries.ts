import { Class } from "./models";

type ClassSetupFunction = (cls: Class, storyName: string) => void;

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

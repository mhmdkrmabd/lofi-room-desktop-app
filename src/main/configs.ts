interface WindowProperties {
  startup: {
    width: number;
    height: number;
  };
  titleSuffix: string;
}

export default class Configs {
  public readonly WindowProperties: WindowProperties;

  constructor() {
    this.WindowProperties = {
      startup: {
        width: 240,
        height: 310
      },
      titleSuffix: ' - Lofi Room'
    };
  }
}

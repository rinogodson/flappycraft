const schemaAndData: {
  birdSprite: {
    normal: (string | undefined)[];
    death: string | undefined;
  };
  pipeSprite: {
    sprite: string | undefined;
    fillType: "Stretch" | "Cover";
    distance: 1 | 2 | 3;
  };
  bg: {
    opacity: number;
    bgColor: string;
    baseColor: string;
    bgImg: { sprite: string | undefined; fillType: "Stretch" | "Cover" };
    baseImg: { sprite: string | undefined; fillType: "Stretch" | "Cover" };
  };
  sounds: {
    flap: string | undefined;
    death: string | undefined;
    bgMusic: { file: string | undefined; volume: number };
    point: string | undefined;
  };
  name: string;
} = {
  birdSprite: {
    normal: [""],
    death: undefined,
  },
  pipeSprite: { sprite: undefined, fillType: "Stretch", distance: 1 },
  bg: {
    opacity: 0.2,
    baseColor: "#4DC0CA",
    bgColor: "#DED895",
    bgImg: { sprite: undefined, fillType: "Cover" },
    baseImg: { sprite: undefined, fillType: "Stretch" },
  },
  sounds: {
    flap: undefined,
    death: undefined,
    bgMusic: { file: undefined, volume: 50 },
    point: undefined,
  },
  name: "",
};

export default schemaAndData;

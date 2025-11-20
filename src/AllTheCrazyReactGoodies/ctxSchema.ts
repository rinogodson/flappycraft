const schema: {
  birdSprite: { normal: [File?, File?, File?]; death: File | undefined };
  pipeSprite: { sprite: File | undefined; fillType: "Stretch" | "Cover" };
  bg: {
    bgImg: { sprite: File | undefined; fillType: "Stretch" | "Cover" };
    baseImg: { sprite: File | undefined; fillType: "Stretch" | "Cover" };
  };
  sounds: {
    flap: File | undefined;
    death: File | undefined;
    bgMusic: { file: File | undefined; volume: number };
    point: File | undefined;
  };
} = {
  birdSprite: { normal: [], death: undefined },
  pipeSprite: { sprite: undefined, fillType: "Stretch" },
  bg: {
    bgImg: { sprite: undefined, fillType: "Stretch" },
    baseImg: { sprite: undefined, fillType: "Stretch" },
  },
  sounds: {
    flap: undefined,
    death: undefined,
    bgMusic: { file: undefined, volume: 50 },
    point: undefined,
  },
};

export default schema;

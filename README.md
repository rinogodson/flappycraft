<img width="900" height="458" alt="bg" src="https://github.com/user-attachments/assets/58721986-61ce-4569-8e4d-2a1f3718985f" />

## FlappyCraft
Stack: ReactJS, TailwindCSS
### Framework to create your own version of Flappy Bird
#### This README was made using [READMEwizard](https://readme-wizard-three.vercel.app) (it's an app made by me :) [Check it out!](https://github.com/rinogodson/readme-wizard))

## Got no files to upload? Try These:
Save the files using `ctrl/cmd + s` and use them.
- **[Flappeagen](https://raw.githubusercontent.com/rinogodson/flappycraft/refs/heads/main/demofiles/flappeagen.flap) - Prime's a bird. He tries to avoid VSCode... Help him.**
- **[ZachTheBird](https://raw.githubusercontent.com/rinogodson/flappycraft/refs/heads/main/demofiles/zachthebird.flap) - Let's remember the issues with the Slack team... (We were at their gunpoint)**
- **[MuskyBird](https://raw.githubusercontent.com/rinogodson/flappycraft/refs/heads/main/demofiles/muskybird.flap) - Richest bird!!**


## Usage:
### You can create your own Flappy Bird by creating a JSON file with this schema and then uploading it to the app.
```json
{
  "birdSprite": {
    "normal": [ // for animation, this is the array of frames (max. 3 items)
      "<data_uri>", // image
      "<data_uri>", // image
      "<data_uri>"  // image
    ],
    "death": "<data_uri>" // image
  },
  "pipeSprite": {
    "sprite": "<data_uri>", // image
    "fillType": "Stretch",
    "distance": 1 // can be 1, 2, or 3 and nothing else
  },
  "bg": {
    "opacity": 0.1, // range 0.1 to 1, Background Opacity
    "bgColor": "#000000", // COLOR of Background
    "baseColor": "#000000", // COLOR of Base
    "bgImg": {
      "sprite": "<data_uri>", // image
      "fillType": "Cover"
    },
    "baseImg": {
      "sprite": "<data_uri>", // image
      "fillType": "Stretch"
    }
  },
  "sounds": {
    "flap": "<data_uri>", // audio
    "death": "<data_uri>", // audio
    "bgMusic": {
      "file": "<data_uri>", // audio
      "volume": 20 // range 20 to 100, if 0 don't add the file field (to save space)
    },
    "point": "<data_uri>" // audio
  },
  "name": "<name_of_the_game_maximum_25_chars>" // name of the game
}
```
## Controls:
### Desktop:
- Space/W/UpArrow to Flap
- Enter to Restart
### Mobile:
- Touch to Jump
---
## 🤝 Contributing  
Contributions are welcome! Please fork the repository and submit a pull request.  

1. Fork the project.  
2. Create a new branch:  
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. Commit your changes:  
   ```bash
   git commit -m "Add some feature"
   ```
4. Push the branch:  
   ```bash
   git push origin feature/YourFeatureName
   ```
5. Open a pull request.

## 📄 License  
This project is licensed under the [MIT License](LICENSE).

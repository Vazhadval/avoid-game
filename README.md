# 🎮 Avoid Game

A challenging HTML5 Canvas game where you control a hero square and must avoid enemy rectangles while surviving as long as possible.

## 🚀 Features

- **Real-time gameplay** with smooth 60 FPS animation
- **Mouse-controlled hero** that follows your cursor immediately
- **4 enemy rectangles** with different sizes and colors
- **Dynamic collision detection** with walls and enemies
- **Live timer** showing survival time
- **Firebase-powered leaderboard** with top 3 players
- **Responsive design** that works on desktop and mobile
- **Beautiful UI** with modern styling and animations

## 🎯 How to Play

1. **Enter your name** in the input field
2. **Click "Start Game"** or press Enter
3. **Move your mouse** to control the hero square
4. **Avoid the enemy rectangles** and canvas edges
5. **Survive as long as possible** to achieve a high score
6. **Your best time** will be saved to the leaderboard

## 🏆 Leaderboard System

- **Top 3 players** displayed with gold, silver, and bronze medals
- **One entry per player** - only your best time is saved
- **Real-time updates** when new scores are achieved
- **Firebase Firestore** backend for reliable data storage

## 🛠️ Technical Details

### Built With
- **HTML5 Canvas** for game rendering
- **Vanilla JavaScript (ES6)** for game logic
- **CSS3** for styling and animations
- **Firebase Firestore** for leaderboard data

### Game Mechanics
- **Hero size**: 55x55 pixels
- **Enemy sizes**: Various rectangles (50x100 to 130x50)
- **Canvas size**: 400x450 pixels
- **Enemy speed**: 3.5 pixels per frame
- **Collision detection**: Axis-Aligned Bounding Box (AABB)

### Firebase Configuration
The game uses Firebase Firestore for the leaderboard. The configuration is included in the code and connects to a Firebase project.

## 📁 Project Structure

```
Avoid/
├── index.html          # Main HTML file
├── style.css           # Game styling and animations
├── script.js           # Game logic and Firebase integration
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for Firebase leaderboard)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/avoid-game.git
   cd avoid-game
   ```

2. **Open in browser**:
   - Double-click `index.html` or
   - Use a local server: `python -m http.server 8000`

3. **Start playing**:
   - Enter your name
   - Click "Start Game"
   - Avoid the enemies!

## 🎨 Customization

The game is designed to be easily customizable. You can modify these variables in `script.js`:

```javascript
// Game settings
this.canvasWidth = 400;        // Canvas width
this.canvasHeight = 450;       // Canvas height
this.enemySpeed = 3.5;         // Enemy movement speed
this.heroSize = 55;            // Hero square size
this.enemySize1 = { width: 100, height: 50 };  // Enemy 1 size
// ... more enemy sizes
```

## 🔧 Development

### Adding New Features
- **New enemies**: Add to `initializeEnemies()` method
- **Power-ups**: Implement in `update()` method
- **Different game modes**: Create new game state handlers
- **Sound effects**: Add audio elements and event listeners

### Firebase Setup
To use your own Firebase project:
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Replace the `firebaseConfig` object in `script.js`
4. Set up Firestore security rules

## 📱 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Firebase** for the backend database
- **HTML5 Canvas API** for game rendering
- **CSS3** for beautiful styling and animations

## 📞 Support

If you have any questions or issues:
- Create an issue on GitHub
- Contact the developer

---

**Enjoy playing Avoid! 🎮**

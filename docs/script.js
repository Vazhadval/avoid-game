// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCi1DUIxnawKhwooFnt5pctFA0TwuZmTqU",
    authDomain: "avoid-abe2c.firebaseapp.com",
    projectId: "avoid-abe2c",
    storageBucket: "avoid-abe2c.firebasestorage.app",
    messagingSenderId: "1052555468482",
    appId: "1:1052555468482:web:efa0cca16402f618ee655b",
    measurementId: "G-Z3FDLJVRBX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class AvoidGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.startButton = document.getElementById('startButton');
        this.timerElement = document.getElementById('timer');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.finalTimeElement = document.getElementById('finalTime');
        this.playerNameInput = document.getElementById('playerName');
        this.leaderboardList = document.getElementById('leaderboardList');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        
        // Dark mode state
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.applyTheme();
        
        // Game state
        this.isGameRunning = false;
        this.startTime = 0;
        this.currentTime = 0;
        this.gameLoop = null;
        this.playerName = '';
        
        // Game settings
        this.canvasWidth = 400; // Easy to adjust canvas width here
        this.canvasHeight = 450; // Easy to adjust canvas height here
        this.enemySpeed = 3.5; // Easy to adjust enemy speed here
        this.heroSize = 55; // Easy to adjust hero square size here
        this.enemySize1 = { width: 100, height: 50 }; // Easy to adjust enemy 1 size here
        this.enemySize2 = { width: 80, height: 110 }; // Easy to adjust enemy 2 size here
        this.enemySize3 = { width: 70, height: 120 }; // Easy to adjust enemy 3 size here
        this.enemySize4 = { width: 130, height: 50 }; // Easy to adjust enemy 4 size here
        
        // Set canvas dimensions
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // Hero (player)
        this.hero = {
            x: this.canvasWidth / 2,
            y: this.canvasHeight / 2,
            size: this.heroSize,
            color: '#4ecdc4'
        };
        
        // Enemies
        this.enemies = [];
        this.initializeEnemies();
        
        // Mouse position
        this.mouseX = this.hero.x;
        this.mouseY = this.hero.y;
        
        // Event listeners
        this.setupEventListeners();
        
        // Load leaderboard
        this.loadLeaderboard();
        
        // Start with overlay visible
        this.showStartScreen();
    }
    
    getRandomSpeed() {
        // Returns constant speed with random direction (positive or negative)
        return Math.random() < 0.5 ? this.enemySpeed : -this.enemySpeed;
    }
    
    initializeEnemies() {
        this.enemies = [
            {
                x: 0, // Top-left corner
                y: 0,
                width: this.enemySize1.width,
                height: this.enemySize1.height,
                speedX: this.getRandomSpeed(),
                speedY: this.getRandomSpeed(),
                color: '#ff6b6b'
            },
            {
                x: this.canvasWidth - this.enemySize2.width, // Top-right corner
                y: 0,
                width: this.enemySize2.width,
                height: this.enemySize2.height,
                speedX: this.getRandomSpeed(),
                speedY: this.getRandomSpeed(),
                color: '#ffa726'
            },
            {
                x: 0, // Bottom-left corner
                y: this.canvasHeight - this.enemySize3.height,
                width: this.enemySize3.width,
                height: this.enemySize3.height,
                speedX: this.getRandomSpeed(),
                speedY: this.getRandomSpeed(),
                color: '#ab47bc'
            },
            {
                x: this.canvasWidth - this.enemySize4.width, // Bottom-right corner
                y: this.canvasHeight - this.enemySize4.height,
                width: this.enemySize4.width,
                height: this.enemySize4.height,
                speedX: this.getRandomSpeed(),
                speedY: this.getRandomSpeed(),
                color: '#26a69a'
            }
        ];
    }
    
    setupEventListeners() {
        // Mouse movement - track mouse globally to fix out-of-bounds issue
        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        // Start button
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });
        
        // Player name input - Enter key to start game
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });
        
        // Dark mode toggle
        this.darkModeToggle.addEventListener('click', () => {
            this.toggleDarkMode();
        });
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
    }
    
    applyTheme() {
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.darkModeToggle.querySelector('.toggle-icon').textContent = '☀️';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            this.darkModeToggle.querySelector('.toggle-icon').textContent = '🌙';
        }
    }
    
    showStartScreen() {
        this.gameOverlay.classList.remove('hidden');
        this.overlayTitle.textContent = 'Avoid the enemies!';
        this.overlayMessage.textContent = 'Enter your name and start the game!';
        this.startButton.textContent = 'Start Game';
        this.finalTimeElement.textContent = '';
        this.playerNameInput.style.display = 'block';
        this.playerNameInput.focus();
    }
    
    showGameOverScreen() {
        this.gameOverlay.classList.remove('hidden');
        this.overlayTitle.textContent = 'Game Over!';
        this.overlayMessage.textContent = 'You hit an enemy or the wall. Try again!';
        this.startButton.textContent = 'Play Again';
        this.finalTimeElement.textContent = `Survived: ${this.currentTime.toFixed(2)} seconds`;
        this.playerNameInput.style.display = 'block';
        
        // Save score to leaderboard
        this.saveScore();
    }
    
    startGame() {
        // Validate player name
        this.playerName = this.playerNameInput.value.trim();
        if (!this.playerName) {
            alert('Please enter your name!');
            this.playerNameInput.focus();
            return;
        }
        
        this.isGameRunning = true;
        this.startTime = Date.now();
        this.currentTime = 0;
        this.gameOverlay.classList.add('hidden');
        
        // Reset hero position
        this.hero.x = this.canvasWidth / 2;
        this.hero.y = this.canvasHeight / 2;
        this.mouseX = this.hero.x;
        this.mouseY = this.hero.y;
        
        // Reset enemies
        this.initializeEnemies();
        
        // Start game loop
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 1000 / 60); // 60 FPS
    }
    
    endGame() {
        this.isGameRunning = false;
        clearInterval(this.gameLoop);
        this.showGameOverScreen();
    }
    
    update() {
        if (!this.isGameRunning) return;
        
        // Update timer
        this.currentTime = (Date.now() - this.startTime) / 1000;
        this.timerElement.textContent = this.currentTime.toFixed(2);
        
        // Update hero position (immediate following with center offset)
        this.hero.x = this.mouseX - this.hero.size / 2;
        this.hero.y = this.mouseY - this.hero.size / 2;
        
        // Update enemies
        this.updateEnemies();
        
        // Check collisions
        if (this.checkCollisions()) {
            this.endGame();
        }
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            // Move enemy
            enemy.x += enemy.speedX;
            enemy.y += enemy.speedY;
            
            // Bounce off walls
            if (enemy.x <= 0 || enemy.x + enemy.width >= this.canvasWidth) {
                enemy.speedX = -enemy.speedX;
                enemy.x = Math.max(0, Math.min(enemy.x, this.canvasWidth - enemy.width));
            }
            
            if (enemy.y <= 0 || enemy.y + enemy.height >= this.canvasHeight) {
                enemy.speedY = -enemy.speedY;
                enemy.y = Math.max(0, Math.min(enemy.y, this.canvasHeight - enemy.height));
            }
        });
    }
    
    checkCollisions() {
        // Check wall collisions
        if (this.hero.x <= 0 || this.hero.x + this.hero.size >= this.canvasWidth ||
            this.hero.y <= 0 || this.hero.y + this.hero.size >= this.canvasHeight) {
            return true;
        }
        
        // Check enemy collisions
        for (const enemy of this.enemies) {
            if (this.hero.x < enemy.x + enemy.width &&
                this.hero.x + this.hero.size > enemy.x &&
                this.hero.y < enemy.y + enemy.height &&
                this.hero.y + this.hero.size > enemy.y) {
                return true;
            }
        }
        
        return false;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw hero
        this.ctx.fillStyle = this.hero.color;
        this.ctx.fillRect(this.hero.x, this.hero.y, this.hero.size, this.hero.size);
        
        // Add glow effect to hero
        this.ctx.shadowColor = this.hero.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.hero.x, this.hero.y, this.hero.size, this.hero.size);
        this.ctx.shadowBlur = 0;
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Add glow effect to enemies
            this.ctx.shadowColor = enemy.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            this.ctx.shadowBlur = 0;
        });
        
        // Draw center indicator (optional)
        if (!this.isGameRunning) {
            this.ctx.strokeStyle = this.isDarkMode ? '#4ecdc4' : '#4a5568';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(
                this.canvasWidth / 2 - 30,
                this.canvasHeight / 2 - 30,
                60,
                60
            );
            this.ctx.setLineDash([]);
        }
    }
    
    // Firebase Leaderboard Functions
    async saveScore() {
        if (!this.playerName || this.currentTime <= 0) return;
        
        try {
            // Check if player already has a score
            const existingScore = await db.collection('leaderboard')
                .where('name', '==', this.playerName)
                .limit(1)
                .get();
            
            if (!existingScore.empty) {
                const existingData = existingScore.docs[0].data();
                const existingTime = existingData.time;
                
                // Only update if new time is better (higher)
                if (this.currentTime > existingTime) {
                    await existingScore.docs[0].ref.update({
                        time: this.currentTime,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('Better score updated successfully!');
                } else {
                    console.log('New score is not better than existing score');
                }
            } else {
                // Player doesn't exist, add new entry
                await db.collection('leaderboard').add({
                    name: this.playerName,
                    time: this.currentTime,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('New player score saved successfully!');
            }
            
            // Reload leaderboard after saving
            this.loadLeaderboard();
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }
    
    async loadLeaderboard() {
        try {
            this.leaderboardList.innerHTML = '<div class="loading-leaderboard">Loading leaderboard...</div>';
            
            const snapshot = await db.collection('leaderboard')
                .orderBy('time', 'desc')
                .limit(3)
                .get();
            
            this.leaderboardList.innerHTML = '';
            
            if (snapshot.empty) {
                this.leaderboardList.innerHTML = '<div class="loading-leaderboard">No scores yet. Be the first!</div>';
                return;
            }
            
            const medals = ['🥇', '🥈', '🥉'];
            const ranks = ['rank-1', 'rank-2', 'rank-3'];
            
            snapshot.docs.forEach((doc, index) => {
                const data = doc.data();
                const item = document.createElement('div');
                item.className = `leaderboard-item ${ranks[index]}`;
                
                item.innerHTML = `
                    <div class="leaderboard-rank">
                        <span class="medal">${medals[index]}</span>
                        <span class="leaderboard-name">${data.name}</span>
                    </div>
                    <div class="leaderboard-time">${data.time.toFixed(2)}s</div>
                `;
                
                this.leaderboardList.appendChild(item);
            });
            
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.leaderboardList.innerHTML = '<div class="loading-leaderboard">Error loading leaderboard</div>';
        }
    }
    
    // Temporary function to clear all leaderboard data
    async clearLeaderboard() {
        try {
            const snapshot = await db.collection('leaderboard').get();
            const batch = db.batch();
            
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            console.log('Leaderboard cleared successfully!');
            this.loadLeaderboard(); // Reload to show empty state
        } catch (error) {
            console.error('Error clearing leaderboard:', error);
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AvoidGame();
});
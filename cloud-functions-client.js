// Updated client-side code to use Cloud Functions for score submission
// This approach uses a callable function instead of direct Firestore writes

// Add this to your script.js file to replace the direct Firestore approach

class AvoidGameWithCloudFunctions extends AvoidGame {
    
    // Override the saveScore method to use Cloud Functions
    async saveScore() {
        if (!this.playerName || this.currentTime <= 0 || !this.currentGameId) return;
        
        try {
            // Call the Cloud Function instead of direct Firestore update
            const submitScore = firebase.functions().httpsCallable('submitScore');
            
            const result = await submitScore({
                gameId: this.currentGameId,
                playerName: this.playerName,
                finalTime: this.currentTime
            });
            
            console.log('Score submitted via Cloud Function:', result.data);
            
            // Clear current game session data
            this.currentGameId = null;
            this.gameSessionDocRef = null;
            
            // Reload leaderboard
            this.loadLeaderboard();
            
        } catch (error) {
            console.error('Error submitting score via Cloud Function:', error);
            
            // Show user-friendly error message
            if (error.code === 'functions/failed-precondition') {
                alert('Invalid game session. Please start a new game.');
            } else if (error.code === 'functions/permission-denied') {
                alert('Player name mismatch. Please start a new game.');
            } else {
                alert('Failed to submit score. Please try again.');
            }
        }
    }
    
    // Alternative method: Validate before any score operations
    async validateActiveGameSession(gameId, playerName) {
        try {
            const validateSession = firebase.functions().httpsCallable('validateSession');
            
            const result = await validateSession({
                gameId: gameId,
                playerName: playerName
            });
            
            return result.data.valid;
            
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    }
}

// Usage examples:

// 1. Replace the original game class
// const game = new AvoidGameWithCloudFunctions();

// 2. Or add manual validation to existing code
async function manualScoreSubmission(gameId, playerName, finalTime) {
    try {
        const submitScore = firebase.functions().httpsCallable('submitScore');
        
        const result = await submitScore({
            gameId: gameId,
            playerName: playerName,
            finalTime: finalTime
        });
        
        console.log('Manual score submission successful:', result.data);
        return true;
        
    } catch (error) {
        console.error('Manual score submission failed:', error.message);
        return false;
    }
}

// 3. Validate any game session manually
async function checkGameSession(gameId, playerName) {
    try {
        const validateSession = firebase.functions().httpsCallable('validateSession');
        
        const result = await validateSession({
            gameId: gameId,
            playerName: playerName
        });
        
        console.log('Game session validation:', result.data);
        return result.data.valid;
        
    } catch (error) {
        console.error('Validation failed:', error);
        return false;
    }
}

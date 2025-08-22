// Cloud Functions for Firebase - Server-side validation
// npm install firebase-functions firebase-admin
// Deploy with: firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Trigger function that validates game session updates
exports.validateGameSession = functions.firestore
  .document('gameSessions/{gameSessionId}')
  .onWrite(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // If document is being deleted, allow it
    if (!after) {
      return null;
    }
    
    // If this is a new document creation
    if (!before) {
      // Validate new game session creation
      if (after.status !== 'active') {
        console.error('Invalid game session creation: status must be active');
        // Delete the invalid document
        await change.after.ref.delete();
        return null;
      }
      
      if (after.finalTime !== null || after.endTime !== null) {
        console.error('Invalid game session creation: finalTime and endTime must be null');
        await change.after.ref.delete();
        return null;
      }
      
      console.log('Valid game session created:', context.params.gameSessionId);
      return null;
    }
    
    // If this is an update
    if (before && after) {
      // Check if trying to update from non-active status
      if (before.status !== 'active') {
        console.error('Invalid update: can only update active game sessions');
        // Revert the changes
        await change.after.ref.set(before);
        return null;
      }
      
      // Check if updating to finished with invalid data
      if (after.status === 'finished') {
        if (!after.finalTime || after.finalTime <= 0 || after.finalTime > 300) {
          console.error('Invalid finalTime for finished game');
          await change.after.ref.set(before);
          return null;
        }
        
        // Check if game duration is reasonable
        const startTime = before.startTime.toMillis();
        const endTime = after.endTime.toMillis();
        const duration = (endTime - startTime) / 1000;
        
        if (duration < 1 || duration > 600) { // 1 second to 10 minutes
          console.error('Invalid game duration:', duration);
          await change.after.ref.set(before);
          return null;
        }
        
        console.log('Game session finished successfully:', context.params.gameSessionId);
      }
    }
    
    return null;
  });

// Callable function for submitting scores with validation
exports.submitScore = functions.https.onCall(async (data, context) => {
  try {
    const { gameId, playerName, finalTime } = data;
    
    // Validate input
    if (!gameId || !playerName || !finalTime) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    
    // Check if game session exists and is active
    const gameSessionQuery = await db.collection('gameSessions')
      .where('gameId', '==', gameId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (gameSessionQuery.empty) {
      throw new functions.https.HttpsError('failed-precondition', 'No active game session found');
    }
    
    const gameSessionDoc = gameSessionQuery.docs[0];
    const gameSessionData = gameSessionDoc.data();
    
    // Validate player name matches
    if (gameSessionData.playerName !== playerName) {
      throw new functions.https.HttpsError('permission-denied', 'Player name mismatch');
    }
    
    // Validate reasonable final time
    if (finalTime <= 0 || finalTime > 300) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid final time');
    }
    
    // Check game duration
    const startTime = gameSessionData.startTime.toMillis();
    const now = Date.now();
    const duration = (now - startTime) / 1000;
    
    if (duration < 1 || duration > 600) {
      throw new functions.https.HttpsError('failed-precondition', 'Invalid game duration');
    }
    
    // Update the game session to finished
    await gameSessionDoc.ref.update({
      status: 'finished',
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      finalTime: finalTime
    });
    
    return { 
      success: true, 
      message: 'Score submitted successfully',
      gameId: gameId 
    };
    
  } catch (error) {
    console.error('Error submitting score:', error);
    throw new functions.https.HttpsError('internal', 'Failed to submit score');
  }
});

// Cleanup function for abandoned sessions
exports.cleanupAbandonedSessions = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const oneHourAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
    
    const abandonedSessions = await db.collection('gameSessions')
      .where('status', '==', 'active')
      .where('createdAt', '<', oneHourAgo)
      .get();
    
    const batch = db.batch();
    
    abandonedSessions.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'abandoned',
        endTime: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    if (!abandonedSessions.empty) {
      await batch.commit();
      console.log(`Cleaned up ${abandonedSessions.size} abandoned sessions`);
    }
    
    return null;
  });

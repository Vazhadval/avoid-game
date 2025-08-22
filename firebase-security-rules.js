// Firebase Security Rules for Firestore
// Copy this to your Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Game Sessions Collection Rules
    match /gameSessions/{gameSessionId} {
      
      // Allow reading game sessions
      allow read: if true;
      
      // Allow creating new game sessions, but only with 'active' status
      allow create: if 
        // Must be authenticated (optional - remove if you want anonymous)
        // request.auth != null &&
        
        // Document must have required fields
        request.resource.data.keys().hasAll([
          'gameId', 'playerName', 'status', 'startTime', 'createdAt'
        ]) &&
        
        // Status must be 'active' when creating
        request.resource.data.status == 'active' &&
        
        // finalTime and endTime must be null when creating
        request.resource.data.finalTime == null &&
        request.resource.data.endTime == null &&
        
        // startTime and createdAt must be server timestamps
        request.resource.data.startTime == request.time &&
        request.resource.data.createdAt == request.time &&
        
        // Player name must be a valid string (1-20 characters)
        request.resource.data.playerName is string &&
        request.resource.data.playerName.size() >= 1 &&
        request.resource.data.playerName.size() <= 20 &&
        
        // GameId must follow the expected format
        request.resource.data.gameId is string &&
        request.resource.data.gameId.matches('game_[0-9]+_[a-z0-9]+');
      
      // Allow updating game sessions, but only from 'active' to 'finished'
      allow update: if 
        // Can only update if current status is 'active'
        resource.data.status == 'active' &&
        
        // New status must be 'finished' or 'abandoned'
        (request.resource.data.status == 'finished' || 
         request.resource.data.status == 'abandoned') &&
        
        // Cannot change immutable fields
        request.resource.data.gameId == resource.data.gameId &&
        request.resource.data.playerName == resource.data.playerName &&
        request.resource.data.startTime == resource.data.startTime &&
        request.resource.data.createdAt == resource.data.createdAt &&
        
        // Must set endTime when finishing
        request.resource.data.endTime == request.time &&
        
        // If status is 'finished', must have valid finalTime
        (request.resource.data.status != 'finished' || 
         (request.resource.data.finalTime is number &&
          request.resource.data.finalTime > 0 &&
          request.resource.data.finalTime < 300)) && // Max 5 minutes survival
        
        // Game duration must be reasonable (between 1 second and 10 minutes)
        (request.time.toMillis() - resource.data.startTime.toMillis()) >= 1000 &&
        (request.time.toMillis() - resource.data.startTime.toMillis()) <= 600000;
      
      // Prevent deletion of game sessions
      allow delete: if false;
    }
    
    // Deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

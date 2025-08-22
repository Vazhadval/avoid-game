// Test the Firebase Security Rules
// Open browser console and run these tests after setting up the rules

console.log('🧪 Testing Firebase Security Rules...');

// Test 1: Try to create a game session with status 'finished' (should FAIL)
async function testInvalidCreation() {
    try {
        await db.collection('gameSessions').add({
            gameId: 'fake_123',
            playerName: 'Cheater',
            status: 'finished', // This should be blocked!
            finalTime: 999.99,
            startTime: firebase.firestore.FieldValue.serverTimestamp(),
            endTime: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('❌ TEST FAILED: Invalid creation was allowed!');
    } catch (error) {
        console.log('✅ TEST PASSED: Invalid creation blocked -', error.message);
    }
}

// Test 2: Try to create a valid active game session (should SUCCEED)
async function testValidCreation() {
    try {
        const doc = await db.collection('gameSessions').add({
            gameId: 'game_' + Date.now() + '_test123',
            playerName: 'TestPlayer',
            status: 'active', // This should work
            startTime: firebase.firestore.FieldValue.serverTimestamp(),
            endTime: null,
            finalTime: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ TEST PASSED: Valid creation allowed -', doc.id);
        return doc;
    } catch (error) {
        console.log('❌ TEST FAILED: Valid creation blocked -', error.message);
        return null;
    }
}

// Test 3: Try to update a finished game session (should FAIL)
async function testInvalidUpdate(docRef) {
    if (!docRef) return;
    
    try {
        // First finish the game properly
        await docRef.update({
            status: 'finished',
            endTime: firebase.firestore.FieldValue.serverTimestamp(),
            finalTime: 25.5
        });
        
        // Then try to update it again (should fail)
        await docRef.update({
            finalTime: 999.99 // This should be blocked!
        });
        console.log('❌ TEST FAILED: Update of finished game was allowed!');
    } catch (error) {
        console.log('✅ TEST PASSED: Update of finished game blocked -', error.message);
    }
}

// Run all tests
async function runSecurityTests() {
    console.log('🚀 Starting security tests...');
    
    await testInvalidCreation();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const validDoc = await testValidCreation();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await testInvalidUpdate(validDoc);
    
    console.log('🏁 Security tests completed!');
}

// To run the tests, call this function in the browser console:
// runSecurityTests();

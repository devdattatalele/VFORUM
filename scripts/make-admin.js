// Admin Setup Script
// Run this script to make a user an admin
// Usage: node scripts/make-admin.js <email>

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin (you'll need to set up service account)
// For now, this is a template - you'll need to configure it with your Firebase project

const serviceAccount = {
  // Add your Firebase service account key here
  // You can download this from Firebase Console > Project Settings > Service Accounts
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Add your Firebase project ID here
    // projectId: 'your-project-id'
  });
}

const db = admin.firestore();

async function makeUserAdmin(email) {
  try {
    console.log(`Searching for user with email: ${email}`);
    
    // Search for user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('No user found with that email address.');
      console.log('Make sure the user has signed up first.');
      return;
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    console.log(`Found user: ${userData.displayName || userData.email}`);
    
    // Update user role to admin
    await userDoc.ref.update({
      role: 'admin',
      permissions: [
        'read_forums',
        'create_questions',
        'vote',
        'create_events',
        'manage_events',
        'manage_users',
        'moderate_forums',
        'delete_content'
      ],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Successfully made ${userData.displayName || userData.email} an admin!`);
    console.log('The user will need to refresh their browser to see the changes.');
    
  } catch (error) {
    console.error('Error making user admin:', error);
  }
}

async function makeUserModerator(email) {
  try {
    console.log(`Searching for user with email: ${email}`);
    
    // Search for user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('No user found with that email address.');
      console.log('Make sure the user has signed up first.');
      return;
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    console.log(`Found user: ${userData.displayName || userData.email}`);
    
    // Update user role to moderator
    await userDoc.ref.update({
      role: 'moderator',
      permissions: [
        'read_forums',
        'create_questions',
        'vote',
        'create_events',
        'manage_events',
        'moderate_forums'
      ],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Successfully made ${userData.displayName || userData.email} a moderator!`);
    console.log('The user will need to refresh their browser to see the changes.');
    
  } catch (error) {
    console.error('Error making user moderator:', error);
  }
}

// Command line usage
const args = process.argv.slice(2);
const command = args[0];
const email = args[1];

if (!command || !email) {
  console.log('Usage:');
  console.log('  node scripts/make-admin.js admin <email>');
  console.log('  node scripts/make-admin.js moderator <email>');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/make-admin.js admin devdatta@vit.edu.in');
  console.log('  node scripts/make-admin.js moderator student@vit.edu.in');
  process.exit(1);
}

if (command === 'admin') {
  makeUserAdmin(email);
} else if (command === 'moderator') {
  makeUserModerator(email);
} else {
  console.log('Invalid command. Use "admin" or "moderator"');
  process.exit(1);
} 
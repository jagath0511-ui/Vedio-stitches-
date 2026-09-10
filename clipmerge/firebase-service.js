/**
 * ClipMerge - Firebase Cloud & Authentication Service
 * Manages Firebase Auth (Google Sign-In with Calendar & Gmail scopes),
 * Cloud Firestore project records, and local project history.
 */

export class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.currentUser = null;
    this.googleAccessToken = null;
    this.isInitialized = false;

    // Load saved Firebase credentials if available
    const savedConfig = localStorage.getItem('clipmerge_firebase_config');
    this.config = savedConfig ? JSON.parse(savedConfig) : null;
  }

  /**
   * Save and initialize custom Firebase project config
   */
  async configure(config) {
    this.config = config;
    if (config && config.apiKey && config.projectId) {
      localStorage.setItem('clipmerge_firebase_config', JSON.stringify(config));
      await this.init();
    } else {
      localStorage.removeItem('clipmerge_firebase_config');
      this.app = null;
      this.auth = null;
      this.db = null;
      this.isInitialized = false;
    }
  }

  hasConfig() {
    return !!(this.config && this.config.apiKey && this.config.projectId);
  }

  /**
   * Initialize Firebase SDK
   */
  async init() {
    if (this.isInitialized && this.app) return true;
    if (!this.hasConfig()) return false;

    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js');
      const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');

      this.app = initializeApp(this.config);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
      });

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('Firebase initialization error:', err.message);
      return false;
    }
  }

  /**
   * Sign in with Google requesting Calendar & Gmail access scopes
   */
  async signInWithGoogle() {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.auth) {
      // Demo mock user if Firebase project is not provisioned
      const mockUser = {
        uid: 'demo_user_' + Date.now(),
        displayName: 'Demo Creator',
        email: 'creator@example.com',
        photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=ClipMerge',
        isDemo: true,
      };
      this.currentUser = mockUser;
      return { user: mockUser, isDemo: true };
    }

    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js');
      const provider = new GoogleAuthProvider();

      // Request Google Calendar & Gmail permissions for workspace features
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      provider.addScope('https://www.googleapis.com/auth/gmail.send');

      const result = await signInWithPopup(this.auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      this.googleAccessToken = credential?.accessToken || null;
      this.currentUser = result.user;

      return {
        user: result.user,
        accessToken: this.googleAccessToken,
      };
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    if (this.auth) {
      const { signOut } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js');
      await signOut(this.auth);
    }
    this.currentUser = null;
    this.googleAccessToken = null;
  }

  getUser() {
    return this.currentUser;
  }

  getGoogleAccessToken() {
    return this.googleAccessToken;
  }

  /**
   * Save merge project to Cloud Firestore or local project history
   */
  async saveProject(projectData) {
    const record = {
      ...projectData,
      id: projectData.id || `proj_${Date.now()}`,
      userId: this.currentUser?.uid || 'guest',
      userEmail: this.currentUser?.email || 'guest',
      createdAt: new Date().toISOString(),
    };

    // Attempt Firestore save if online
    if (this.isInitialized && this.db && this.currentUser && !this.currentUser.isDemo) {
      try {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');
        const docRef = await addDoc(collection(this.db, 'clipmerge_projects'), record);
        record.firestoreId = docRef.id;
      } catch (err) {
        console.warn('Firestore save failed, falling back to local storage:', err.message);
      }
    }

    // Save to local storage project history
    try {
      const localHistory = JSON.parse(localStorage.getItem('clipmerge_projects') || '[]');
      localHistory.unshift(record);
      // Keep last 20 projects
      localStorage.setItem('clipmerge_projects', JSON.stringify(localHistory.slice(0, 20)));
    } catch (e) {
      console.warn('Local project save error:', e);
    }

    return record;
  }

  /**
   * Get project history
   */
  async getProjects() {
    // Check local projects
    const localProjects = JSON.parse(localStorage.getItem('clipmerge_projects') || '[]');
    return localProjects;
  }
}


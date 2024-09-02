import { auth, db } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect } from 'react';
import Home from './pages/Home'
import SignIn from './pages/SignIn'

function App() {
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
      }, { merge: true });
    }
  }, [user]);

  return (
    <div className="App">
      {user ? <Home user={user} /> : <SignIn />}
    </div>
  );
}

export default App;

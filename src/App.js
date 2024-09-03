import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect } from 'react';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);

      setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || 'Anonymous', // Providing a default value for displayName
        photoURL: user.photoURL || '',          // Providing a default value for photoURL
        email: user.email || '',                // Providing a default value for email
      }, { merge: true })
        .then(() => {
          // toast.success("User data updated successfully.");
        })
        .catch((err) => {
          console.error("Error setting user document: ", err);
          // toast.error("Failed to update user data.");
        });
    }
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-xl">Loading...</div>
    </div>; // A simple centered loading indicator
  }

  if (error) {
    console.error("Authentication error: ", error);
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">Error: {error.message}</div>
      </div>
    ); // A simple centered error message
  }

  return (
    <div className="App">
      {user ? <Home user={user} /> : <SignIn />}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
    </div>
  );
}

export default App;

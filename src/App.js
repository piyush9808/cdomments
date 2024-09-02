import React from 'react';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      {user ? <Home /> : <SignIn />}
    </div>
  );
}

export default App;
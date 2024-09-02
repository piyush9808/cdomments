import React from 'react';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

function LoginButton() {
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider).catch((error) => {
      console.error("Error signing in with Google", error);
    });
  };

  return (
    <button
      onClick={signInWithGoogle}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Sign in with Google
    </button>
  );
}

export default LoginButton;

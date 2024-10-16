import { signOut } from 'firebase/auth';
import { auth } from './api/firebase';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate('/');
      alert('Logged out successfully');
    });
  };

  return (
    <>
      {user && (
        <>
          <h1>{user.displayName}</h1>
          <img src={user.photoURL} alt='profile' height='200px' />
        </>
      )}
      <button onClick={handleSignOut}>Log Out</button>
    </>
  );
};

export default Profile;

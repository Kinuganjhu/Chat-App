import { useEffect, useState } from 'react';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from './api/firebase';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');

  useEffect(() => {
    // Set the current authenticated user
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setNewDisplayName(currentUser.displayName || '');
      setNewPhotoURL(currentUser.photoURL || '');
    }
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        alert('Logged out successfully');
        navigate('/'); // Redirect to the home page after logout
      })
      .catch((error) => {
        console.error('Error signing out:', error);
        alert('Failed to log out. Please try again.');
      });
  };

  const handleUpdateProfile = () => {
    if (auth.currentUser) {
      updateProfile(auth.currentUser, {
        displayName: newDisplayName,
        photoURL: newPhotoURL,
      })
        .then(() => {
          // Update the user state after successful profile update
          setUser({
            ...auth.currentUser,
            displayName: newDisplayName,
            photoURL: newPhotoURL,
          });
          alert('Profile updated successfully!');
        })
        .catch((error) => {
          console.error('Error updating profile:', error);
          alert('Failed to update profile. Please try again.');
        });
    }
  };

  return (
    <ProfileContainer>
      {user ? (
        <>
          <ProfileImage
            src={user.photoURL || 'https://via.placeholder.com/150'}
            alt="Profile"
          />
          <h1>{user.displayName}</h1>
          <Email>{user.email}</Email>

          <InputContainer>
            <label>Change Name:</label>
            <ProfileInput
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
            />
          </InputContainer>

          <InputContainer>
            <label>Change Profile Picture URL:</label>
            <ProfileInput
              type="text"
              value={newPhotoURL}
              onChange={(e) => setNewPhotoURL(e.target.value)}
            />
          </InputContainer>

          <UpdateButton onClick={handleUpdateProfile}>
            Update Profile
          </UpdateButton>

          <LogoutButton onClick={handleSignOut}>Log Out</LogoutButton>
        </>
      ) : (
        <h1>Loading...</h1>
      )}
    </ProfileContainer>
  );
};

export default Profile;

// Styled-components
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 50px;
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-top: 20px;
`;

const Email = styled.p`
  font-size: 1.2em;
  color: #555;
  margin-top: 10px;
`;

const InputContainer = styled.div`
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const ProfileInput = styled.input`
  padding: 10px;
  font-size: 1em;
  width: 300px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const UpdateButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1em;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  &:hover {
    background-color: #218838;
  }
`;

const LogoutButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1em;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  &:hover {
    background-color: #0056b3;
  }
`;

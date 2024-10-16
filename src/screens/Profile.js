import { useEffect, useState } from 'react';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from './api/firebase';
import { useNavigate } from 'react-router-dom';
import AvatarEditor from 'react-avatar-editor';
import styled from 'styled-components';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [image, setImage] = useState(null); // Holds the uploaded image
  const [scale, setScale] = useState(1.2); // Scale for cropping
  const [editor, setEditor] = useState(null); // Reference to AvatarEditor

  useEffect(() => {
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
        navigate('/');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
        alert('Failed to log out. Please try again.');
      });
  };

  const handleUpdateProfile = () => {
    if (editor) {
      const canvas = editor.getImage().toDataURL(); // Get cropped image as base64
      updateProfile(auth.currentUser, {
        displayName: newDisplayName,
        photoURL: canvas,
      })
        .then(() => {
          setUser({
            ...auth.currentUser,
            displayName: newDisplayName,
            photoURL: canvas,
          });
          alert('Profile updated successfully!');
        })
        .catch((error) => {
          console.error('Error updating profile:', error);
          alert('Failed to update profile. Please try again.');
        });
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Store uploaded file
  };

  return (
    <ProfileContainer>
      {user ? (
        <>
          {image ? (
            <AvatarEditor
              ref={setEditor}
              image={image} // The image file to be edited
              width={250}
              height={250}
              border={50}
              borderRadius={125} // Circular profile pic
              color={[255, 255, 255, 0.6]} // White background
              scale={scale}
              rotate={0}
            />
          ) : (
            <ProfileImage
              src={user.photoURL || 'https://via.placeholder.com/150'}
              alt="Profile"
            />
          )}

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
            <label>Upload Profile Picture:</label>
            <ProfileInput type="file" onChange={handleImageChange} />
          </InputContainer>

          {image && (
            <div>
              <label>Scale:</label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.01"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
              />
            </div>
          )}

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

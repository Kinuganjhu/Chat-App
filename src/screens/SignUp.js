import { auth } from './api/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #4285F4;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #357ae8;
  }
`;

const SignUp = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (user) {
          navigate('/Home');
        }
      } catch (error) {
        alert(error.message);
      }
    });

    return () => unsubscribe(); // Clean up subscription on component unmount
  }, [navigate]);

  const handleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        navigate('/Home');
        alert('Signed up successfully');
      } else {
        alert('Authentication failed. Please refresh the page.');
      }
    } catch (error) {
      alert(error.message); // Catch any errors from the signInWithPopup
    }
  };

  return (
    <Container>
      <Title>NinjaChat - A Personal Chatroom for Developers</Title>
      <Button onClick={handleAuth}>Continue With Google</Button>
    </Container>
  );
};

export default SignUp;

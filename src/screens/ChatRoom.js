import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth, storage } from './api/firebase';
import { doc, collection, addDoc, query, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import styled from 'styled-components';
import { format } from 'date-fns';
import { ProgressBar, Alert } from 'react-bootstrap';

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomInfo, setRoomInfo] = useState({ name: '', description: '' });
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState('success');
  const [loading, setLoading] = useState(true);

  // Fetch room info
  useEffect(() => {
    const fetchRoomInfo = async () => {
      setLoading(true);
      try {
        const roomRef = doc(db, 'chatrooms', id);
        const roomDoc = await getDoc(roomRef);
        if (roomDoc.exists()) {
          setRoomInfo(roomDoc.data());
        } else {
          navigate('/'); // Redirect if the room doesn't exist
        }
      } catch (error) {
        console.error('Error fetching room info:', error);
      }
      setLoading(false);
    };

    fetchRoomInfo();

    // Listen for messages
    const messagesRef = collection(db, 'chatrooms', id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [id, navigate]);

  // Send message
  const handleSendMessage = async () => {
    if (newMessage.trim() === '' && !file) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        setAlertMessage('You must be logged in to send messages.');
        setAlertVariant('danger');
        return;
      }

      let imageUrl = null;
      if (file) {
        const storageRef = ref(storage, `chat_images/${id}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          },
          (error) => {
            console.error('Error uploading image:', error);
            setAlertMessage('Failed to upload image.');
            setAlertVariant('danger');
          },
          async () => {
            imageUrl = await getDownloadURL(storageRef);
            await sendMessageToFirestore(user, newMessage, imageUrl);
            setUploadProgress(0);
            setFile(null);
          }
        );
      } else {
        await sendMessageToFirestore(user, newMessage, null);
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.message);
      setAlertMessage('Failed to send message.');
      setAlertVariant('danger');
    }
  };

  const sendMessageToFirestore = async (user, text, imageUrl) => {
    await addDoc(collection(db, 'chatrooms', id, 'messages'), {
      text,
      imageUrl,
      userId: user.uid,
      userName: user.displayName,
      createdAt: new Date(),
    });
  };

  return loading ? (
    <LoadingContainer>Loading...</LoadingContainer>
  ) : (
    <Container>
      {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}
      
      <Header>
        <BackButton onClick={() => navigate(-1)}>&larr; Back</BackButton>
        <Title>{roomInfo.name}</Title>
      </Header>

      <MessagesContainer>
        {messages.map((message) => {
          const isCurrentUser = message.userId === auth.currentUser?.uid;
          return (
            <Message key={message.id} isCurrentUser={isCurrentUser}>
              <Bubble isCurrentUser={isCurrentUser}>
                {!isCurrentUser && <Sender>{message.userName}</Sender>}
                {message.imageUrl && <Image src={message.imageUrl} alt="Uploaded" />}
                {message.text && <Text>{message.text}</Text>}
                <Timestamp>{format(new Date(message.createdAt?.seconds * 1000), 'HH:mm')}</Timestamp>
              </Bubble>
            </Message>
          );
        })}
      </MessagesContainer>

      <InputContainer>
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <FileInput type="file" onChange={(e) => setFile(e.target.files[0])} />
        <SendButton onClick={handleSendMessage}>Send</SendButton>
      </InputContainer>

      {uploadProgress > 0 && <ProgressBar now={uploadProgress} label={`${Math.round(uploadProgress)}%`} />}
    </Container>
  );
};

export default ChatRoom;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #e5ddd5;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #075e54;
  color: white;
`;

const Title = styled.h2`
  margin: 0 auto;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
`;

const Message = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isCurrentUser ? 'flex-end' : 'flex-start')};
  margin-bottom: 10px;
`;

const Bubble = styled.div`
  max-width: 60%;
  padding: 10px;
  background-color: ${(props) => (props.isCurrentUser ? '#dcf8c6' : '#fff')};
  border-radius: 8px;
  word-wrap: break-word;
`;

const Sender = styled.strong`
  font-size: 12px;
  color: #555;
`;

const Image = styled.img`
  max-width: 100%;
  border-radius: 5px;
  margin-top: 5px;
`;

const Text = styled.p`
  margin: 0;
`;

const Timestamp = styled.span`
  font-size: 10px;
  color: gray;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #ddd;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 10px;
`;

const FileInput = styled.input`
  margin-left: 10px;
`;

const SendButton = styled.button`
  margin-left: 10px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 20px;
  font-weight: bold;
  color: #075e54;
`;

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

  useEffect(() => {
    const fetchRoomInfo = async () => {
      const roomRef = doc(db, 'chatrooms', id);
      const roomDoc = await getDoc(roomRef);
      if (roomDoc.exists()) {
        setRoomInfo(roomDoc.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchRoomInfo();

    const messagesRef = collection(db, 'chatrooms', id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [id]);

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
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
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
            setAlertMessage('Message sent successfully!');
            setAlertVariant('success');
          }
        );
      } else {
        await sendMessageToFirestore(user, newMessage, null);
        setAlertMessage('Message sent successfully!');
        setAlertVariant('success');
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message: ', error.message);
      setAlertMessage('Failed to send message.');
      setAlertVariant('danger');
    }
  };

  const sendMessageToFirestore = async (user, text, imageUrl) => {
    const messageData = {
      text,
      imageUrl,
      userId: user.uid,
      userName: user.displayName,
      createdAt: new Date(),
    };
    await addDoc(collection(db, 'chatrooms', id, 'messages'), messageData);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <Container>
      {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}

      <BackButton onClick={() => navigate(-1)}>&larr; Back</BackButton>
      <Header>
        <HeaderTitle>{roomInfo.name}</HeaderTitle>
        <HeaderDescription>{roomInfo.description}</HeaderDescription>
      </Header>
      <MessagesContainer>
        {messages.map((message) => {
          const timestamp = message.createdAt?.seconds
            ? format(new Date(message.createdAt.seconds * 1000), 'dd/MM/yyyy, HH:mm')
            : 'Unknown time';

          return (
            <Message key={message.id} isCurrentUser={message.userId === auth.currentUser?.uid}>
              <MessageBubble isCurrentUser={message.userId === auth.currentUser?.uid}>
                <MessageSender isCurrentUser={message.userId === auth.currentUser?.uid}>
                  {message.userName}
                </MessageSender>
                {message.imageUrl && <MessageImage src={message.imageUrl} alt="Uploaded" />}
                {message.text && <MessageText>{message.text}</MessageText>}
                <MessageTimestamp>{timestamp}</MessageTimestamp>
              </MessageBubble>
            </Message>
          );
        })}
      </MessagesContainer>
      <InputContainer>
        <InputField
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <FileInput type="file" onChange={handleFileChange} />
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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  position: relative;
  height: 100vh;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
`;

const HeaderDescription = styled.p`
  margin: 0;
  font-style: italic;
  color: #555;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 60px;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isCurrentUser ? 'flex-end' : 'flex-start')};
  padding: 10px;
  margin-bottom: 10px;
`;

const MessageBubble = styled.div`
  padding: 10px;
  background-color: ${(props) => (props.isCurrentUser ? '#d1ffd1' : '#f1f1f1')};
  border-radius: 8px;
  max-width: 60%;
  word-wrap: break-word;
`;

const MessageImage = styled.img`
  max-width: 100%;
  border-radius: 8px;
  margin-top: 5px;
`;

const MessageText = styled.p`
  margin: 0;
`;

const MessageSender = styled.strong`
  color: #555;
  font-size: 0.85em;
  display: ${(props) => (props.isCurrentUser ? 'none' : 'block')};
`;

const MessageTimestamp = styled.span`
  font-size: 0.75em;
  color: #999;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #ddd;
`;

const InputField = styled.input`
  flex-grow: 1;
  padding: 10px;
`;

const FileInput = styled.input`
  margin-left: 10px;
`;

const SendButton = styled.button`
  margin-left: 10px;
`;

const BackButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
`;
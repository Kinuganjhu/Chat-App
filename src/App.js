import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignUp from "./screens/SignUp";
import Home from './screens/Home';
import ChatRoom from './screens/ChatRoom';
import ProfileContext from './context/ProfileContext';

import { useState } from "react"; 
import Profile from './screens/Profile'
const App = () => {
  const [user, setUser] = useState(null);
  return (
    <ProfileContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Profile" element={<Profile/>} />
          
          <Route path="/chatroom/:id" element={<ChatRoom />} />

          <Route path="*" element={<h1>Page Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </ProfileContext.Provider>
  );
};

export default App;

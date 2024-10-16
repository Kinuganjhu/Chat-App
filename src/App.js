import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignUp from "./screens/SignUp";
import Home from './screens/Home';
import ChatRoom from './screens/ChatRoom';



const App = () => {
  return (
    
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/home" element={<Home />} />

          {/* Dynamic route for ChatRoom with room ID */}
          <Route path="/chatroom/:id" element={<ChatRoom />} />

          <Route path="*" element={<h1>Page Not Found</h1>} />
        </Routes>
      </BrowserRouter>
  
  );
};

export default App;

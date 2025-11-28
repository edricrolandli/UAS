// import React from "react" 
// import { Route, Routes } from "react-router-dom"
// import Login from "./pages/Login"
// import Feed from "./pages/Feed"
// import Messages from "./pages/Messages"
// import ChatBox from "./pages/ChatBox"
// import Connections from "./pages/Connections"
// import Discover from "./pages/Discover"
// import Profile from "./pages/Profile"
// import CreatePost from "./pages/CreatePost"
// import {useUser, useAuth} from '@clerk/clerk-react'
// import Layout from "./pages/Layout"
// import {Toaster} from 'react-hot-toast'
// import { useEffect } from "react"

// const App = () => {
//     const {user} = useUser()
//     const {getToken } = useAuth()

//     useEffect(()=>{
//       if(user){
//         // getToken().then((token)=>console.log(token))
//         getToken().then(token => console.log("TOKEN:", token));

//       }
//     },[user])
//     return (
//         <>
//           <Toaster/>
//           <Routes>
//             <Route path='/' element={ !user ? <Login /> : <Layout/>}>
//                 <Route index element={<Feed/>}/>
//                 <Route path='messages' element={<Messages/>}/>
//                 <Route path='messages/:userId' element={<ChatBox/>}/>
//                 <Route path='connections' element={<Connections/>}/>
//                 <Route path='discover' element={<Discover/>}/>
//                 <Route path='profile' element={<Profile/>}/>
//                 <Route path='profile/:profileId' element={<Profile/>}/>
//                 <Route path='create-post' element={<CreatePost/>}/>
//             </Route>
//           </Routes>
//         </>
//     )
// }

// export default App

import React, { useState, useEffect } from "react";  // Tambahkan useState
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import { useUser, useAuth } from '@clerk/clerk-react';
import Layout from "./pages/Layout";
import { Toaster } from 'react-hot-toast';

const App = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [currentToken, setCurrentToken] = useState(null);  // State untuk simpan token

    useEffect(() => {
        if (user) {
            getToken().then(token => {
                console.log("TOKEN BARU:", token);  // Log token untuk copy ke Postman
                setCurrentToken(token);  // Simpan di state jika perlu
            }).catch(err => console.error("Error getting token:", err));
        } else {
            setCurrentToken(null);  // Clear token jika user logout
        }
    }, [user]);  // Trigger setiap kali user berubah (login/logout/signup)

    return (
        <>
            <Toaster />
            <Routes>
                <Route path='/' element={!user ? <Login /> : <Layout />}>
                    <Route index element={<Feed />} />
                    <Route path='messages' element={<Messages />} />
                    <Route path='messages/:userId' element={<ChatBox />} />
                    <Route path='connections' element={<Connections />} />
                    <Route path='discover' element={<Discover />} />
                    <Route path='profile' element={<Profile />} />
                    <Route path='profile/:profileId' element={<Profile />} />
                    <Route path='create-post' element={<CreatePost />} />
                </Route>
            </Routes>
        </>
    );
};

export default App;
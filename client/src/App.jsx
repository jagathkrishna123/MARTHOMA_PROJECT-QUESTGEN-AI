
import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import NoteGenPage from "./pages/NoteGenPage";
import NotePreview from "./pages/NotePreview";
import Login from "./pages/Login";
import AllFiles from "./pages/AllFiles";
import UploadPdfNotes from "./pages/UploadPdfNotes";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import Feedback from "./pages/admin/Feedback";
import Broadcast from "./pages/admin/Broadcast";
import ChatBot from "./pages/ChatBot";
import UserFeedback from "./pages/UserFeedback";
import Notification from "./pages/Notification";
import TextEditior from "./pages/TextEditior";
import 'quill/dist/quill.snow.css'
import Faq from "./pages/Faq";


const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="uploadfile" element={<UploadPdfNotes/>} />
          <Route path="texteditor" element={<TextEditior/>} />
          <Route path="allfiles" element={<AllFiles/>} />
          <Route path="chatbot" element={<ChatBot/>} />
          <Route path="feedbacks" element={<UserFeedback/>} />
          <Route path="notification" element={<Notification/>} />
          <Route path="faq" element={<Faq/>} />

          {/* CREATE / EDIT NOTE */}
          <Route path="notegen/:id" element={<NoteGenPage />} />

          {/* PREVIEW NOTE */}
          <Route path="preview/:id" element={<NotePreview />} />
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="broadcast" element={<Broadcast />} />
        </Route>

        <Route path="login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;

import { createContext, useContext, useEffect, useState } from "react";
import { GENERATEDNOTES } from "../assets/assets";

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(null);

  const refreshUser = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role !== 'admin') {
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const latestUserData = allUsers.find(u => u.id === currentUser.id);

      if (!latestUserData || latestUserData.isBlocked) {
        localStorage.removeItem('currentUser');
        setUserId(null);
        window.location.href = '/login'; // Force logout to login page
        return;
      }
    }
    setUserId(currentUser?.id || null);
  };

  // Get current user on mount and when storage changes
  useEffect(() => {
    refreshUser();
    window.addEventListener('storage', refreshUser);
    return () => window.removeEventListener('storage', refreshUser);
  }, []);

  // Load initial data filtered by userId
  useEffect(() => {
    if (!userId) {
      setNotes([]);
      return;
    }
    const allNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    const userNotes = allNotes.filter(n => n.userId === userId);

    // If no notes exist for user, maybe load dummy data for demonstration (optional)
    // For now, just setting userNotes
    setNotes(userNotes);
  }, [userId]);

  // Persist notes
  const saveAllNotes = (updatedNotes) => {
    const allNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    const otherUsersNotes = allNotes.filter(n => n.userId !== userId);
    const combinedNotes = [...otherUsersNotes, ...updatedNotes];
    localStorage.setItem("notes", JSON.stringify(combinedNotes));
  };

  const addNote = (note) => {
    const newNote = { ...note, userId };
    setNotes((prev) => {
      const updated = [...prev, newNote];
      saveAllNotes(updated);
      return updated;
    });
  };

  const updateNote = (updatedNote) => {
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === updatedNote.id ? { ...updatedNote, userId } : n));
      saveAllNotes(updated);
      return updated;
    });
  };

  const deleteNote = (id) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveAllNotes(updated);
      return updated;
    });
  };

  return (
    <NotesContext.Provider
      value={{ notes, addNote, updateNote, deleteNote, refreshUser, userId }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);

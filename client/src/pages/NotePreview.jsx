import { useParams, useNavigate } from "react-router-dom";
import { useNotes } from "../context/NotesContext";
import { ArrowLeft, Pencil } from "lucide-react";

const NotePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes } = useNotes();

  const note = notes.find((n) => n.id === id);

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Note not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ArrowLeft />
          </button>
          <h1 className="text-2xl font-semibold">
            {note.title}
          </h1>
        </div>

        <button
          onClick={() => navigate(`/app/notegen/${note.id}`)}
          className="
            flex items-center gap-2
            px-4 py-2 rounded-lg
            bg-blue-600 text-white
            hover:bg-blue-700 transition
          "
        >
          <Pencil size={18} />
          Edit
        </button>
      </div>

      {/* META */}
      <p className="text-sm text-gray-400 mb-6">
        Last updated:{" "}
        {new Date(note.updatedAt).toLocaleString()}
      </p>

      {/* CONTENT */}
      <div className="space-y-8">
        {note.sections.map((section, index) => (
          <div key={section.id}>
            <h3 className="text-lg font-semibold text-gray-800">
              Q{index + 1}. {section.topic}
            </h3>
            <p className="mt-2 text-gray-600 whitespace-pre-line leading-relaxed">
              {section.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotePreview;

import {
  FilePenLineIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotes } from "../context/NotesContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { notes, deleteNote } = useNotes();

  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"];

  return (
    <div className="max-w-7xl w-full mx-auto px-4 py-8">

      {/* ACTION BUTTON */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/app/notegen/new")}
          className="
    w-full sm:max-w-36 h-48
    flex flex-col items-center justify-center gap-3
    bg-slate-200
    border border-slate-400
    rounded-xl
    text-slate-700
    hover:border-slate-300
    hover:shadow-md
    transition-all
  "
        >
          <div className="flex items-center justify-center size-10 rounded-full bg-slate-500 text-slate-100">
            <PlusIcon className="size-5" />
          </div>
          <p className="text-sm font-medium">Create Notex last</p>
        </button>



      </div>

      <hr className="border-slate-300 my-6 sm:w-[305px]" />

      {/* NOTES GRID */}
      <div className="grid grid-cols-2 sm:flex flex-wrap gap-4">
        {notes.map((noteItem, index) => {
          const baseColor = colors[index % colors.length];

          return (
            <button
              key={noteItem.id}
              onClick={() => navigate(`/app/preview/${noteItem.id}`)}
              className="
                relative w-full sm:max-w-36 h-48
                flex flex-col items-center justify-center gap-2
                rounded-lg border group hover:shadow-lg transition-all
              "
              style={{
                background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`,
                borderColor: baseColor + "40",
              }}
            >
              <FilePenLineIcon
                className="size-7"
                style={{ color: baseColor }}
              />

              {/* NOTE TITLE */}
              <p
                className="text-sm px-2 text-center font-medium"
                style={{ color: baseColor }}
              >
                {noteItem.title}
              </p>

              {/* FIRST QUESTION PREVIEW */}
              <p
                className="text-[11px] text-center px-2 opacity-80"
                style={{ color: baseColor }}
              >
                {noteItem.sections[0]?.topic || "No questions yet"}
              </p>

              {/* UPDATED DATE */}
              <p
                className="absolute bottom-1 text-[11px]"
                style={{ color: baseColor + "90" }}
              >
                Updated{" "}
                {new Date(noteItem.updatedAt).toLocaleDateString()}
              </p>

              {/* ACTION ICONS */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-1 right-1 hidden group-hover:flex gap-1"
              >
                <TrashIcon
                  onClick={() => deleteNote(noteItem.id)}
                  className="size-7 p-1.5 hover:bg-white/50 rounded transition"
                />
                <PencilIcon
                  onClick={() =>
                    navigate(`/app/notegen/${noteItem.id}`)
                  }
                  className="size-7 p-1.5 hover:bg-white/50 rounded transition"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;

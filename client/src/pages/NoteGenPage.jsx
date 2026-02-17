

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import { OutfitRegular } from "../fonts/outfitFonts";
import { useNotes } from "../context/NotesContext";
import { Loader2 } from "lucide-react";

const NoteGenPage = () => {
  const { id } = useParams(); // "new" or note id
  const navigate = useNavigate();
  const { notes, addNote, updateNote } = useNotes();

  const [noteTitle, setNoteTitle] = useState("");
  const [sections, setSections] = useState([
    { id: crypto.randomUUID(), topic: "", answer: "" },
  ]);

  const [aiLoadingId, setAiLoadingId] = useState(null);
  const [answerLength, setAnswerLength] = useState("short"); // short | long
  const [difficulty, setDifficulty] = useState("easy"); // easy | exam | advanced

  /* 🔹 Load existing note (edit mode) */
  useEffect(() => {
    if (!id || id === "new") return;

    const existingNote = notes.find((n) => n.id === id);
    if (existingNote) {
      setNoteTitle(existingNote.title);
      setSections(existingNote.sections);
    }
  }, [id, notes]);

  /* 🔹 Update section */
  const handleChange = (index, key, value) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [key]: value };
    setSections(updated);
  };

  /* 🔹 Add / remove questions */
  const addSection = () => {
    setSections([
      ...sections,
      { id: crypto.randomUUID(), topic: "", answer: "" },
    ]);
  };

  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  /* 🔹 Generate answer using AI */
  const generateWithAI = async (index) => {
    const topic = sections[index].topic;
    if (!topic.trim()) {
      alert("Please enter a question/topic first");
      return;
    }

    try {
      setAiLoadingId(sections[index].id);

      const res = await fetch("http://localhost:5000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          length: answerLength,
          level: difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      handleChange(index, "answer", data.answer);
    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    } finally {
      setAiLoadingId(null);
    }
  };

  /* 🔹 Save note to global state */
  const saveNote = () => {
    const noteData = {
      id: id === "new" ? crypto.randomUUID() : id,
      title: noteTitle || "Untitled Note",
      sections,
      createdAt: id === "new" ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    id === "new" ? addNote(noteData) : updateNote(noteData);
    return noteData.id;
  };

  /* 🔹 Generate PDF + Save note */
  const generatePDF = () => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    pdf.addFileToVFS("Outfit-Regular.ttf", OutfitRegular);
    pdf.addFont("Outfit-Regular.ttf", "Outfit", "normal");

    const marginX = 15;
    const pageHeight = 297;
    const maxY = pageHeight - 20;
    let y = 25;

    pdf.setFont("Outfit", "normal");
    pdf.setFontSize(20);
    pdf.setTextColor(40, 90, 255);
    pdf.text(noteTitle || "Study Notes", 105, y, { align: "center" });

    y += 15;

    sections.forEach((section, index) => {
      if (y > maxY) {
        pdf.addPage();
        y = 25;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(0);
      pdf.text(`Q${index + 1}. ${section.topic}`, marginX, y);

      y += 4;

      pdf.setFontSize(11);
      pdf.setTextColor(60);
      const wrapped = pdf.splitTextToSize(section.answer || "—", 180);
      pdf.text(wrapped, marginX, y);

      y += wrapped.length * 5 + 4;
    });

    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(150);
      pdf.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    }

    pdf.save("notes.pdf");

    const savedId = saveNote();
    navigate(`/app/preview/${savedId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT FORM */}
        <div className="bg-white rounded-xl border border-gray-400 p-6 space-y-6">
          <input
            className="w-full text-xl font-semibold border-b border-gray-500 pb-2 focus:outline-none"
            placeholder="Note title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />

          {/* AI SETTINGS */}
          <div className="flex gap-4 bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <div>
              <p className="text-sm font-medium mb-1 text-gray-600">Answer Length</p>
              <select
                value={answerLength}
                onChange={(e) => setAnswerLength(e.target.value)}
                className="border border-gray-400 rounded px-3 py-2 text-sm outline-none text-gray-700 font-medium"
              >
                <option value="short">Short</option>
                <option value="long">Long</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-medium mb-1 text-gray-600">Difficulty</p>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="border border-gray-400 rounded px-3 py-2 text-sm outline-none text-gray-700 font-medium"
              >
                <option value="easy">Easy</option>
                <option value="exam">Exam</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {sections.map((section, index) => (
            <div key={section.id} className="bg-gray-50 border border-gray-400 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <h3 className="font-medium text-gray-600">Question {index + 1}</h3>
                {sections.length > 1 && (
                  <button
                    onClick={() => removeSection(index)}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Question / Topic"
                value={section.topic}
                onChange={(e) => handleChange(index, "topic", e.target.value)}
              />

              {/* <textarea
                className="w-full border rounded px-3 py-2 text-sm h-28 resize-none"
                placeholder="Answer"
                value={section.answer}
                onChange={(e) => handleChange(index, "answer", e.target.value)}
              />

              <button
                onClick={() => generateWithAI(index)}
                disabled={aiLoadingId === section.id}
                className="text-xs px-3 py-1.5 rounded border border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white disabled:opacity-60"
              >
                {aiLoadingId === section.id ? "Generating..." : "Generate with AI"}
              </button> */}
              <div className="relative">
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm h-28 resize-none pr-10"
                  placeholder="Answer"
                  value={section.answer}
                  onChange={(e) => handleChange(index, "answer", e.target.value)}
                  disabled={aiLoadingId === section.id}
                />

                {aiLoadingId === section.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  </div>
                )}
                
              </div>
              <button
                onClick={() => generateWithAI(index)}
                disabled={aiLoadingId === section.id}
                className="text-xs px-3 py-1.5 rounded border border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white disabled:opacity-60"
              >
                {aiLoadingId === section.id ? "Generating..." : "Generate with AI"}
              </button>

            </div>
          ))}

          <button
            onClick={addSection}
            className="w-full py-2.5 rounded bg-blue-600 text-white"
          >
            + Add Another Question
          </button>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="bg-white rounded-xl border border-gray-500 p-6 sticky top-24 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            {noteTitle || "Preview"}
          </h2>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {sections.map((s, i) => (
              <div key={s.id}>
                <h3 className="font-semibold text-gray-600">
                  Q{i + 1}. {s.topic || "Untitled"}
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {s.answer || "No answer yet..."}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={generatePDF}
            className="mt-6 w-full py-3 rounded bg-gray-800 text-white"
          >
            Download PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default NoteGenPage;

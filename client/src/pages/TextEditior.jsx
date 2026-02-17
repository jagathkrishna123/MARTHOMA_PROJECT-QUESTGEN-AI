import { useState, useRef, useEffect, useCallback } from "react";

const FONTS = ["Default", "Serif", "Mono", "Georgia", "Palatino"];
const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32", "36", "48"];
const COLORS = [
  "#1a1a2e", "#16213e", "#0f3460", "#533483", "#e94560",
  "#f5a623", "#7ed321", "#4a90e2", "#9b59b6", "#1abc9c",
  "#e74c3c", "#f39c12", "#2ecc71", "#3498db", "#ffffff",
];

const HIGHLIGHT_COLORS = [
  "#fff176", "#a5d6a7", "#90caf9", "#f48fb1", "#ffe0b2",
  "#e1bee7", "#b2dfdb", "#ffccbc", "#dcedc8", "transparent",
];

// Save and restore selection helpers
function saveSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    return sel.getRangeAt(0).cloneRange();
  }
  return null;
}

function restoreSelection(range) {
  if (!range) return;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// Toolbar button with tooltip
const ToolBtn = ({ onClick, active, title, children, disabled }) => (
  <button
    onMouseDown={(e) => {
      e.preventDefault(); // Prevents editor blur
      onClick?.();
    }}
    disabled={disabled}
    title={title}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 30, height: 30, borderRadius: 6, border: "none", cursor: "pointer",
      background: active ? "#e8f4ff" : "transparent",
      color: active ? "#2563eb" : "#374151",
      fontSize: 13, fontWeight: 600, transition: "all 0.15s",
      outline: "none", flexShrink: 0,
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f3f4f6"; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
  >
    {children}
  </button>
);

const Divider = () => (
  <div style={{ width: 1, height: 22, background: "#e5e7eb", margin: "0 4px", flexShrink: 0 }} />
);

// Color Picker Dropdown
const ColorPicker = ({ colors, onSelect, icon, title }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(o => !o); }}
        title={title}
        style={{
          display: "flex", alignItems: "center", gap: 2, padding: "0 4px",
          height: 30, borderRadius: 6, border: "none", cursor: "pointer",
          background: "transparent", color: "#374151", fontSize: 13, fontWeight: 600,
          transition: "all 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        {icon} <span style={{ fontSize: 9 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, zIndex: 100,
          background: "white", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          padding: 10, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5,
          marginTop: 4, border: "1px solid #e5e7eb",
        }}>
          {colors.map((c) => (
            <button
              key={c}
              onMouseDown={(e) => { e.preventDefault(); onSelect(c); setOpen(false); }}
              style={{
                width: 22, height: 22, borderRadius: 4, border: "2px solid #e5e7eb",
                background: c === "transparent" ? "linear-gradient(45deg, #fff 25%, #ccc 25%, #ccc 75%, #fff 75%)" : c,
                cursor: "pointer", transition: "transform 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Select dropdown
const ToolSelect = ({ value, onChange, options, width = 90 }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    onMouseDown={e => e.stopPropagation()}
    style={{
      height: 28, borderRadius: 6, border: "1px solid #e5e7eb",
      padding: "0 6px", fontSize: 12, background: "white",
      color: "#374151", cursor: "pointer", width, outline: "none",
    }}
  >
    {options.map(o => (
      <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
    ))}
  </select>
);

export default function TextEditor() {
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null); // KEY FIX: store selection before blur
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("Default");
  const [activeFormats, setActiveFormats] = useState({});
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [lineHeight, setLineHeight] = useState("1.6");
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);

  // Save the current selection whenever the user interacts with the editor
  const saveCurrentSelection = useCallback(() => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      editorRef.current &&
      editorRef.current.contains(sel.anchorNode)
    ) {
      savedSelectionRef.current = saveSelection();
    }
  }, []);

  // Core exec command — restores selection first so commands always have context
  const execCmd = useCallback((cmd, value = null) => {
    // Restore the saved selection into the editor
    editorRef.current?.focus();
    if (savedSelectionRef.current) {
      restoreSelection(savedSelectionRef.current);
    }
    document.execCommand(cmd, false, value);
    updateFormats();
    // Refresh saved selection after command
    savedSelectionRef.current = saveSelection();
  }, []);

  const updateFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      justifyFull: document.queryCommandState("justifyFull"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      superscript: document.queryCommandState("superscript"),
      subscript: document.queryCommandState("subscript"),
    });
  };

  const updateCounts = () => {
    const text = editorRef.current?.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.replace(/\n/g, "").length);
  };

  const handleInput = () => {
    updateCounts();
    updateFormats();
    setSaved(false);
  };

  const applyFontSize = (size) => {
    setFontSize(size);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = size + "px";
      range.surroundContents(span);
    } else {
      editorRef.current.style.fontSize = size + "px";
    }
  };

  const applyFont = (font) => {
    setFontFamily(font);
    const families = {
      Default: "system-ui, sans-serif",
      Serif: "Georgia, serif",
      Mono: "Menlo, monospace",
      Georgia: "Georgia, serif",
      Palatino: "Palatino Linotype, serif",
    };
    execCmd("fontName", families[font] || families.Default);
  };

  const applyLineHeight = (lh) => {
    setLineHeight(lh);
    if (editorRef.current) editorRef.current.style.lineHeight = lh;
  };

  const insertTable = () => {
    const rows = 3, cols = 3;
    let html = `<table style="border-collapse:collapse;width:100%;margin:12px 0"><tbody>`;
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html += `<td style="border:1px solid #d1d5db;padding:8px 12px;min-width:80px">${r === 0 ? `<strong>Header ${c + 1}</strong>` : "Cell"}</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table><p><br></p>";
    execCmd("insertHTML", html);
  };

  const insertHR = () => execCmd("insertHTML", "<hr style='border:none;border-top:2px solid #e5e7eb;margin:16px 0'/><p><br></p>");
  const insertBlockquote = () => execCmd("insertHTML", `<blockquote style="border-left:4px solid #2563eb;margin:12px 0;padding:10px 16px;background:#eff6ff;color:#1e40af;border-radius:0 8px 8px 0;font-style:italic">Quote text here</blockquote><p><br></p>`);
  const insertCodeBlock = () => execCmd("insertHTML", `<pre style="background:#1e293b;color:#e2e8f0;padding:16px;border-radius:10px;font-family:Menlo,monospace;font-size:13px;overflow-x:auto;margin:12px 0"><code>// Your code here</code></pre><p><br></p>`);
  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) execCmd("createLink", url);
  };

  const findAndReplace = () => {
    const content = editorRef.current.innerHTML;
    if (findText) {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      editorRef.current.innerHTML = replaceText
        ? content.replace(regex, replaceText)
        : content.replace(regex, `<mark style="background:#fef08a">$&</mark>`);
    }
  };

  const saveNote = () => {
    const content = editorRef.current.innerHTML;
    const note = {
      id: currentNote?.id || Date.now(),
      title: title || "Untitled Note",
      content,
      tags,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      preview: editorRef.current.innerText.slice(0, 80) + "...",
    };
    setNotes(prev => {
      const idx = prev.findIndex(n => n.id === note.id);
      if (idx >= 0) { const updated = [...prev]; updated[idx] = note; return updated; }
      return [note, ...prev];
    });
    setCurrentNote(note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const loadNote = (note) => {
    setTitle(note.title);
    setTags(note.tags || []);
    setCurrentNote(note);
    if (editorRef.current) editorRef.current.innerHTML = note.content;
    updateCounts();
  };

  const newNote = () => {
    setTitle(""); setTags([]); setCurrentNote(null);
    if (editorRef.current) editorRef.current.innerHTML = "";
    updateCounts();
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (currentNote?.id === id) newNote();
  };

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setTags(prev => [...new Set([...prev, tagInput.trim()])]);
      setTagInput("");
    }
  };

  const printDoc = () => {
    const content = editorRef.current.innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>${title}</title><style>body{font-family:system-ui;max-width:800px;margin:40px auto;padding:20px}table{border-collapse:collapse;width:100%}td{border:1px solid #ccc;padding:8px}</style></head><body><h1>${title}</h1>${content}</body></html>`);
    w.document.close();
    w.print();
  };

  const exportHTML = () => {
    const blob = new Blob([`<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>${title}</h1>${editorRef.current.innerHTML}</body></html>`], { type: "text/html" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${title || "note"}.html`; a.click();
  };

  const copyAll = () => {
    navigator.clipboard.writeText(editorRef.current.innerText);
    alert("Copied to clipboard!");
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const handleSelectionChange = () => saveCurrentSelection();
      editor.addEventListener("keyup", updateFormats);
      editor.addEventListener("mouseup", updateFormats);
      // Save selection on any keyup/mouseup in the editor
      editor.addEventListener("keyup", handleSelectionChange);
      editor.addEventListener("mouseup", handleSelectionChange);
      // Also listen at document level for selectionchange
      document.addEventListener("selectionchange", () => {
        const sel = window.getSelection();
        if (
          sel &&
          sel.rangeCount > 0 &&
          editor.contains(sel.anchorNode)
        ) {
          savedSelectionRef.current = saveSelection();
        }
      });
      return () => {
        editor.removeEventListener("keyup", updateFormats);
        editor.removeEventListener("mouseup", updateFormats);
        editor.removeEventListener("keyup", handleSelectionChange);
        editor.removeEventListener("mouseup", handleSelectionChange);
      };
    }
  }, [saveCurrentSelection]);

  const fontOptions = FONTS.map(f => ({ value: f, label: f }));
  const sizeOptions = FONT_SIZES.map(s => ({ value: s, label: s + "px" }));
  const lhOptions = [
    { value: "1.2", label: "Compact" }, { value: "1.6", label: "Normal" },
    { value: "2", label: "Relaxed" }, { value: "2.5", label: "Double" },
  ];

  return (
    <div style={{
      display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif",
      background: "#f8fafc", overflow: "hidden",
    }}>
      {/* Main Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Top Menubar */}
        <div style={{
          background: "white", borderBottom: "1px solid #e5e7eb",
          padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
          flexWrap: "wrap",
        }}>
          <Divider />

          {/* File */}
          <ToolBtn onClick={saveNote} title="Save (Ctrl+S)" active={saved}>
            {saved ? "✅" : "💾"}
          </ToolBtn>
          <ToolBtn onClick={printDoc} title="Print">🖨️</ToolBtn>
          <ToolBtn onClick={exportHTML} title="Export as HTML">📤</ToolBtn>
          <ToolBtn onClick={copyAll} title="Copy all text">📋</ToolBtn>
          <Divider />

          {/* History */}
          <ToolBtn onClick={() => execCmd("undo")} title="Undo">↩️</ToolBtn>
          <ToolBtn onClick={() => execCmd("redo")} title="Redo">↪️</ToolBtn>
          <Divider />

          {/* Font */}
          <ToolSelect value={fontFamily} onChange={applyFont} options={fontOptions} width={100} />
          <ToolSelect value={fontSize} onChange={applyFontSize} options={sizeOptions} width={72} />
          <ToolSelect value={lineHeight} onChange={applyLineHeight} options={lhOptions} width={88} />
          <Divider />

          {/* Find & Replace */}
          <ToolBtn onClick={() => setShowFindReplace(s => !s)} title="Find & Replace" active={showFindReplace}>
            🔍
          </ToolBtn>
        </div>

        {/* Formatting Toolbar */}
        <div style={{
          background: "white", borderBottom: "1px solid #e5e7eb",
          padding: "6px 16px", display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
        }}>
          {/* Text Style */}
          <ToolBtn onClick={() => execCmd("bold")} active={activeFormats.bold} title="Bold (Ctrl+B)">
            <strong>B</strong>
          </ToolBtn>
          <ToolBtn onClick={() => execCmd("italic")} active={activeFormats.italic} title="Italic (Ctrl+I)">
            <em>I</em>
          </ToolBtn>
          <ToolBtn onClick={() => execCmd("underline")} active={activeFormats.underline} title="Underline">
            <u>U</u>
          </ToolBtn>
          <ToolBtn onClick={() => execCmd("strikeThrough")} active={activeFormats.strikeThrough} title="Strikethrough">
            <s>S</s>
          </ToolBtn>
          <ToolBtn onClick={() => execCmd("superscript")} active={activeFormats.superscript} title="Superscript">
            X²
          </ToolBtn>
          <ToolBtn onClick={() => execCmd("subscript")} active={activeFormats.subscript} title="Subscript">
            X₂
          </ToolBtn>
          <Divider />

          {/* Color */}
          <ColorPicker
            colors={COLORS}
            onSelect={c => execCmd("foreColor", c)}
            icon={<span style={{ fontSize: 14 }}>A</span>}
            title="Text Color"
          />
          <ColorPicker
            colors={HIGHLIGHT_COLORS}
            onSelect={c => execCmd("hiliteColor", c)}
            icon={<span style={{ fontSize: 14, background: "#fef08a", padding: "0 2px" }}>H</span>}
            title="Highlight"
          />
          <Divider />

          {/* Heading */}
          {["h1", "h2", "h3", "h4"].map(h => (
            <ToolBtn key={h} onClick={() => execCmd("formatBlock", h)} title={h.toUpperCase()}>
              {h.toUpperCase()}
            </ToolBtn>
          ))}
          <ToolBtn onClick={() => execCmd("formatBlock", "p")} title="Paragraph">P</ToolBtn>
          <Divider />

          {/* Alignment */}
          <ToolBtn onClick={() => execCmd("justifyLeft")} active={activeFormats.justifyLeft} title="Align Left">⬅</ToolBtn>
          <ToolBtn onClick={() => execCmd("justifyCenter")} active={activeFormats.justifyCenter} title="Center">↔</ToolBtn>
          <ToolBtn onClick={() => execCmd("justifyRight")} active={activeFormats.justifyRight} title="Align Right">➡</ToolBtn>
          <ToolBtn onClick={() => execCmd("justifyFull")} active={activeFormats.justifyFull} title="Justify">☰</ToolBtn>
          <Divider />

          {/* Lists — FIX: directly focus + restore + exec for reliability */}
          <ToolBtn
            onClick={() => execCmd("insertUnorderedList")}
            active={activeFormats.insertUnorderedList}
            title="Bullet List"
          >
            • ≡
          </ToolBtn>
          <ToolBtn
            onClick={() => execCmd("insertOrderedList")}
            active={activeFormats.insertOrderedList}
            title="Numbered List"
          >
            1. ≡
          </ToolBtn>
          <ToolBtn onClick={() => execCmd("indent")} title="Indent">→|</ToolBtn>
          <ToolBtn onClick={() => execCmd("outdent")} title="Outdent">|←</ToolBtn>
          <Divider />

          {/* Insert */}
          <ToolBtn onClick={insertTable} title="Insert Table">⊞</ToolBtn>
          <ToolBtn onClick={insertHR} title="Insert Divider">—</ToolBtn>
          <ToolBtn onClick={insertBlockquote} title="Blockquote">"</ToolBtn>
          <ToolBtn onClick={insertCodeBlock} title="Code Block">{`</>`}</ToolBtn>
          <ToolBtn onClick={insertLink} title="Insert Link">🔗</ToolBtn>
          <Divider />

          {/* Clear */}
          <ToolBtn onClick={() => execCmd("removeFormat")} title="Clear Formatting">✕</ToolBtn>
          <ToolBtn onClick={() => execCmd("selectAll")} title="Select All">⬜</ToolBtn>
        </div>

        {/* Find & Replace Bar */}
        {showFindReplace && (
          <div style={{
            background: "#eff6ff", borderBottom: "1px solid #bfdbfe",
            padding: "8px 16px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 600 }}>Find & Replace</span>
            <input
              placeholder="Find..."
              value={findText}
              onChange={e => setFindText(e.target.value)}
              style={{
                padding: "5px 10px", borderRadius: 6, border: "1px solid #93c5fd",
                fontSize: 13, outline: "none", width: 160,
              }}
            />
            <input
              placeholder="Replace with..."
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              style={{
                padding: "5px 10px", borderRadius: 6, border: "1px solid #93c5fd",
                fontSize: 13, outline: "none", width: 160,
              }}
            />
            <button onClick={findAndReplace} style={{
              padding: "5px 14px", background: "#2563eb", color: "white", border: "none",
              borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>
              Replace
            </button>
            <button onClick={() => { setFindText(""); setReplaceText(""); setShowFindReplace(false); }} style={{
              padding: "5px 14px", background: "white", color: "#374151", border: "1px solid #e5e7eb",
              borderRadius: 6, cursor: "pointer", fontSize: 13,
            }}>
              Close
            </button>
          </div>
        )}

        {/* Scrollable area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px 60px" }}>

          {/* Title */}
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={e => { setTitle(e.target.value); setSaved(false); }}
            style={{
              width: "100%", border: "none", outline: "none", background: "transparent",
              fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 12,
              fontFamily: "system-ui, sans-serif", boxShadow: "none", letterSpacing: "-0.5px",
              caretColor: "#2563eb",
            }}
          />

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20, alignItems: "center" }}>
            {tags.map(tag => (
              <span key={tag} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "#eff6ff", color: "#2563eb", fontSize: 12,
                padding: "3px 10px", borderRadius: 20, border: "1px solid #bfdbfe",
              }}>
                #{tag}
                <button onClick={() => setTags(tags.filter(t => t !== tag))} style={{
                  background: "none", border: "none", color: "#93c5fd", cursor: "pointer",
                  fontSize: 14, lineHeight: 1, padding: 0,
                }}>×</button>
              </span>
            ))}
            <input
              placeholder="+ add tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
              style={{
                border: "none", outline: "none", background: "transparent",
                fontSize: 12, color: "#64748b", boxShadow: "none", width: 90, caretColor: "#2563eb",
              }}
            />
          </div>

          {/* Divider */}
          <div style={{ height: 2, background: "linear-gradient(to right, #e2e8f0, transparent)", marginBottom: 24 }} />

          {/* Editor Area */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyUp={() => { updateFormats(); saveCurrentSelection(); }}
            onMouseUp={() => { updateFormats(); saveCurrentSelection(); }}
            data-placeholder="Start writing your note here..."
            style={{
              minHeight: 400, outline: "none", lineHeight,
              fontSize: fontSize + "px", color: "#1e293b",
              fontFamily: fontFamily === "Default" ? "system-ui, sans-serif"
                : fontFamily === "Mono" ? "Menlo, monospace"
                  : "Georgia, serif",
              caretColor: "#2563eb",
            }}
          />
        </div>

        {/* Bottom Status Bar */}
        <div style={{
          background: "white", borderTop: "1px solid #e5e7eb",
          padding: "6px 20px", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 16,
        }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              <span style={{ color: "#475569", fontWeight: 600 }}>{wordCount}</span> words ·{" "}
              <span style={{ color: "#475569", fontWeight: 600 }}>{charCount}</span> chars
            </span>
            {currentNote && (
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Last saved: {currentNote.date}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {saved && (
              <span style={{
                fontSize: 12, color: "#16a34a", background: "#f0fdf4",
                padding: "2px 10px", borderRadius: 10, border: "1px solid #bbf7d0",
              }}>
                ✓ Saved
              </span>
            )}
            <button onClick={saveNote} style={{
              padding: "6px 20px", background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "white", border: "none", borderRadius: 8, cursor: "pointer",
              fontWeight: 600, fontSize: 13,
            }}>
              Save Note
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder & List CSS */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #cbd5e1;
          pointer-events: none;
        }
        [contenteditable] table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        [contenteditable] td { border: 1px solid #d1d5db; padding: 8px 12px; }
        [contenteditable] h1 { font-size: 2em; font-weight: 800; margin: 0.5em 0; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0; }
        [contenteditable] h3 { font-size: 1.25em; font-weight: 600; margin: 0.5em 0; }
        [contenteditable] h4 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0; }
        [contenteditable] blockquote { border-left: 4px solid #2563eb; margin: 12px 0; padding: 10px 16px; background: #eff6ff; }
        [contenteditable] pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 10px; overflow-x: auto; }
        [contenteditable] a { color: #2563eb; text-decoration: underline; }

        /* FIX: Ensure lists render with proper bullets/numbers */
        [contenteditable] ul {
          list-style-type: disc !important;
          padding-left: 2em !important;
          margin: 8px 0 !important;
        }
        [contenteditable] ol {
          list-style-type: decimal !important;
          padding-left: 2em !important;
          margin: 8px 0 !important;
        }
        [contenteditable] li {
          display: list-item !important;
          margin: 2px 0 !important;
        }

        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
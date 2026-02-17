import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, FileText, Key, BookOpen, Calendar, Hash } from 'lucide-react';
import jsPDF from 'jspdf';
import { OutfitRegular } from '../fonts/outfitFonts';

// Bloom's Taxonomy Levels (same as UploadPdfNotes)
const BLOOMS_LEVELS = {
  remembering: "Remembering",
  understanding: "Understanding",
  applying: "Applying",
  analyzing: "Analyzing",
  evaluating: "Evaluating",
  creating: "Creating"
};

// Question Types (same as UploadPdfNotes)
const QUESTION_TYPES = {
  mcq: "Multiple Choice Questions (MCQ)",
  objective: "Objective Type",
  short: "Short Answer",
  long: "Long Answer"
};

const AllFiles = () => {
  const [savedFiles, setSavedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFile, setEditedFile] = useState(null);

  // Load saved files from localStorage
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      const allFiles = JSON.parse(localStorage.getItem('questionPapers') || '[]');
      const userFiles = allFiles.filter(file => file.userId === currentUser.id);
      setSavedFiles(userFiles);
    } else {
      setSavedFiles([]);
    }
  }, []);

  // Delete a file
  const deleteFile = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      const allFiles = JSON.parse(localStorage.getItem('questionPapers') || '[]');
      const updatedAllFiles = allFiles.filter(file => file.id !== fileId);
      localStorage.setItem('questionPapers', JSON.stringify(updatedAllFiles));

      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const userFiles = updatedAllFiles.filter(file => file.userId === currentUser.id);
      setSavedFiles(userFiles);

      // Close view mode if the deleted file was being viewed
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(null);
        setViewMode(false);
        setIsEditing(false);
      }
    }
  };

  // Toggle Edit Mode
  const toggleEditMode = () => {
    if (isEditing) {
      setEditedFile(null);
      setIsEditing(false);
    } else {
      setEditedFile(JSON.parse(JSON.stringify(selectedFile))); // Deep clone
      setIsEditing(true);
    }
  };

  // Save changes to localStorage
  const saveChanges = () => {
    const allFiles = JSON.parse(localStorage.getItem('questionPapers') || '[]');
    const fileIndex = allFiles.findIndex(f => f.id === editedFile.id);

    if (fileIndex !== -1) {
      // Calculate total marks based on structure
      // Note: If paperStructure doesn't exist in saved file, we use totalMarks
      const totalMarks = editedFile.paperStructure
        ? editedFile.paperStructure.reduce((sum, s) => sum + (s.totalMarks || 0), 0)
        : editedFile.totalMarks;

      const updatedFile = { ...editedFile, totalMarks, updatedAt: new Date().toISOString() };

      allFiles[fileIndex] = updatedFile;
      localStorage.setItem('questionPapers', JSON.stringify(allFiles));

      // Update local state
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const userFiles = allFiles.filter(file => file.userId === currentUser.id);
      setSavedFiles(userFiles);
      setSelectedFile(updatedFile);
      setIsEditing(false);
      setEditedFile(null);
      alert('Changes saved successfully!');
    }
  };

  // Update edited file parts
  const updateEditedFile = (field, value) => {
    setEditedFile(prev => ({ ...prev, [field]: value }));
  };

  const updateHeaderDetails = (field, value) => {
    setEditedFile(prev => ({
      ...prev,
      headerDetails: { ...(prev.headerDetails || {}), [field]: value }
    }));
  };

  const updateQuestion = (sectionIndex, qIndex, field, value) => {
    const newQuestions = [...editedFile.generatedQuestions];
    newQuestions[sectionIndex].questions[qIndex] = {
      ...newQuestions[sectionIndex].questions[qIndex],
      [field]: value
    };
    setEditedFile(prev => ({ ...prev, generatedQuestions: newQuestions }));
  };

  const updateOption = (sectionIndex, qIndex, oIndex, value) => {
    const newQuestions = [...editedFile.generatedQuestions];
    const options = [...newQuestions[sectionIndex].questions[qIndex].options];
    options[oIndex] = value;
    newQuestions[sectionIndex].questions[qIndex].options = options;
    setEditedFile(prev => ({ ...prev, generatedQuestions: newQuestions }));
  };

  // Download PDF for a saved file (Ported from UploadPdfNotes)
  const downloadFilePDF = (file) => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });

    // ── Page geometry ──────────────────────────────────────────
    const PW = 210;          // page width  (A4 mm)
    const PH = 297;          // page height (A4 mm)
    const ML = 15;           // margin left
    const MR = 15;           // margin right
    const CONTENT_W = PW - ML - MR;  // 180 mm usable
    const RIGHT = PW - MR;           // 195

    const totalMarks = file.totalMarks;
    const headerDetails = file.headerDetails || {};
    const outputType = file.outputType;

    // ── Font helpers ───────────────────────────────────────────
    pdf.addFileToVFS("Outfit-Regular.ttf", OutfitRegular);
    pdf.addFont("Outfit-Regular.ttf", "Outfit", "normal");

    const setHelvetica = (style = "normal", size = 11) => {
      pdf.setFont("helvetica", style);
      pdf.setFontSize(size);
    };
    const setOutfit = (size = 11) => {
      pdf.setFont("Outfit", "normal");
      pdf.setFontSize(size);
    };

    // ── Text helpers ───────────────────────────────────────────
    const printWrapped = (text, x, y, maxW, lineH = 5) => {
      const lines = pdf.splitTextToSize(String(text), maxW);
      lines.forEach(line => {
        if (y > PH - 18) { pdf.addPage(); y = 20; }
        pdf.text(line, x, y);
        y += lineH;
      });
      return y;
    };

    const guardPage = (y, minSpace = 30) => {
      if (y > PH - minSpace) { pdf.addPage(); return 20; }
      return y;
    };

    const hRule = (y, lw = 0.3, color = [0, 0, 0]) => {
      pdf.setDrawColor(...color);
      pdf.setLineWidth(lw);
      pdf.line(ML, y, RIGHT, y);
    };

    const fillRect = (x, y, w, h, rgb) => {
      pdf.setFillColor(...rgb);
      pdf.rect(x, y, w, h, "F");
    };

    // ══════════════════════════════════════════════════════════
    //  HEADER
    // ══════════════════════════════════════════════════════════
    let y = 14;
    fillRect(0, 0, PW, 6, [30, 30, 30]);

    if (headerDetails.collegeName) {
      setHelvetica("bold", 16);
      pdf.setTextColor(20, 20, 20);
      const collegeLines = pdf.splitTextToSize(headerDetails.collegeName.toUpperCase(), CONTENT_W);
      collegeLines.forEach(line => {
        pdf.text(line, PW / 2, y, { align: "center" });
        y += 7;
      });
    }

    if (headerDetails.examName || headerDetails.year) {
      setHelvetica("normal", 11);
      pdf.setTextColor(60, 60, 60);
      const examLine = [headerDetails.examName, headerDetails.year].filter(Boolean).join("  –  ");
      pdf.text(examLine, PW / 2, y, { align: "center" });
      y += 6;
    }

    hRule(y, 0.4, [180, 180, 180]);
    y += 5;

    const docTitle =
      outputType === "answer-key"
        ? "ANSWER KEY"
        : outputType === "questions-answers"
          ? "QUESTIONS WITH ANSWERS"
          : "QUESTION PAPER";

    setHelvetica("bold", 13);
    pdf.setTextColor(255, 255, 255);
    const bannerH = 9;
    fillRect(ML, y - 6.5, CONTENT_W, bannerH, [40, 40, 40]);
    pdf.text(docTitle, PW / 2, y, { align: "center" });
    pdf.setTextColor(20, 20, 20);
    y += 9;

    setHelvetica("normal", 10);
    pdf.setTextColor(40, 40, 40);

    const leftMeta = headerDetails.subjectName ? `Subject: ${headerDetails.subjectName}` : "";
    const centerMeta = headerDetails.duration ? `Duration: ${headerDetails.duration}` : "";
    const rightMeta = `Max. Marks: ${totalMarks}`;

    if (leftMeta) pdf.text(leftMeta, ML, y);
    if (centerMeta) pdf.text(centerMeta, PW / 2, y, { align: "center" });
    pdf.text(rightMeta, RIGHT, y, { align: "right" });
    y += 5;

    hRule(y, 0.6, [20, 20, 20]);
    hRule(y + 2, 0.2, [20, 20, 20]);
    y += 8;

    if (outputType !== "answer-key") {
      setHelvetica("bold", 10);
      pdf.setTextColor(20, 20, 20);
      pdf.text("General Instructions:", ML, y);
      y += 5;

      const instructions = [
        `All questions are compulsory unless stated otherwise.`,
        `The question paper consists of ${file.generatedQuestions.length} section(s).`,
        `Figures to the right indicate full marks for each question.`,
        `Read all questions carefully before answering.`
      ];

      setOutfit(9.5);
      pdf.setTextColor(50, 50, 50);
      instructions.forEach((inst, i) => {
        y = printWrapped(`${i + 1}.  ${inst}`, ML + 4, y, CONTENT_W - 4, 4.8);
      });
      y += 3;
      hRule(y, 0.3, [200, 200, 200]);
      y += 7;
    }

    let globalQ = 1;
    file.generatedQuestions.forEach((section, sIdx) => {
      y = guardPage(y, 40);

      const bloomLabels = (Array.isArray(section.bloomsLevel)
        ? section.bloomsLevel
        : [section.bloomsLevel]
      ).map(l => BLOOMS_LEVELS[l] || l).join(", ");

      const qTypeLbl = QUESTION_TYPES[section.questionType] || section.questionType || "";
      const secMarksLbl = `[${section.marksPerQuestion} mark${section.marksPerQuestion > 1 ? "s" : ""} each]`;

      fillRect(ML, y - 5.5, CONTENT_W, 8, [230, 230, 230]);
      setHelvetica("bold", 11);
      pdf.setTextColor(20, 20, 20);
      pdf.text(section.section.toUpperCase(), ML + 3, y);
      pdf.text(secMarksLbl, RIGHT - 3, y, { align: "right" });
      y += 5;

      setOutfit(8.5);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`${qTypeLbl}  |  Bloom's Level: ${bloomLabels}`, ML + 3, y);
      y += 4;

      if (section.answerAny && section.answerAny < (section.questions?.length || 0)) {
        setHelvetica("bolditalic", 9);
        pdf.setTextColor(60, 60, 60);
        pdf.text(`(Answer any ${section.answerAny} of the following questions)`, PW / 2, y, { align: "center" });
        y += 5;
      }

      hRule(y, 0.2, [180, 180, 180]);
      y += 5;

      section.questions.forEach((question, qIdx) => {
        y = guardPage(y, 28);
        const qText = question.question || question.text || "";

        if (outputType !== "answer-key") {
          setHelvetica("bold", 10.5);
          pdf.setTextColor(20, 20, 20);
          pdf.text(`${globalQ}.`, ML, y);

          setOutfit(10.5);
          pdf.setTextColor(20, 20, 20);
          const qLines = pdf.splitTextToSize(qText, CONTENT_W - 8 - 12);
          qLines.forEach((line, li) => {
            if (y > PH - 18) { pdf.addPage(); y = 20; }
            pdf.text(line, ML + 8, y);
            y += 5.2;
          });

          const marksY = y - qLines.length * 5.2;
          setHelvetica("normal", 9);
          pdf.setTextColor(80, 80, 80);
          pdf.text(`[${section.marksPerQuestion}]`, RIGHT, marksY + 4, { align: "right" });
          pdf.setTextColor(20, 20, 20);

          if (section.questionType === "mcq" && Array.isArray(question.options)) {
            const opts = question.options;
            setOutfit(9.5);
            pdf.setTextColor(40, 40, 40);

            for (let i = 0; i < opts.length; i += 2) {
              y = guardPage(y, 12);
              const label1 = `(${String.fromCharCode(65 + i)})  ${opts[i]}`;
              const label2 = opts[i + 1] ? `(${String.fromCharCode(66 + i)})  ${opts[i + 1]}` : "";

              const colW = (CONTENT_W - 10) / 2 - 4;
              const wrapL = pdf.splitTextToSize(label1, colW);
              const wrapR = label2 ? pdf.splitTextToSize(label2, colW) : [];
              const rowH = Math.max(wrapL.length, wrapR.length) * 4.8;

              wrapL.forEach((l, li) => pdf.text(l, ML + 10, y + li * 4.8));
              wrapR.forEach((l, li) => pdf.text(l, ML + 10 + colW + 6, y + li * 4.8));
              y += rowH + 1;
            }
          }

          if (outputType === "questions-answers") {
            y += 1;
            const ansStartY = y;

            if (section.questionType === "mcq" && question.correctAnswer) {
              setHelvetica("bold", 9.5);
              pdf.setTextColor(30, 100, 30);
              pdf.text(`✓  Correct Answer: ${question.correctAnswer}`, ML + 10, y);
              y += 5;
            }

            const solText = question.answer || question.solution || "";
            if (solText) {
              setHelvetica("bold", 9);
              pdf.setTextColor(30, 100, 30);
              pdf.text("Solution:", ML + 10, y);
              y += 4.5;
              setOutfit(9);
              pdf.setTextColor(30, 60, 30);
              y = printWrapped(solText, ML + 10, y, CONTENT_W - 12, 4.8);
            }

            if (y > ansStartY) {
              pdf.setDrawColor(60, 160, 60);
              pdf.setLineWidth(0.8);
              pdf.line(ML + 8, ansStartY - 1, ML + 8, y);
              pdf.setLineWidth(0.3);
              pdf.setDrawColor(0, 0, 0);
            }
            pdf.setTextColor(20, 20, 20);
            y += 2;
          }
        } else {
          y = guardPage(y, 20);
          setHelvetica("bold", 10);
          pdf.setTextColor(20, 20, 20);
          pdf.text(`${globalQ}.`, ML, y);

          // Bloom's Level Badge on the same line as Question Number
          if (question.bloomsLevel) {
            const blevel = BLOOMS_LEVELS[question.bloomsLevel.toLowerCase()] || question.bloomsLevel;
            setHelvetica("italic", 7.5); // Slightly smaller font
            pdf.setTextColor(120, 120, 120); // Slightly lighter
            pdf.text(`[Bloom's: ${blevel}]`, RIGHT, y, { align: "right" });
          }

          y += 5.5; // Move to next line for the answer text to prevent overlap

          let ansText = "";
          if (section.questionType === "mcq") {
            ansText = `[Ans: Option ${question.correctAnswer || "N/A"}]  ${question.answer || question.solution || ""}`;
          } else {
            ansText = question.answer || question.solution || "Answer not available.";
          }

          setOutfit(10);
          pdf.setTextColor(30, 30, 30);
          y = printWrapped(ansText, ML + 8, y, CONTENT_W - 10, 5);

          if (section.questionType === "mcq" && question.correctAnswer) {
            pdf.setDrawColor(60, 160, 60);
            pdf.setLineWidth(0.8);
            pdf.line(ML + 6, y - (pdf.splitTextToSize(ansText, CONTENT_W - 10).length * 5) - 0.5, ML + 6, y - 0.5);
            pdf.setLineWidth(0.3);
            pdf.setDrawColor(0, 0, 0);
          }
          pdf.setTextColor(20, 20, 20);
        }

        if (qIdx < section.questions.length - 1) {
          hRule(y + 0.5, 0.15, [210, 210, 210]);
          y += 4;
        } else {
          y += 3;
        }
        globalQ++;
      });

      y += 8;
      hRule(y - 4, 0.4, [140, 140, 140]);
    });

    const totalPages = pdf.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      fillRect(0, PH - 8, PW, 8, [30, 30, 30]);
      setHelvetica("normal", 8);
      pdf.setTextColor(200, 200, 200);
      pdf.text(headerDetails.subjectName || docTitle, ML, PH - 3);
      pdf.text(`Page ${p} of ${totalPages}`, RIGHT, PH - 3, { align: "right" });
      pdf.text(`Total Marks: ${totalMarks}`, PW / 2, PH - 3, { align: "center" });
    }

    const filename = `${(headerDetails.subjectName || file.title).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    pdf.save(filename);
  };

  // Get icon for output type
  const getOutputIcon = (outputType) => {
    switch (outputType) {
      case 'question-paper':
        return <FileText size={20} className="text-blue-600" />;
      case 'answer-key':
        return <Key size={20} className="text-green-600" />;
      case 'questions-answers':
        return <BookOpen size={20} className="text-purple-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // View file details
  const viewFile = (file) => {
    setSelectedFile(file);
    setViewMode(true);
    setIsEditing(false);
  };

  // Go back to file list
  const backToList = () => {
    if (isEditing && !window.confirm('Discard changes?')) return;
    setSelectedFile(null);
    setViewMode(false);
    setIsEditing(false);
    setEditedFile(null);
  };

  if (viewMode && selectedFile) {
    const displayFile = isEditing ? editedFile : selectedFile;

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={backToList}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            ← Back to Files
          </button>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={toggleEditMode}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  Edit File
                </button>
                <button
                  onClick={() => downloadFilePDF(selectedFile)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  onClick={() => deleteFile(selectedFile.id)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={saveChanges}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={toggleEditMode}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-sm"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Paper Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              {getOutputIcon(displayFile.outputType)}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">File Title</label>
                    <input
                      type="text"
                      value={displayFile.title}
                      onChange={(e) => updateEditedFile('title', e.target.value)}
                      className="w-full text-xl font-bold text-gray-800 border-b-2 border-blue-200 focus:border-blue-500 outline-none pb-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">College Name</label>
                      <input
                        type="text"
                        value={displayFile.headerDetails?.collegeName || ''}
                        onChange={(e) => updateHeaderDetails('collegeName', e.target.value)}
                        className="w-full text-sm border-b border-gray-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Name</label>
                      <input
                        type="text"
                        value={displayFile.headerDetails?.examName || ''}
                        onChange={(e) => updateHeaderDetails('examName', e.target.value)}
                        className="w-full text-sm border-b border-gray-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                      <input
                        type="text"
                        value={displayFile.headerDetails?.subjectName || ''}
                        onChange={(e) => updateHeaderDetails('subjectName', e.target.value)}
                        className="w-full text-sm border-b border-gray-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year</label>
                      <input
                        type="text"
                        value={displayFile.headerDetails?.year || ''}
                        onChange={(e) => updateHeaderDetails('year', e.target.value)}
                        className="w-full text-sm border-b border-gray-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration</label>
                      <input
                        type="text"
                        value={displayFile.headerDetails?.duration || ''}
                        onChange={(e) => updateHeaderDetails('duration', e.target.value)}
                        className="w-full text-sm border-b border-gray-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-800">{displayFile.title}</h1>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-600">
                    <p><strong>Created:</strong> {formatDate(displayFile.createdAt)}</p>
                    {displayFile.headerDetails?.subjectName && <p><strong>Subject:</strong> {displayFile.headerDetails.subjectName}</p>}
                    <p><strong>Total Marks:</strong> <span className="text-blue-600 font-bold">{displayFile.totalMarks}</span></p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {displayFile.generatedQuestions.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <h3 className="font-bold text-lg mb-4 text-gray-800 flex justify-between items-center">
                <span>{section.section} - {QUESTION_TYPES[section.questionType] || section.questionType}</span>
                <span className="text-sm font-normal text-gray-500">
                  {section.marksPerQuestion} mark{section.marksPerQuestion > 1 ? 's' : ''} each
                </span>
              </h3>

              {section.questions.length > 0 ? (
                <div className="space-y-6">
                  {section.questions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-gray-50/50 p-4 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-gray-100">
                      <div className="flex gap-3">
                        <span className="font-bold text-blue-600 min-w-[2rem]">Q{qIndex + 1}.</span>
                        <div className="flex-1">
                          {isEditing ? (
                            <textarea
                              value={question.question || question.text}
                              onChange={(e) => updateQuestion(sectionIndex, qIndex, 'question', e.target.value)}
                              rows={2}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
                            />
                          ) : (
                            <div className="font-medium text-gray-800">
                              {question.question || question.text}
                              {question.bloomsLevel && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 ml-2 px-1.5 py-0.5 rounded border border-blue-100 uppercase font-bold align-middle">
                                  {BLOOMS_LEVELS[question.bloomsLevel.toLowerCase()] || question.bloomsLevel}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Options for MCQ */}
                          {section.questionType === 'mcq' && question.options && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {question.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-3 bg-white p-2 rounded border border-gray-100">
                                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => updateOption(sectionIndex, qIndex, oIdx, e.target.value)}
                                      className="flex-1 text-sm outline-none"
                                    />
                                  ) : (
                                    <span className="text-sm text-gray-700">{opt}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Correct Answer / Answer Key */}
                          {(displayFile.outputType === "answer-key" || isEditing) && question.correctAnswer !== undefined && (
                            <div className="mt-4 p-3 bg-green-50 rounded border border-green-100">
                              <span className="text-xs font-bold text-green-700 uppercase block mb-1">Correct Answer</span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={question.correctAnswer}
                                  onChange={(e) => updateQuestion(sectionIndex, qIndex, 'correctAnswer', e.target.value)}
                                  className="w-full p-1 border border-green-200 rounded text-sm text-green-800 outline-none"
                                  placeholder="e.g. A"
                                />
                              ) : (
                                <span className="text-green-800 font-bold">{question.correctAnswer}</span>
                              )}
                            </div>
                          )}

                          {/* Solution / Long Answer */}
                          {(displayFile.outputType === "questions-answers" || isEditing) && (question.answer || question.solution) !== undefined && (
                            <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-100">
                              <span className="text-xs font-bold text-purple-700 uppercase block mb-1">Solution / Explanation</span>
                              {isEditing ? (
                                <textarea
                                  value={question.answer || question.solution}
                                  onChange={(e) => updateQuestion(sectionIndex, qIndex, 'answer', e.target.value)}
                                  rows={3}
                                  className="w-full p-2 border border-purple-200 rounded text-sm text-gray-700 outline-none"
                                />
                              ) : (
                                <div className="text-gray-700 text-sm">{question.answer || question.solution}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-600">{section.error || "No questions generated"}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-700">All Generated Files</h1>
        <div className="text-gray-600 font-medium">
          Total Files: <span className="text-blue-600">{savedFiles.length}</span>
        </div>
      </div>

      {savedFiles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-100">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No files found</h2>
          <p className="text-gray-500">Generate and save some question papers to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedFiles.map((file) => (
            <div key={file.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {getOutputIcon(file.outputType)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg line-clamp-2 leading-tight">{file.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-medium">
                        <Calendar size={12} />
                        {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Sections</span>
                    <span className="font-bold text-gray-700">{file.generatedQuestions.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Marks</span>
                    <span className="font-bold text-blue-600">{file.totalMarks}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded capitalize font-medium text-gray-600">
                      {file.outputType.replace("-", " ")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => viewFile(file)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => downloadFilePDF(file)}
                    className="flex items-center justify-center p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                    title="Download PDF"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="flex items-center justify-center p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    title="Delete File"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllFiles;
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
      const updatedFiles = savedFiles.filter(file => file.id !== fileId);
      setSavedFiles(updatedFiles);
      localStorage.setItem('questionPapers', JSON.stringify(updatedFiles));

      // Close view mode if the deleted file was being viewed
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(null);
        setViewMode(false);
      }
    }
  };

  // Download PDF for a saved file
  const downloadFilePDF = (file) => {
    const pdf = new jsPDF();

    pdf.addFileToVFS("Outfit-Regular.ttf", OutfitRegular);
    pdf.addFont("Outfit-Regular.ttf", "Outfit", "normal");
    pdf.setFont("Outfit");

    let y = 20;
    let questionNumber = 1;

    // Title
    pdf.setFontSize(20);
    pdf.text("Question Paper", 105, y, { align: "center" });
    y += 20;

    // Instructions
    pdf.setFontSize(12);
    pdf.text("Instructions:", 15, y);
    y += 10;
    pdf.setFontSize(10);
    const instructions = [
      "• Attempt all questions.",
      "• Marks are indicated against each question.",
      "• Write your answers clearly and neatly."
    ];
    instructions.forEach(inst => {
      pdf.text(inst, 20, y);
      y += 6;
    });
    y += 10;

    // Generate content based on output type
    file.generatedQuestions.forEach((section) => {
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }

      // Section Header
      pdf.setFontSize(14);
      pdf.text(`${section.section} (${BLOOMS_LEVELS[section.bloomsLevel]})`, 15, y);
      y += 10;

      section.questions.forEach((question, index) => {
        if (y > 250) {
          pdf.addPage();
          y = 20;
        }

        // Question
        pdf.setFontSize(11);
        let questionText = "";

        if (file.outputType === "question-paper") {
          questionText = `${questionNumber}. ${question.question || question.text}`;
        } else if (file.outputType === "answer-key") {
          questionText = `${questionNumber}. ${question.question || question.text}`;
          if (question.correctAnswer) {
            questionText += ` [${question.correctAnswer}]`;
          }
        } else if (file.outputType === "questions-answers") {
          questionText = `${questionNumber}. ${question.question || question.text}`;
        }

        const wrappedQuestion = pdf.splitTextToSize(questionText, 180);
        pdf.text(wrappedQuestion, 15, y);
        y += wrappedQuestion.length * 5 + 5;

        // Answer (only for questions-answers)
        if (file.outputType === "questions-answers" && question.answer) {
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          const wrappedAnswer = pdf.splitTextToSize(`Answer: ${question.answer}`, 170);
          pdf.text(wrappedAnswer, 20, y);
          y += wrappedAnswer.length * 4 + 5;
          pdf.setTextColor(0, 0, 0);
        }

        // Marks
        pdf.setFontSize(9);
        pdf.text(`(${section.marksPerQuestion} marks)`, 180, y - 5);
        y += 8;

        questionNumber++;
      });

      y += 10;
    });

    const filename = `${file.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
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
  };

  // Go back to file list
  const backToList = () => {
    setSelectedFile(null);
    setViewMode(false);
  };

  if (viewMode && selectedFile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={backToList}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to Files
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => downloadFilePDF(selectedFile)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={16} />
              Download PDF
            </button>
            <button
              onClick={() => deleteFile(selectedFile.id)}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 size={16} />
              Delete File
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center gap-3 mb-4">
            {getOutputIcon(selectedFile.outputType)}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{selectedFile.title}</h1>
              <p className="text-gray-600">Created: {formatDate(selectedFile.createdAt)}</p>
              <p className="text-gray-600">Total Marks: {selectedFile.totalMarks}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedFile.generatedQuestions.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                {section.section} - {QUESTION_TYPES[section.questionType]}
                <span className="text-sm text-gray-600 ml-2">
                  ({BLOOMS_LEVELS[section.bloomsLevel]})
                </span>
              </h3>

              {section.questions.length > 0 ? (
                <div className="space-y-4">
                  {section.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border-l-4 border-blue-200 pl-4">
                      <div className="font-medium text-gray-800">
                        Q{qIndex + 1}. {question.question || question.text}
                        <span className="text-sm text-gray-500 ml-2">
                          ({section.marksPerQuestion} marks)
                        </span>
                      </div>

                      {selectedFile.outputType === "answer-key" && question.correctAnswer && (
                        <div className="mt-2 text-green-700 font-medium">
                          Correct Answer: {question.correctAnswer}
                        </div>
                      )}

                      {selectedFile.outputType === "questions-answers" && question.answer && (
                        <div className="mt-2 text-gray-700">
                          <strong>Answer:</strong> {question.answer}
                        </div>
                      )}
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
        <div className="text-gray-600">
          Total Files: {savedFiles.length}
        </div>
      </div>

      {savedFiles.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No files found</h2>
          <p className="text-gray-500">Generate and save some question papers to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedFiles.map((file) => (
            <div key={file.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getOutputIcon(file.outputType)}
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg line-clamp-2">{file.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Calendar size={14} />
                        {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash size={14} />
                    {file.generatedQuestions.length} sections
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={14} />
                    {file.totalMarks} total marks
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    Type: {file.outputType.replace("-", " ")}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => viewFile(file)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => downloadFilePDF(file)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
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
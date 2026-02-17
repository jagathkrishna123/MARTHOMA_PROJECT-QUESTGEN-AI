// import { useState } from "react";
// import * as pdfjsLib from "pdfjs-dist";
// import jsPDF from "jspdf";
// import { OutfitRegular } from "../fonts/outfitFonts";
// import { Plus, Trash2, Download, FileText, Key, BookOpen } from "lucide-react";

// import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.js?url";

// pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// // Bloom's Taxonomy Levels
// const BLOOMS_LEVELS = {
//   remembering: "Remembering",
//   understanding: "Understanding",
//   applying: "Applying",
//   analyzing: "Analyzing",
//   evaluating: "Evaluating",
//   creating: "Creating"
// };

// // Question Types
// const QUESTION_TYPES = {
//   mcq: "Multiple Choice Questions (MCQ)",
//   objective: "Objective Type",
//   short: "Short Answer",
//   long: "Long Answer"
// };

// const UploadPdfNotes = () => {
//   const [inputType, setInputType] = useState("file"); // 'file' or 'text'
//   const [manualSyllabus, setManualSyllabus] = useState("");
//   const [headerDetails, setHeaderDetails] = useState({
//     collegeName: "",
//     examName: "",
//     subjectName: "",
//     year: "",
//     duration: ""
//   });
//   const [rawText, setRawText] = useState("");
//   const [topics, setTopics] = useState([]);
//   const [paperStructure, setPaperStructure] = useState([]);
//   const [generatedQuestions, setGeneratedQuestions] = useState([]);
//   const [outputType, setOutputType] = useState("question-paper");
//   const [loadingPdf, setLoadingPdf] = useState(false);
//   const [loadingAI, setLoadingAI] = useState(false);

//   // ---------------------------
//   // 1️⃣ Read PDF Syllabus
//   // ---------------------------
//   const handlePdfUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setLoadingPdf(true);
//     setRawText("");
//     setTopics([]);
//     setGeneratedQuestions([]);

//     const reader = new FileReader();

//     reader.onload = async () => {
//       const typedArray = new Uint8Array(reader.result);
//       const pdf = await pdfjsLib.getDocument(typedArray).promise;

//       let text = "";

//       for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         const content = await page.getTextContent();
//         const strings = content.items.map((item) => item.str);
//         text += strings.join(" ") + "\n";
//       }

//       setRawText(text);
//       extractTopics(text);
//       setLoadingPdf(false);
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   const handleManualSyllabusSubmit = () => {
//     if (!manualSyllabus.trim()) return;
//     setRawText(manualSyllabus);
//     extractTopics(manualSyllabus);
//   };



//   const extractTopics = (text) => {
//     const topics = [];

//     // Remove textbook references & junk
//     const cleanText = text
//       .replace(/Text Books[\s\S]*/i, "")
//       .replace(/\(Analysis not required\)/gi, "");

//     // Split by Modules
//     const modules = cleanText.split(/Module\s+\d+/i);

//     modules.forEach(moduleBlock => {
//       // Split by colon sections
//       const parts = moduleBlock.split(":");

//       parts.forEach(part => {
//         // Split comma-separated subtopics
//         part.split(",").forEach(item => {
//           const t = item.trim();

//           if (
//             t.length > 6 &&
//             !t.match(/hours/i) &&
//             !t.match(/control abstraction/i)
//           ) {
//             topics.push(t);
//           }
//         });
//       });
//     });

//     // Deduplicate & limit
//     const uniqueTopics = [...new Set(topics)].slice(0, 40);

//     setTopics(uniqueTopics);
//   };



//   // ---------------------------
//   // 3️⃣ Paper Structure Management
//   // ---------------------------
//   const addSection = () => {
//     const newSection = {
//       id: Date.now(),
//       name: `Section ${paperStructure.length + 1}`,
//       questionType: "mcq",
//       bloomsLevel: ["remembering"],
//       numQuestions: 5,
//       answerAny: 5,
//       marksPerQuestion: 1,
//       totalMarks: 5
//     };
//     setPaperStructure([...paperStructure, newSection]);
//   };

//   const updateSection = (id, field, value) => {
//     setPaperStructure(sections =>
//       sections.map(section => {
//         if (section.id === id) {
//           const updated = { ...section, [field]: value };
//           if (field === 'numQuestions' || field === 'marksPerQuestion' || field === 'answerAny') {
//             const count = updated.answerAny || updated.numQuestions;
//             updated.totalMarks = count * updated.marksPerQuestion;
//           }
//           return updated;
//         }
//         return section;
//       })
//     );
//   };

//   const removeSection = (id) => {
//     setPaperStructure(sections => sections.filter(section => section.id !== id));
//   };

//   // ---------------------------
//   // 4️⃣ Generate Questions with AI
//   // ---------------------------
//   const generateQuestions = async () => {
//     if (!topics.length || !paperStructure.length) return;

//     setLoadingAI(true);

//     try {
//       const res = await fetch("http://localhost:5000/api/ai/generate-whole-paper", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           syllabusText: rawText,
//           headerDetails,
//           paperStructure
//         }),
//       });

//       const data = await res.json();

//       if (data.error) {
//         throw new Error(data.error);
//       }

//       if (!data.sections || !Array.isArray(data.sections)) {
//         alert("AI did not return valid sections.");
//         return;
//       }

//       // Merge API response with local structure metadata
//       const rawSections = data.sections || [];
//       const rawAnswerKey = data.answerKey || [];

//       const processedSections = rawSections.map((apiSection, index) => {
//         const originalStruct = paperStructure[index] || {};

//         // Map answers to questions
//         const questionsWithAnswers = (apiSection.questions || []).map(q => {
//           const answerEntry = Array.isArray(rawAnswerKey)
//             ? rawAnswerKey.find(a => a.questionId === q.id)
//             : null;

//           return {
//             ...q,
//             answer: answerEntry ? (answerEntry.solution || answerEntry.answer) : (q.answer || "Answer not available"),
//             correctAnswer: answerEntry ? answerEntry.answer : (q.correctAnswer || "")
//           };
//         });

//         return {
//           section: apiSection.title || apiSection.section || originalStruct.name,
//           questions: questionsWithAnswers,
//           questionType: originalStruct.questionType,
//           bloomsLevel: originalStruct.bloomsLevel,
//           marksPerQuestion: originalStruct.marksPerQuestion,
//           answerAny: originalStruct.answerAny
//         };
//       });

//       setGeneratedQuestions(processedSections);

//       // key-value pair update for header if it came back richer
//       if (data.header) {
//         setHeaderDetails(prev => ({
//           ...prev,
//           collegeName: data.header.institutionName || prev.collegeName,
//           examName: data.header.examTitle || prev.examName,
//           subjectName: data.header.subject || prev.subjectName,
//           year: data.header.grade || prev.year,
//           duration: data.header.timeAllowed || prev.duration,
//         }));
//       }

//     } catch (error) {
//       console.error("Error generating paper:", error);
//       alert("Failed to generate paper. Please try again.");
//     } finally {
//       setLoadingAI(false);
//     }
//   };

//   // ---------------------------
//   // 5️⃣ Save to LocalStorage
//   // ---------------------------
//   const saveToLocalStorage = () => {
//     const currentUser = JSON.parse(localStorage.getItem('currentUser'));
//     if (!currentUser) {
//       alert('Please login to save files');
//       return;
//     }

//     const savedFiles = JSON.parse(localStorage.getItem('questionPapers') || '[]');

//     const fileData = {
//       id: Date.now().toString(),
//       userId: currentUser.id,
//       title: `${outputType.replace("-", " ").toUpperCase()} - ${new Date().toLocaleDateString()}`,
//       outputType,
//       createdAt: new Date().toISOString(),
//       syllabusTopics: topics,
//       paperStructure,
//       generatedQuestions,
//       headerDetails,
//       totalMarks: paperStructure.reduce((sum, s) => sum + s.totalMarks, 0)
//     };

//     savedFiles.unshift(fileData); // Add to beginning of array

//     // Keep only last 50 files to prevent localStorage overflow
//     if (savedFiles.length > 50) {
//       savedFiles.splice(50);
//     }

//     localStorage.setItem('questionPapers', JSON.stringify(savedFiles));
//     alert('Question paper saved successfully!');
//   };

//   // ---------------------------
//   // 6️⃣ Download PDF — Redesigned
//   // ---------------------------
//   const downloadPDF = () => {
//     const pdf = new jsPDF({ unit: "mm", format: "a4" });

//     // ── Page geometry ──────────────────────────────────────────
//     const PW = 210;          // page width  (A4 mm)
//     const PH = 297;          // page height (A4 mm)
//     const ML = 15;           // margin left
//     const MR = 15;           // margin right
//     const CONTENT_W = PW - ML - MR;  // 180 mm usable
//     const RIGHT = PW - MR;           // 195

//     const totalMarks = paperStructure.reduce((sum, s) => sum + s.totalMarks, 0);

//     // ── Font helpers ───────────────────────────────────────────
//     pdf.addFileToVFS("Outfit-Regular.ttf", OutfitRegular);
//     pdf.addFont("Outfit-Regular.ttf", "Outfit", "normal");

//     const setHelvetica = (style = "normal", size = 11) => {
//       pdf.setFont("helvetica", style);
//       pdf.setFontSize(size);
//     };
//     const setOutfit = (size = 11) => {
//       pdf.setFont("Outfit", "normal");
//       pdf.setFontSize(size);
//     };

//     // ── Text helpers ───────────────────────────────────────────
//     // Safe multi-line text that wraps at maxW and advances y.
//     // Returns new y.
//     const printWrapped = (text, x, y, maxW, lineH = 5) => {
//       const lines = pdf.splitTextToSize(String(text), maxW);
//       lines.forEach(line => {
//         if (y > PH - 18) { pdf.addPage(); y = 20; }
//         pdf.text(line, x, y);
//         y += lineH;
//       });
//       return y;
//     };

//     // ── New-page guard (call before drawing a block) ──────────
//     const guardPage = (y, minSpace = 30) => {
//       if (y > PH - minSpace) { pdf.addPage(); return 20; }
//       return y;
//     };

//     // ── Draw thin horizontal rule ──────────────────────────────
//     const hRule = (y, lw = 0.3, color = [0, 0, 0]) => {
//       pdf.setDrawColor(...color);
//       pdf.setLineWidth(lw);
//       pdf.line(ML, y, RIGHT, y);
//     };

//     // ── Draw filled rect (header band helper) ─────────────────
//     const fillRect = (x, y, w, h, rgb) => {
//       pdf.setFillColor(...rgb);
//       pdf.rect(x, y, w, h, "F");
//     };

//     // ══════════════════════════════════════════════════════════
//     //  HEADER
//     // ══════════════════════════════════════════════════════════
//     let y = 14;

//     // Dark top accent bar
//     fillRect(0, 0, PW, 6, [30, 30, 30]);

//     // College name
//     if (headerDetails.collegeName) {
//       setHelvetica("bold", 16);
//       pdf.setTextColor(20, 20, 20);
//       const collegeLines = pdf.splitTextToSize(headerDetails.collegeName.toUpperCase(), CONTENT_W);
//       collegeLines.forEach(line => {
//         pdf.text(line, PW / 2, y, { align: "center" });
//         y += 7;
//       });
//     }

//     // Exam name + year
//     if (headerDetails.examName || headerDetails.year) {
//       setHelvetica("normal", 11);
//       pdf.setTextColor(60, 60, 60);
//       const examLine = [headerDetails.examName, headerDetails.year].filter(Boolean).join("  –  ");
//       pdf.text(examLine, PW / 2, y, { align: "center" });
//       y += 6;
//     }

//     // Thin divider
//     hRule(y, 0.4, [180, 180, 180]);
//     y += 5;

//     // Document type banner (light grey pill)
//     const docTitle =
//       outputType === "answer-key"
//         ? "ANSWER KEY"
//         : outputType === "questions-answers"
//         ? "QUESTIONS WITH ANSWERS"
//         : "QUESTION PAPER";

//     setHelvetica("bold", 13);
//     pdf.setTextColor(255, 255, 255);
//     const bannerH = 9;
//     fillRect(ML, y - 6.5, CONTENT_W, bannerH, [40, 40, 40]);
//     pdf.text(docTitle, PW / 2, y, { align: "center" });
//     pdf.setTextColor(20, 20, 20);
//     y += 9;

//     // Subject / Duration / Marks row
//     setHelvetica("normal", 10);
//     pdf.setTextColor(40, 40, 40);

//     const leftMeta  = headerDetails.subjectName ? `Subject: ${headerDetails.subjectName}` : "";
//     const centerMeta = headerDetails.duration   ? `Duration: ${headerDetails.duration}`    : "";
//     const rightMeta = `Max. Marks: ${totalMarks}`;

//     if (leftMeta)   pdf.text(leftMeta,   ML,       y);
//     if (centerMeta) pdf.text(centerMeta, PW / 2,   y, { align: "center" });
//                     pdf.text(rightMeta,  RIGHT,     y, { align: "right" });
//     y += 5;

//     // Double rule below meta
//     hRule(y,     0.6, [20, 20, 20]);
//     hRule(y + 2, 0.2, [20, 20, 20]);
//     y += 8;

//     // ══════════════════════════════════════════════════════════
//     //  GENERAL INSTRUCTIONS  (Question paper & combined only)
//     // ══════════════════════════════════════════════════════════
//     if (outputType !== "answer-key") {
//       setHelvetica("bold", 10);
//       pdf.setTextColor(20, 20, 20);
//       pdf.text("General Instructions:", ML, y);
//       y += 5;

//       const instructions = [
//         `All questions are compulsory unless stated otherwise.`,
//         `The question paper consists of ${paperStructure.length} section(s).`,
//         `Figures to the right indicate full marks for each question.`,
//         `Read all questions carefully before answering.`
//       ];

//       setOutfit(9.5);
//       pdf.setTextColor(50, 50, 50);
//       instructions.forEach((inst, i) => {
//         y = printWrapped(`${i + 1}.  ${inst}`, ML + 4, y, CONTENT_W - 4, 4.8);
//       });
//       y += 3;
//       hRule(y, 0.3, [200, 200, 200]);
//       y += 7;
//     }

//     // ══════════════════════════════════════════════════════════
//     //  SECTIONS & QUESTIONS
//     // ══════════════════════════════════════════════════════════
//     let globalQ = 1;

//     generatedQuestions.forEach((section, sIdx) => {
//       y = guardPage(y, 40);

//       // ── Section header ────────────────────────────────────
//       const bloomLabels = (Array.isArray(section.bloomsLevel)
//         ? section.bloomsLevel
//         : [section.bloomsLevel]
//       ).map(l => BLOOMS_LEVELS[l] || l).join(", ");

//       const qTypeLbl = QUESTION_TYPES[section.questionType] || section.questionType || "";
//       const secMarksLbl = `[${section.marksPerQuestion} mark${section.marksPerQuestion > 1 ? "s" : ""} each]`;

//       // Light band for section title
//       fillRect(ML, y - 5.5, CONTENT_W, 8, [230, 230, 230]);
//       setHelvetica("bold", 11);
//       pdf.setTextColor(20, 20, 20);
//       pdf.text(section.section.toUpperCase(), ML + 3, y);
//       pdf.text(secMarksLbl, RIGHT - 3, y, { align: "right" });
//       y += 5;

//       // Sub-line: question type + bloom's level
//       setOutfit(8.5);
//       pdf.setTextColor(80, 80, 80);
//       pdf.text(`${qTypeLbl}  |  Bloom's Level: ${bloomLabels}`, ML + 3, y);
//       y += 4;

//       // "Answer any N" note
//       if (section.answerAny && section.answerAny < (section.questions?.length || 0)) {
//         setHelvetica("bolditalic", 9);
//         pdf.setTextColor(60, 60, 60);
//         pdf.text(`(Answer any ${section.answerAny} of the following questions)`, PW / 2, y, { align: "center" });
//         y += 5;
//       }

//       hRule(y, 0.2, [180, 180, 180]);
//       y += 5;

//       // ── Questions ─────────────────────────────────────────
//       section.questions.forEach((question, qIdx) => {
//         y = guardPage(y, 28);

//         const qText = question.question || question.text || "";

//         // ── Question Paper / Combined ──
//         if (outputType !== "answer-key") {
//           // Question number + text
//           setHelvetica("bold", 10.5);
//           pdf.setTextColor(20, 20, 20);
//           // Number column occupies first 8 mm
//           pdf.text(`${globalQ}.`, ML, y);

//           setOutfit(10.5);
//           pdf.setTextColor(20, 20, 20);
//           // Wrap question text starting 8 mm in, leaving 12 mm on right for marks
//           const qLines = pdf.splitTextToSize(qText, CONTENT_W - 8 - 12);
//           qLines.forEach((line, li) => {
//             if (y > PH - 18) { pdf.addPage(); y = 20; }
//             pdf.text(line, ML + 8, y);
//             y += 5.2;
//           });

//           // Marks badge aligned to right on the first question line
//           const marksY = y - qLines.length * 5.2;  // back to where text started
//           setHelvetica("normal", 9);
//           pdf.setTextColor(80, 80, 80);
//           pdf.text(`[${section.marksPerQuestion}]`, RIGHT, marksY + 4, { align: "right" });
//           pdf.setTextColor(20, 20, 20);

//           // MCQ options
//           if (section.questionType === "mcq" && Array.isArray(question.options)) {
//             const opts = question.options;
//             setOutfit(9.5);
//             pdf.setTextColor(40, 40, 40);

//             // Render two options per row
//             for (let i = 0; i < opts.length; i += 2) {
//               y = guardPage(y, 12);
//               const label1 = `(${String.fromCharCode(65 + i)})  ${opts[i]}`;
//               const label2 = opts[i + 1]
//                 ? `(${String.fromCharCode(66 + i)})  ${opts[i + 1]}`
//                 : "";

//               // Left column: ML+10 to midpoint; Right column: midpoint onwards
//               const colW = (CONTENT_W - 10) / 2 - 4;
//               const wrapL = pdf.splitTextToSize(label1, colW);
//               const wrapR = label2 ? pdf.splitTextToSize(label2, colW) : [];
//               const rowH = Math.max(wrapL.length, wrapR.length) * 4.8;

//               wrapL.forEach((l, li) => pdf.text(l, ML + 10, y + li * 4.8));
//               wrapR.forEach((l, li) => pdf.text(l, ML + 10 + colW + 6, y + li * 4.8));
//               y += rowH + 1;
//             }
//           }

//           // Combined mode: inline answer block
//           if (outputType === "questions-answers") {
//             y += 1;
//             // Subtle answer block shading
//             const ansStartY = y;

//             if (section.questionType === "mcq" && question.correctAnswer) {
//               setHelvetica("bold", 9.5);
//               pdf.setTextColor(30, 100, 30);
//               pdf.text(`✓  Correct Answer: ${question.correctAnswer}`, ML + 10, y);
//               y += 5;
//             }

//             const solText = question.answer || question.solution || "";
//             if (solText) {
//               setHelvetica("bold", 9);
//               pdf.setTextColor(30, 100, 30);
//               pdf.text("Solution:", ML + 10, y);
//               y += 4.5;

//               setOutfit(9);
//               pdf.setTextColor(30, 60, 30);
//               y = printWrapped(solText, ML + 10, y, CONTENT_W - 12, 4.8);
//             }

//             // Draw light green rect behind the answer block
//             if (y > ansStartY) {
//               pdf.setFillColor(240, 255, 240);
//               pdf.setDrawColor(180, 220, 180);
//               pdf.setLineWidth(0.2);
//               // We draw behind, so re-render answer on top... instead just draw a left border line
//               pdf.setDrawColor(60, 160, 60);
//               pdf.setLineWidth(0.8);
//               pdf.line(ML + 8, ansStartY - 1, ML + 8, y);
//               pdf.setLineWidth(0.3);
//               pdf.setDrawColor(0, 0, 0);
//             }

//             pdf.setTextColor(20, 20, 20);
//             y += 2;
//           }
//         }

//         // ── Answer Key Mode ──
//         else {
//           y = guardPage(y, 20);
//           setHelvetica("bold", 10);
//           pdf.setTextColor(20, 20, 20);
//           pdf.text(`${globalQ}.`, ML, y);

//           let ansText = "";
//           if (section.questionType === "mcq") {
//             ansText = `[Ans: Option ${question.correctAnswer || "N/A"}]  ${question.answer || question.solution || ""}`;
//           } else {
//             ansText = question.answer || question.solution || "Answer not available.";
//           }

//           setOutfit(10);
//           pdf.setTextColor(30, 30, 30);
//           y = printWrapped(ansText, ML + 8, y, CONTENT_W - 10, 5);

//           // Green tick mark for MCQ
//           if (section.questionType === "mcq" && question.correctAnswer) {
//             // left bar accent
//             pdf.setDrawColor(60, 160, 60);
//             pdf.setLineWidth(0.8);
//             pdf.line(ML + 6, y - (pdf.splitTextToSize(ansText, CONTENT_W - 10).length * 5) - 0.5, ML + 6, y - 0.5);
//             pdf.setLineWidth(0.3);
//             pdf.setDrawColor(0, 0, 0);
//           }

//           pdf.setTextColor(20, 20, 20);
//         }

//         // Thin separator between questions
//         if (qIdx < section.questions.length - 1) {
//           hRule(y + 0.5, 0.15, [210, 210, 210]);
//           y += 4;
//         } else {
//           y += 3;
//         }

//         globalQ++;
//       }); // end questions

//       y += 8;
//       hRule(y - 4, 0.4, [140, 140, 140]);
//     }); // end sections

//     // ══════════════════════════════════════════════════════════
//     //  FOOTER on every page
//     // ══════════════════════════════════════════════════════════
//     const totalPages = pdf.internal.getNumberOfPages();
//     for (let p = 1; p <= totalPages; p++) {
//       pdf.setPage(p);

//       // Bottom accent bar
//       fillRect(0, PH - 8, PW, 8, [30, 30, 30]);

//       setHelvetica("normal", 8);
//       pdf.setTextColor(200, 200, 200);
//       pdf.text(
//         headerDetails.subjectName || docTitle,
//         ML,
//         PH - 3
//       );
//       pdf.text(
//         `Page ${p} of ${totalPages}`,
//         RIGHT,
//         PH - 3,
//         { align: "right" }
//       );
//       pdf.text(
//         `Total Marks: ${totalMarks}`,
//         PW / 2,
//         PH - 3,
//         { align: "center" }
//       );
//     }

//     // Save
//     const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//     const filename = `${headerDetails.subjectName || "Paper"}_${outputType}_${timestamp}.pdf`;
//     pdf.save(filename);
//   };

//   // ---------------------------
//   // UI
//   // ---------------------------
//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
//       <h1 className="text-3xl font-bold text-center text-gray-700">
//         Syllabus to Question Paper Generator
//       </h1>

//       {/* Step 1: Syllabus Input */}
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-semibold text-gray-700">Step 1: Provide Syllabus</h2>
//           <div className="flex bg-gray-100 p-1 rounded-lg">
//             <button
//               onClick={() => setInputType("file")}
//               className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${inputType === "file" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
//             >
//               Upload PDF
//             </button>
//             <button
//               onClick={() => setInputType("text")}
//               className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${inputType === "text" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
//             >
//               Manual Input
//             </button>
//           </div>
//         </div>

//         {inputType === "file" ? (
//           <div className="space-y-4">
//             <label className="block p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 transition-colors cursor-pointer group bg-gray-50/50">
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 onChange={handlePdfUpload}
//                 className="hidden"
//               />
//               <div className="flex flex-col items-center text-center">
//                 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
//                   <FileText className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <p className="text-gray-700 font-medium mb-1">Click to upload syllabus PDF</p>
//                 <p className="text-sm text-gray-500">Only PDF files are supported</p>
//               </div>
//             </label>
//             {loadingPdf && (
//               <div className="flex items-center justify-center gap-3 text-blue-600 font-medium">
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
//                 Reading PDF...
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <textarea
//               value={manualSyllabus}
//               onChange={(e) => setManualSyllabus(e.target.value)}
//               placeholder="Paste your syllabus text here... For best results, include each topic on a new line."
//               rows={8}
//               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-gray-50/50 transition-all"
//             />
//             <button
//               onClick={handleManualSyllabusSubmit}
//               disabled={!manualSyllabus.trim()}
//               className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
//             >
//               Process Syllabus
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Paper Header Details (Optional) */}
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <h2 className="text-xl font-semibold mb-6 text-gray-700">Step 2: Paper Header Details <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">College/Institution Name</label>
//             <input
//               type="text"
//               value={headerDetails.collegeName}
//               onChange={(e) => setHeaderDetails({ ...headerDetails, collegeName: e.target.value })}
//               placeholder="e.g., St. Joseph's College of Engineering"
//               className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Examination Name</label>
//             <input
//               type="text"
//               value={headerDetails.examName}
//               onChange={(e) => setHeaderDetails({ ...headerDetails, examName: e.target.value })}
//               placeholder="e.g., Semester End Examinations"
//               className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
//             <input
//               type="text"
//               value={headerDetails.subjectName}
//               onChange={(e) => setHeaderDetails({ ...headerDetails, subjectName: e.target.value })}
//               placeholder="e.g., Data Structures and Algorithms"
//               className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Year / Session</label>
//             <input
//               type="text"
//               value={headerDetails.year}
//               onChange={(e) => setHeaderDetails({ ...headerDetails, year: e.target.value })}
//               placeholder="e.g., 2023-2024"
//               className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Examination Duration</label>
//             <input
//               type="text"
//               value={headerDetails.duration}
//               onChange={(e) => setHeaderDetails({ ...headerDetails, duration: e.target.value })}
//               placeholder="e.g., 3 Hours"
//               className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Extracted Topics */}
//       {topics.length > 0 && (
//         <div className="bg-white p-6 rounded-lg shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
//               <BookOpen size={20} />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-700">Extracted Topics ({topics.length})</h2>
//           </div>
//           <div className="max-h-52 overflow-y-auto border-2 border-gray-100 rounded-xl p-4 bg-gray-50/30">
//             <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
//               {topics.map((topic, i) => (
//                 <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
//                   <span className="text-blue-400 font-bold mt-0.5">•</span>
//                   {topic}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}

//       {/* Paper Structure Builder */}
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold text-gray-700">Step 3: Design Paper Structure</h2>
//         </div>

//         <div className="space-y-4">
//           {paperStructure.map((section) => (
//             <div key={section.id} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-100">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1 text-gray-600">Section Name</label>
//                   <input
//                     type="text"
//                     value={section.name}
//                     onChange={(e) => updateSection(section.id, 'name', e.target.value)}
//                     className="w-full px-3 py-2 border-2 border-gray-300 rounded text-gray-700"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1 text-gray-600">Question Type</label>
//                   <select
//                     value={section.questionType}
//                     onChange={(e) => updateSection(section.id, 'questionType', e.target.value)}
//                     className="w-full px-3 py-2 border-2 border-gray-300 text-gray-700  rounded"
//                   >
//                     {Object.entries(QUESTION_TYPES).map(([key, label]) => (
//                       <option key={key} value={key}>{label}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-3 text-gray-600">Bloom's Levels</label>
//                   <div className="grid grid-cols-2 gap-2">
//                     {Object.entries(BLOOMS_LEVELS).map(([key, label]) => (
//                       <label key={key} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white rounded transition-colors group">
//                         <input
//                           type="checkbox"
//                           checked={Array.isArray(section.bloomsLevel) ? section.bloomsLevel.includes(key) : section.bloomsLevel === key}
//                           onChange={(e) => {
//                             const currentLevels = Array.isArray(section.bloomsLevel) ? section.bloomsLevel : [section.bloomsLevel];
//                             const newLevels = e.target.checked
//                               ? [...currentLevels, key]
//                               : currentLevels.filter(l => l !== key);
//                             updateSection(section.id, 'bloomsLevel', newLevels.length > 0 ? newLevels : ['remembering']);
//                           }}
//                           className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                         />
//                         <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors">{label}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex gap-2">
//                   <div className="flex-1">
//                     <label className="block text-sm font-medium mb-1 text-gray-600">Questions</label>
//                     <input
//                       type="number"
//                       min="1"
//                       value={section.numQuestions}
//                       onChange={(e) => updateSection(section.id, 'numQuestions', parseInt(e.target.value))}
//                       className="w-full px-3 py-2 border-2 border-gray-300 text-gray-700 rounded"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-sm font-medium mb-1 text-gray-600">Answer any</label>
//                     <input
//                       type="number"
//                       min="1"
//                       max={section.numQuestions}
//                       value={section.answerAny || section.numQuestions}
//                       onChange={(e) => updateSection(section.id, 'answerAny', parseInt(e.target.value))}
//                       className="w-full px-3 py-2 border-2 border-gray-300 text-gray-700 rounded"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-sm font-medium mb-1 text-gray-600">Marks/Q</label>
//                     <input
//                       type="number"
//                       min="1"
//                       value={section.marksPerQuestion}
//                       onChange={(e) => updateSection(section.id, 'marksPerQuestion', parseInt(e.target.value))}
//                       className="w-full px-3 py-2 border-2 border-gray-300 text-gray-700 rounded"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-between items-center mt-4">
//                 <span className="text-sm text-gray-600">
//                   Total Marks: {section.totalMarks}
//                 </span>
//                 <button
//                   onClick={() => removeSection(section.id)}
//                   className="flex items-center gap-2 px-3 py-1 bg-red-500/90 border border-red-500 text-white rounded hover:bg-red-700"
//                 >
//                   <Trash2 size={14} /> Remove
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {paperStructure.length > 0 && (
//           <div className="mt-6 text-center">
//             <p className="text-lg font-semibold text-gray-700">
//               Total Paper Marks: {paperStructure.reduce((sum, s) => sum + s.totalMarks, 0)}
//             </p>
//           </div>
//         )}
//         <button
//           onClick={addSection}
//           className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//         >
//           <Plus size={16} /> Add Section
//         </button>
//       </div>

//       {/* Output Type Selection */}
//       {paperStructure.length > 0 && (
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 4: Select Output Format</h2>
//           <div className="flex gap-4 justify-center">
//             {[
//               { value: "question-paper", label: "Question Paper", icon: FileText },
//               { value: "answer-key", label: "Answer Key", icon: Key },
//               { value: "questions-answers", label: "Questions with Answers", icon: BookOpen }
//             ].map(({ value, label, icon: Icon }) => (
//               <button
//                 key={value}
//                 onClick={() => setOutputType(value)}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-colors ${outputType === value
//                   ? "border-blue-600 bg-blue-50 text-blue-700"
//                   : "border-gray-300 hover:border-gray-400"
//                   }`}
//               >
//                 <Icon size={20} />
//                 {label}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Generate Button */}
//       {topics.length > 0 && paperStructure.length > 0 && (
//         <div className="text-center">
//           <button
//             onClick={generateQuestions}
//             disabled={loadingAI}
//             className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             {loadingAI ? "Generating Questions..." : "Generate Question Paper"}
//           </button>
//         </div>
//       )}

//       {/* Loading Overlay */}
//       {loadingAI && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
//             <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
//             <h3 className="text-xl font-bold text-gray-800 mb-2">Generating Paper...</h3>
//             <p className="text-gray-600 text-center">
//               AI is analyzing your syllabus and creating questions. This may take up to a minute.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Generated Questions Preview */}
//       {generatedQuestions.length > 0 && (
//         <div className="bg-white p-6 rounded-lg shadow-md animate-in fade-in slide-in-from-bottom-8 duration-700">

//           {/* Success Banner */}
//           <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3 text-green-800">
//             <div className="bg-green-100 p-2 rounded-full">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//               </svg>
//             </div>
//             <div>
//               <p className="font-bold">Success!</p>
//               <p className="text-sm">Your question paper has been generated successfully.</p>
//             </div>
//           </div>

//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold">Generated Questions Preview</h2>
//             <div className="flex gap-3">
//               <button
//                 onClick={saveToLocalStorage}
//                 className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
//               >
//                 💾 Save File
//               </button>
//               <button
//                 onClick={downloadPDF}
//                 className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-all hover:shadow-lg"
//               >
//                 <Download size={16} />
//                 Download {outputType.replace("-", " ").toUpperCase()}
//               </button>
//             </div>
//           </div>

//           <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
//             {generatedQuestions.map((section, sectionIndex) => (
//               <div key={sectionIndex} className="border-2 border-gray-100 rounded-xl p-6 hover:border-blue-100 transition-colors bg-white">
//                 <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2 flex justify-between items-center">
//                   <span>{section.section}</span>
//                   <span className="text-xs font-normal px-3 py-1 bg-gray-100 rounded-full text-gray-600">
//                     {QUESTION_TYPES[section.questionType]} • {Array.isArray(section.bloomsLevel) ? section.bloomsLevel.map(l => BLOOMS_LEVELS[l]).join(", ") : BLOOMS_LEVELS[section.bloomsLevel]}
//                   </span>
//                 </h3>

//                 {section.questions.length > 0 ? (
//                   <div className="space-y-4">
//                     {section.questions.map((question, qIndex) => (
//                       <div key={qIndex} className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50/50 transition-colors">
//                         <div className="font-medium text-gray-800">
//                           <span className="text-blue-600 font-bold mr-2">Q{qIndex + 1}.</span>
//                           {question.question || question.text}
//                           <span className="text-xs text-gray-500 ml-2 font-normal border px-2 py-0.5 rounded">
//                             {section.marksPerQuestion} marks
//                           </span>
//                         </div>

//                         {/* MCQ Options */}
//                         {section.questionType === 'mcq' && question.options && (
//                           <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 ml-6">
//                             {question.options.map((opt, oIdx) => (
//                               <div key={oIdx} className="text-sm text-gray-600 flex items-center gap-2">
//                                 <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs text-gray-400 font-mono">
//                                   {String.fromCharCode(65 + oIdx)}
//                                 </span>
//                                 {opt}
//                               </div>
//                             ))}
//                           </div>
//                         )}

//                         {outputType === "answer-key" && question.correctAnswer && (
//                           <div className="mt-3 ml-6 text-sm bg-green-50 text-green-800 p-2 rounded border border-green-100 inline-block">
//                             <strong>Correct Answer:</strong> {question.correctAnswer}
//                           </div>
//                         )}

//                         {outputType === "questions-answers" && question.answer && (
//                           <div className="mt-3 ml-6 text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
//                             <strong>Solution:</strong> {question.answer}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-red-500 italic p-4 bg-red-50 rounded">
//                     {section.error || "No questions generated for this section."}
//                   </p>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UploadPdfNotes;


import React from 'react'

const UploadFile = () => {
  return (
    <div>UploadFile</div>
  )
}

export default UploadFile
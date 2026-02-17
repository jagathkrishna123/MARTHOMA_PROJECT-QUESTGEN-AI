import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI backend is running");
});

app.post("/api/ai/generate", async (req, res) => {
  const { topic, length = "short", level = "easy" } = req.body;
  console.log("hello");


  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  /* ---------- AI INSTRUCTIONS ---------- */
  const lengthInstruction =
    length === "long"
      ? "Write a detailed explanation with examples."
      : "Write a short and concise explanation.";

  let difficultyInstruction = "";
  if (level === "easy") {
    difficultyInstruction =
      "Explain in very simple terms suitable for beginners.";
  } else if (level === "exam") {
    difficultyInstruction =
      "Explain in an exam-oriented manner with clear definitions and key points.";
  } else if (level === "advanced") {
    difficultyInstruction =
      "Explain in an advanced, in-depth manner with technical clarity.";
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content:
              "Generate clean, plain-text study notes only. Do NOT use markdown, headings, bullet points, symbols, bold text, or special formatting. Write normal paragraphs suitable for PDF export.",
          },
          {
            role: "user",
            content: `
Topic: ${topic}

Instructions:
${lengthInstruction}
${difficultyInstruction}

Write clear study notes in plain text.
            `,
          },
        ],
        temperature: 0.6,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer =
      response.data.choices?.[0]?.message?.content ||
      "No response generated.";

    res.json({ answer });
  } catch (error) {
    console.error(
      "AI ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "AI generation failed",
    });
  }
});
//////////////////

app.post("/api/ai/generate-bulk", async (req, res) => {
  const { topics } = req.body;

  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ error: "Topics required" });
  }

  try {
    const results = [];

    for (const topic of topics) {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content:
                "Generate clean plain-text study notes. No markdown or formatting.",
            },
            {
              role: "user",
              content: `Explain this topic clearly:\n${topic}`,
            },
          ],
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      results.push({
        topic,
        answer:
          response.data.choices?.[0]?.message?.content ||
          "No answer generated",
      });
    }

    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Bulk generation failed" });
  }
});

app.post("/api/ai/generate-questions", async (req, res) => {
  const { topics, questionType, bloomsLevel, numQuestions, marks, syllabusText } = req.body;
  // console.log("heloo");


  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ error: "Topics are required" });
  }

  if (!questionType || !bloomsLevel || !numQuestions) {
    return res.status(400).json({ error: "Question type, Bloom's level, and number of questions are required" });
  }

  // For testing, return mock questions if API key is not available
  if (!process.env.OPENROUTER_API_KEY) {
    console.log("No API key found, returning mock questions");
    const mockQuestions = generateMockQuestions(questionType, numQuestions, topics);
    return res.json({ questions: mockQuestions });
  }

  // Define Bloom's taxonomy instructions
  const bloomsInstructions = {
    remembering: "Focus on recall and recognition of facts, concepts, and basic information.",
    understanding: "Focus on explaining ideas, interpreting information, and summarizing concepts.",
    applying: "Focus on using information in new situations and solving problems.",
    analyzing: "Focus on breaking down information, identifying relationships, and drawing conclusions.",
    evaluating: "Focus on making judgments, critiquing information, and supporting opinions.",
    creating: "Focus on generating new ideas, designing solutions, and creating original work."
  };

  // Define question type instructions
  const questionTypeInstructions = {
    mcq: `Generate multiple choice questions with exactly 4 options (A, B, C, D) each. Include the correct answer as a single letter: "A", "B", "C", or "D". Format: Question|Option A|Option B|Option C|Option D|Correct Letter (A, B, C, or D)`,
    objective: `Generate objective type questions (True/False, Fill in the blanks, or One-word). The answer MUST be 1-5 words long or just "True" or "False". No options allowed. Format: Question|Answer`,
    short: `Generate short answer questions requiring descriptive answers. The answer length MUST be between 30 and 60 words. Format: Question|Expected Answer`,
    long: `Generate long answer questions requiring detailed descriptive answers. The answer length MUST be between 120 and 180 words. Format: Question|Detailed Answer`
  };

  // const systemPrompt = `You are an expert question paper generator. Based on the syllabus content provided, generate ${numQuestions} ${questionTypeInstructions[questionType]} following Bloom's taxonomy level: ${bloomsInstructions[bloomsLevel]}. Each question should be worth ${marks} marks. Use the provided topics as the basis for questions. Return questions in plain text format without markdown.`;
  //   const systemPrompt = `
  // You are an expert question paper generator.

  // You MUST return ONLY valid JSON.
  // DO NOT include explanations, markdown, or extra text.

  // JSON FORMAT (must be followed strictly):

  // {
  //   "questions": [
  //     {
  //       "question": "string",
  //       "options": ["A", "B", "C", "D"],   // only for mcq
  //       "correctAnswer": "A",            // only for mcq
  //       "answer": "string"               // for objective/short/long
  //     }
  //   ]
  // }

  // Rules:
  // - Generate exactly ${numQuestions} questions
  // - Follow Bloom's taxonomy: ${bloomsInstructions[bloomsLevel]}
  // - Question type: ${questionType}
  // - Marks per question: ${marks}
  // `;

  const systemPrompt = `
You are a university-level question paper setter.

Your task is to generate high-quality, exam-oriented questions.

RULES:
- Use the provided syllabus topics as the source.
- Questions must be realistic, clear, and academically correct.
- Avoid vague or generic questions.

QUESTION TYPE RULES (STRICT):
1. MCQ (Multiple Choice Question):
   - MUST include exactly 4 options.
   - The correct answer MUST be a single letter: "A", "B", "C", or "D".
2. objective:
   - Direct answer only.
   - NO options allowed.
   - Answer length: 1–5 words or just "True"/"False".
3. short (Short Answer):
   - Descriptive answer.
   - Answer length: 30–60 words.
4. long (Long Answer):
   - Detailed descriptive answer.
   - Answer length: 120–180 words.

OUTPUT FORMAT (STRICT JSON):
{
  "questions": [
    {
      "question": "string",
      "options": ["Option A", "Option B", "Option C", "Option D"], // ONLY for mcq
      "answer": "string", // Solution text (30-60 words for short, 120-180 for long, 1-5 words/TF for objective)
      "correctAnswer": "A", // ONLY for mcq, must be A, B, C, or D
      "bloomsLevel": "string" // e.g. remembering, understanding, etc.
    }
  ]
}

Generate exactly ${numQuestions} questions.
`;




  // const userPrompt = `Syllabus Content:\n${syllabusText}\n\nTopics to generate questions from:\n${topics.join('\n')}\n\nGenerate ${numQuestions} questions following the specified format.`;

  //   const userPrompt = `
  // Topics:
  // ${topics.join("\n")}

  // Generate questions strictly in the JSON format.
  // `;

  // const userPrompt = `
  // SYLLABUS TOPICS (USE THESE EXACTLY):

  // ${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

  // INSTRUCTIONS:
  // - Use ONE topic per question.
  // - Mention the topic explicitly in the question.
  // - Do NOT reuse the same topic.
  // - Base the answer strictly on the topic.

  // Return JSON only.
  // `;

  const userPrompt = `
Syllabus topics:

${topics.join("\n")}

Instructions:
- Generate ${numQuestions} exam-quality questions.
- Use topics from the syllabus.
- Ensure questions are meaningful and specific.

Return JSON only.
`;



  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // const generatedContent = response.data.choices?.[0]?.message?.content || "";

    // // Parse the generated content based on question type
    // const questions = parseGeneratedQuestions(generatedContent, questionType);

    // res.json({ questions });

    const generatedContent =
      response.data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(generatedContent);
    } catch (e) {
      console.error("JSON parse failed:", generatedContent);
      return res.json({
        questions: generateMockQuestions(questionType, numQuestions, topics)
      });
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return res.json({
        questions: generateMockQuestions(questionType, numQuestions, topics)
      });
    }

    const cleaned = parsed.questions.map(q => ({
      question: q.question || "",
      options: q.options || [],
      answer: q.answer || "Answer not available",
      correctAnswer: q.correctAnswer || "",
      bloomsLevel: q.bloomsLevel || ""
    }));

    res.json({ questions: cleaned });

  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Question generation failed",
      details: error.message
    });
  }
});

// Mock question generator for testing
function generateMockQuestions(questionType, numQuestions, topics) {
  const questions = [];
  const sampleTopics = topics.slice(0, numQuestions);

  for (let i = 0; i < numQuestions; i++) {
    const topic = sampleTopics[i] || `Sample Topic ${i + 1}`;

    if (questionType === 'mcq') {
      questions.push({
        question: `What is the main concept of ${topic}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "A",
        answer: "A",
        type: 'mcq',
        bloomsLevel: 'remembering'
      });
    } else if (questionType === 'objective') {
      questions.push({
        question: `True or False: ${topic} is an important concept.`,
        answer: "True",
        type: 'objective',
        bloomsLevel: 'remembering'
      });
    } else if (questionType === 'short') {
      questions.push({
        question: `Explain ${topic} in detail.`,
        answer: `This is a short answer explaining ${topic}. It covers the main points and provides a concise explanation of the subject matter, ensuring that all key aspects are addressed within the thirty to sixty word limit specified for this type of question.`,
        type: 'short',
        bloomsLevel: 'understanding'
      });
    } else if (questionType === 'long') {
      questions.push({
        question: `Discuss ${topic} in detail, covering its importance and applications.`,
        answer: `This is a detailed explanation of ${topic}. It covers various aspects including definitions, importance, applications, and related concepts. The answer provides comprehensive information suitable for long answer questions. We ensure that the length of this response stays within the one hundred twenty to one hundred eighty word range to provide a thorough understanding of the topic for any academic examination or study purposes. This level of detail helps students grasp the nuances and broader implications of the concept in a real-world scenario.`,
        type: 'long',
        bloomsLevel: 'analyzing'
      });
    }
  }

  return questions;
}

// // Helper function to parse generated questions
// function parseGeneratedQuestions(content, questionType) {
//   const questions = [];
//   const lines = content.split('\n').filter(line => line.trim());

//   if (questionType === 'mcq') {
//     // Parse MCQ format: Question|Option A|Option B|Option C|Option D|Correct Answer
//     lines.forEach((line, index) => {
//       const parts = line.split('|').map(p => p.trim());
//       if (parts.length >= 6) {
//         questions.push({
//           question: parts[0],
//           options: {
//             A: parts[1],
//             B: parts[2],
//             C: parts[3],
//             D: parts[4]
//           },
//           correctAnswer: parts[5],
//           type: 'mcq'
//         });
//       }
//     });
//   } else if (questionType === 'objective') {
//     // Parse objective format: Question|Answer
//     lines.forEach((line, index) => {
//       const parts = line.split('|').map(p => p.trim());
//       if (parts.length >= 2) {
//         questions.push({
//           question: parts[0],
//           answer: parts[1],
//           type: 'objective'
//         });
//       }
//     });
//   } else if (questionType === 'short' || questionType === 'long') {
//     // Parse short/long answer format: Question|Answer
//     lines.forEach((line, index) => {
//       const parts = line.split('|').map(p => p.trim());
//       if (parts.length >= 2) {
//         questions.push({
//           question: parts[0],
//           answer: parts[1],
//           type: questionType
//         });
//       }
//     });
//   }

//   return questions;
// }

app.post("/api/chat", async (req, res) => {
  const { message, conversation = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant.Respond clearly in plain text paragraphs.Avoid markdown formatting.",
          },
          ...conversation,
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // const aiResponse =
    //   response.data.choices?.[0]?.message?.content ||
    //   "Sorry, I couldn't generate a response right now.";

    if (!response.data.choices || response.data.choices.length === 0) {
      return res.json({
        response: "AI is temporarily unavailable. Please try again."
      });
    }



    const msg = response.data.choices?.[0]?.message;

    const aiResponse =
      msg?.content ||
      msg?.reasoning ||
      "Sorry, I couldn't generate a response right now.";

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Chat failed",
      details: error.message
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////
// app.post("/api/ai/generate-whole-paper", async (req, res) => {
//   const { syllabusText, headerDetails, paperStructure } = req.body;

//   if (!syllabusText || !paperStructure || paperStructure.length === 0) {
//     return res.status(400).json({ error: "Syllabus and paper structure are required" });
//   }

//   // Construct the prompt
//   const sectionDetails = paperStructure.map(section => {
//     const blooms = Array.isArray(section.bloomsLevel) ? section.bloomsLevel.join(", ") : section.bloomsLevel;
//     return `- Section: ${section.name}\n  - Type: ${section.questionType}\n  - Questions: ${section.numQuestions}\n  - Marks per Question: ${section.marksPerQuestion}\n  - Bloom's Level: ${blooms}`;
//   }).join("\n");


//   const systemPrompt = `
//     You are an expert academic question paper setter.
//     Generate a professional question paper and a comprehensive answer key based STRICTLY on the provided syllabus and structure.

//     OUTPUT FORMAT:
//     You must return a valid JSON object with the following structure:
//     {
//       "header": {
//         "institutionName": "${headerDetails?.collegeName || 'Institution Name'}",
//         "subject": "${headerDetails?.subjectName || 'Subject'}",
//         "grade": "${headerDetails?.year || 'Grade/Year'}",
//         "timeAllowed": "${headerDetails?.duration || 'Duration'}",
//         "totalMarks": ${paperStructure.reduce((sum, s) => sum + s.totalMarks, 0)},
//         "examTitle": "${headerDetails?.examName || 'Examination'}"
//       },
//       "sections": [
//         {
//           "title": "Section Name",
//           "questions": [
//             {
//               "id": "unique_id",
//               "text": "Question text",
//               "marks": number,
//               "bloomsLevel": "level",
//               "options": ["A", "B", "C", "D"] // Only for MCQ
//             }
//           ]
//         }
//       ],
//       "answerKey": [
//         {
//           "questionId": "unique_id",
//           "solution": "Detailed solution",
//           "markingScheme": "Key points for marking"
//         }
//       ]
//     }

//     RULES:
//     1. Follow the exact JSON structure. Do not include markdown formatting like \`\`\`json.
//     2. Ensure the total marks match the requirement.
//     3. Generate EXACTLY the number of questions requested for each section.
//     4. For MCQs, providing options is MANDATORY.
//     5. Content must be derived ONLY from the provided syllabus source material.
//   `;

//   const userPrompt = `
//     SOURCE MATERIAL (SYLLABUS):
//     "${syllabusText.substring(0, 15000)}" // Truncate to avoid token limits if necessary

//     EXAM CONFIGURATION:
//     - Subject: ${headerDetails?.subjectName}
//     - Total Marks: ${paperStructure.reduce((sum, s) => sum + s.totalMarks, 0)}

//     PAPER STRUCTURE REQUIREMENTS:
//     ${sectionDetails}

//     GENERATE THE JSON OUTPUT NOW.
//   `;

//   try {
//     const response = await axios.post(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         model: "openrouter/free", // using the free model as per existing code
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: userPrompt },
//         ],
//         temperature: 0.3,
//         response_format: { type: "json_object" } // Check if provider supports this, otherwise prompt handles it
//       },
//       {
//         headers: {
//           "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     let content = response.data.choices?.[0]?.message?.content || "{}";

//     // Clean up potential markdown code blocks
//     content = content.replace(/```json/g, "").replace(/```/g, "").trim();

//     const parsed = JSON.parse(content);
//     res.json(parsed);

//   } catch (error) {
//     console.error("AI Generation Error:", error.response?.data || error.message);
//     // Fallback or error response
//     res.status(500).json({ error: "Failed to generate paper", details: error.message });
//   }
// });

//////////////////////////////////////////////////////////////////////////////////////

app.post("/api/ai/generate-whole-paper", async (req, res) => {
  const { syllabusText, headerDetails, paperStructure } = req.body;

  if (!syllabusText || !paperStructure || paperStructure.length === 0) {
    return res.status(400).json({ error: "Syllabus and paper structure are required" });
  }

  // Construct the prompt
  // 1. Flatten the structure for the prompt
  const structureDescription = paperStructure.map((section, idx) => {
    const blooms = Array.isArray(section.bloomsLevel) ? section.bloomsLevel.join(", ") : section.bloomsLevel;
    return `
    SECTION ${idx + 1}: ${section.name}
    - Question Type: ${section.questionType}
    - Number of Questions: ${section.numQuestions}
    - Answer Any: ${section.answerAny || section.numQuestions}
    - Marks per Question: ${section.marksPerQuestion}
    - Total Marks for Section: ${section.totalMarks}
    - Cognitive Levels (Bloom's): ${blooms}
    `.trim();
  }).join("\n\n");

  const totalPaperMarks = paperStructure.reduce((sum, s) => sum + s.totalMarks, 0);

  const systemPrompt = `
You are an expert university-level question paper setter.

Your task is to generate a professional, realistic exam paper and a matching comprehensive answer key.

---------------------------------
QUESTION STYLE RULES (STRICT)
---------------------------------

General:
- Avoid repetitive "What is..." questions.
- Use varied verbs: Explain, Compare, Differentiate, Analyze, Design, Illustrate, Evaluate, Justify.
- Questions must be clear, unambiguous, and academically rigorous.
- Each question must be derived from the provided syllabus source material.

Bloom’s Level Guidance:
- remembering: Recall facts, definitions, basic concepts (e.g., Define, List).
- understanding: Explain ideas or concepts (e.g., Describe, Summarize).
- applying: Use information in new situations (e.g., Solve, Demonstrate, Use).
- analyzing: Draw connections among ideas (e.g., Differentiate, Organize, Contrast).
- evaluating: Justify a stand or decision (e.g., Support, Critically evaluate).
- creating: Produce new or original work (e.g., Design, Propose, Develop).

---------------------------------
QUESTION TYPE RULES
---------------------------------

1. MCQ:
- Exactly 4 options (A, B, C, D).
- Options must be plausible, not obvious.
- "All of the above" or "None of the above" should be used sparingly.

2. objective:
- Can be True/False, Fill in the blanks, or One-word answers.
- MUST provide the correct answer string clearly.
- Short and precise.

3. short:
- Concept-focused.
- Answer length: 30–60 words.

4. long:
- Comprehensive/Analytical.
- Answer length: 120–180 words.

---------------------------------
OUTPUT FORMAT (STRICT JSON)
---------------------------------
You must return only the JSON object. Do not include markdown code blocks.

{
  "header": {
    "institutionName": "string",
    "subject": "string",
    "grade": "string",
    "timeAllowed": "string",
    "totalMarks": number,
    "examTitle": "string"
  },
  "sections": [
    {
      "title": "Section Name",
      "questions": [
        {
          "id": "q1",
          "text": "Question text",
          "marks": number,
          "bloomsLevel": "string",
          "options": ["Option A", "Option B", "Option C", "Option D"] // ONLY for mcq
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionId": "q1",
      "answer": "A", // ONLY for mcq
      "solution": "Detailed solution text", // Solution for all types
      "markingScheme": "Key points for marks" // Optional
    }
  ]
}
`;

  const userPrompt = `
    ### EXAM CONFIGURATION
    - Institution: ${headerDetails?.collegeName || "N/A"}
    - Exam: ${headerDetails?.examName || "N/A"}
    - Subject: ${headerDetails?.subjectName || "N/A"}
    - Grade/Year: ${headerDetails?.year || "N/A"}
    - Duration: ${headerDetails?.duration || "N/A"}
    - Total Marks: ${totalPaperMarks}

    ### PAPER STRUCTURE REQUIREMENTS
    ${structureDescription}

    ### SOURCE MATERIAL (SYLLABUS)
    ${syllabusText.substring(0, 20000)}

    Generate the question paper in JSON format now.
  `;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free", // Keeping the model as used in other endpoints
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        // response_format: { type: "json_object" } // OpenRouter/DeepSeek sometimes ignores this, but effective prompting helps
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let content = response.data.choices?.[0]?.message?.content || "{}";

    // Log raw content for debugging
    console.log("AI Raw Output:", content.substring(0, 100) + "...");

    // Remove <think>...</think> blocks (DeepSeek reasoning)
    content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // Robust JSON extraction helper
    const tryParseJSON = (str) => {
      // Find FIRST '{' and LAST '}'
      const first = str.indexOf('{');
      const last = str.lastIndexOf('}');
      if (first === -1) return null;

      let candidate = str.substring(first, last !== -1 ? last + 1 : str.length);

      // Basic truncation repair: If it ends abruptly, try closing brackets
      if (last === -1 || last < first) {
        let openBraces = (candidate.match(/\{/g) || []).length;
        let closeBraces = (candidate.match(/\}/g) || []).length;
        let openBrackets = (candidate.match(/\[/g) || []).length;
        let closeBrackets = (candidate.match(/\]/g) || []).length;

        while (openBrackets > closeBrackets) { candidate += ']'; closeBrackets++; }
        while (openBraces > closeBraces) { candidate += '}'; closeBraces++; }
      }

      try {
        return JSON.parse(candidate);
      } catch (e) {
        // One level deeper: try fixing common "trailing comma before closing" issues
        try {
          const fixedTrailing = candidate.replace(/,\s*[\]\}]/g, (m) => m.slice(-1));
          return JSON.parse(fixedTrailing);
        } catch (e2) {
          return null;
        }
      }
    };

    try {
      let parsed = tryParseJSON(content);

      if (!parsed) {
        throw new Error("Could not extract valid JSON from AI response.");
      }

      // Flatten if nested under 'content' or 'response'
      if (parsed.content && typeof parsed.content === "object" && !Array.isArray(parsed.content)) {
        parsed = parsed.content;
      } else if (parsed.response && typeof parsed.response === "object" && !Array.isArray(parsed.response)) {
        parsed = parsed.response;
      }

      // Ensure answerKey is an array (sometimes AI returns it as an object lookup)
      if (parsed.answerKey && typeof parsed.answerKey === "object" && !Array.isArray(parsed.answerKey)) {
        parsed.answerKey = Object.entries(parsed.answerKey).map(([id, val]) => ({
          questionId: id,
          ...(typeof val === "string" ? { solution: val } : val)
        }));
      }

      res.json(parsed);
    } catch (parseError) {
      const errorLog = `[${new Date().toISOString()}] JSON PARSE ERROR:\n${parseError.message}\nCONTENT:\n${content.substring(0, 2000)}\n----------------\n`;
      const fs = await import('fs');
      fs.appendFileSync('server_error.log', errorLog);

      console.error("JSON Parse Error:", parseError);
      res.status(500).json({ error: "AI returned invalid JSON", details: parseError.message });
    }

  } catch (error) {
    const errorLog = `[${new Date().toISOString()}] API ERROR:\n${error.message}\nRESPONSE DATA:\n${JSON.stringify(error.response?.data || {}, null, 2)}\n----------------\n`;
    const fs = await import('fs');
    fs.appendFileSync('server_error.log', errorLog);

    console.error("AI API Error:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.error?.message || error.message;
    res.status(500).json({ error: "Failed to generate paper", details: errorMessage });
  }
});

console.log("Starting server...");
console.log(`PORT: ${PORT}`);

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});

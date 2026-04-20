import axios from 'axios';

// Map field names to appropriate input types + metadata
const FIELD_MAP = [
    { keywords: ['email', 'e-mail'], type: 'email', placeholder: 'Enter your email address', required: true },
    { keywords: ['phone', 'mobile', 'contact number', 'contact no'], type: 'tel', placeholder: 'Enter your phone number', required: true },
    { keywords: ['age'], type: 'number', placeholder: 'Enter your age', required: true, validation: { min: 1, max: 120 } },
    { keywords: ['date of birth', 'dob', 'birth date', 'birthday'], type: 'date', placeholder: '', required: false },
    { keywords: ['date', 'deadline', 'schedule'], type: 'date', placeholder: '', required: false },
    { keywords: ['gender', 'sex'], type: 'radio', placeholder: '', required: true, options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }] },
    { keywords: ['address', 'location', 'residence'], type: 'textarea', placeholder: 'Enter your full address', required: false },
    { keywords: ['message', 'comment', 'feedback', 'note', 'description', 'remarks'], type: 'textarea', placeholder: 'Enter your message...', required: false },
    { keywords: ['occupation', 'profession', 'job', 'designation', 'role'], type: 'text', placeholder: 'Enter your occupation', required: false },
    { keywords: ['grade', 'class', 'standard', 'grade/class'], type: 'select', placeholder: '', required: true, options: [{ value: '1', label: 'Grade 1' }, { value: '2', label: 'Grade 2' }, { value: '3', label: 'Grade 3' }, { value: '4', label: 'Grade 4' }, { value: '5', label: 'Grade 5' }, { value: '6', label: 'Grade 6' }, { value: '7', label: 'Grade 7' }, { value: '8', label: 'Grade 8' }, { value: '9', label: 'Grade 9' }, { value: '10', label: 'Grade 10' }, { value: '11', label: 'Grade 11' }, { value: '12', label: 'Grade 12' }] },
    { keywords: ['school', 'college', 'institution', 'previous school', 'institute'], type: 'text', placeholder: 'Enter school/institution name', required: false },
    { keywords: ['subject', 'subjects', 'subjects opted', 'course'], type: 'checkbox', placeholder: '', required: false, options: [{ value: 'math', label: 'Mathematics' }, { value: 'science', label: 'Science' }, { value: 'english', label: 'English' }, { value: 'history', label: 'History' }, { value: 'geography', label: 'Geography' }, { value: 'computer', label: 'Computer Science' }, { value: 'arts', label: 'Arts' }, { value: 'physical_edu', label: 'Physical Education' }] },
    { keywords: ['rating', 'score', 'rank'], type: 'select', placeholder: '', required: false, options: [{ value: '1', label: '1 - Poor' }, { value: '2', label: '2 - Fair' }, { value: '3', label: '3 - Good' }, { value: '4', label: '4 - Very Good' }, { value: '5', label: '5 - Excellent' }] },
    { keywords: ['password'], type: 'text', placeholder: 'Enter password', required: true },
    { keywords: ['website', 'url', 'link'], type: 'text', placeholder: 'https://example.com', required: false },
    { keywords: ['name', 'full name', 'first name', 'last name', 'student name', 'parent name', 'guardian name'], type: 'text', placeholder: 'Enter full name', required: true },
    { keywords: ['number', 'quantity', 'count', 'amount'], type: 'number', placeholder: 'Enter a number', required: false },
];

/**
 * Infer the best question config from a raw field label
 */
const inferFieldConfig = (rawLabel) => {
    const lower = rawLabel.toLowerCase().trim();

    // Try longest-match first for accuracy
    const sortedMap = [...FIELD_MAP].sort((a, b) => {
        const aMax = Math.max(...a.keywords.map((k) => k.length));
        const bMax = Math.max(...b.keywords.map((k) => k.length));
        return bMax - aMax;
    });

    for (const entry of sortedMap) {
        if (entry.keywords.some((kw) => lower.includes(kw))) {
            return {
                type: entry.type,
                placeholder: entry.placeholder,
                required: entry.required,
                ...(entry.validation ? { validation: entry.validation } : {}),
                ...(entry.options ? { options: entry.options } : { options: [] }),
            };
        }
    }

    // Generic text fallback
    return { type: 'text', placeholder: `Enter ${rawLabel.toLowerCase()}`, required: false, options: [] };
};

/**
 * Parse a multi-line, multi-section form description.
 * Handles inputs like:
 *   Section Title
 *   Field 1
 *   Field 2
 */
const parseStructuredDescription = (description) => {
    const lines = description
        .split(/[\n,]+/)
        .map((l) => l.trim())
        .filter(Boolean);

    // Heuristic: a "section header" line has no common field keywords
    //   and usually appears before a group of field lines.
    const isLikelySectionHeader = (line) => {
        const lower = line.toLowerCase();
        // Section headers tend to end with "Information", "Details", "Section", etc.
        // or are short and don't match known field patterns
        const sectionTokens = ['information', 'details', 'section', 'data', 'profile'];
        if (sectionTokens.some((t) => lower.includes(t))) return true;
        // If it also matches as a field keyword, prefer treating it as a field
        return false;
    };

    const questions = [];
    let order = 0;

    // Detect if the first line looks like a form title
    let titleFromInput = '';
    let startIdx = 0;
    if (lines.length > 0) {
        const firstLower = lines[0].toLowerCase();
        // If first line contains "form" or looks very title-like (no common field keywords) use as title
        if (firstLower.includes('form') || firstLower.includes('registration') || firstLower.includes('survey') || firstLower.includes('application')) {
            titleFromInput = lines[0];
            startIdx = 1;
        }
    }

    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        if (isLikelySectionHeader(line)) {
            // Add a visual separator as a disabled "section" field
            questions.push({
                questionId: `q_section_${Date.now()}_${i}`,
                type: 'section',
                label: line,
                placeholder: '',
                required: false,
                options: [],
                order: order++,
            });
        } else {
            const config = inferFieldConfig(line);
            questions.push({
                questionId: `q_${Date.now()}_${i}`,
                type: config.type,
                label: line,
                placeholder: config.placeholder,
                required: config.required,
                options: config.options || [],
                ...(config.validation ? { validation: config.validation } : {}),
                order: order++,
            });
        }
    }

    return {
        title: titleFromInput || 'Generated Form',
        description: 'Auto-generated form based on your description',
        questions,
    };
};

// AI service to generate form from description
export const generateFormFromDescription = async (description) => {
    try {
        // If no OpenAI key, use smart structured parser
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            return parseStructuredDescription(description);
        }

        const prompt = `You are an expert form builder AI. Based on the following description, generate a complete form structure in JSON format.

Description: "${description}"

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Clear form title",
  "description": "Brief form description",
  "questions": [
    {
      "type": "text | email | tel | number | textarea | radio | checkbox | select | date | section",
      "label": "Question or section title",
      "placeholder": "Helpful placeholder",
      "required": true/false,
      "options": [{"value": "opt_1", "label": "Option 1"}]
    }
  ]
}

Rules:
- Use type "section" for group headers (e.g., "Student Details", "Academic Information") — these act as visual dividers with no input.
- Use "radio" for Gender (Male/Female/Other), "select" for Grade/Class, "checkbox" for Subjects Opted.
- Use "tel" for phone/contact numbers, "email" for email fields.
- Use "textarea" for address, message, comments.
- Include all fields and sections from the description preserving their order.
- Do not include markdown or extra text. Return raw JSON only.`;

        const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
        const response = await axios.post(
            `${baseUrl}/chat/completions`,
            {
                model: process.env.OPENAI_MODEL || 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that generates form structures in JSON format.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.5,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const text = response.data.choices[0].message.content.trim();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error('No JSON in response');

        const formObject = JSON.parse(text.substring(start, end + 1));
        if (!Array.isArray(formObject.questions)) throw new Error('Invalid questions array');

        return formObject;
    } catch (error) {
        console.error('AI generation error:', error.response?.data || error.message);
        // Fallback to smart structured parser
        return parseStructuredDescription(description);
    }
};

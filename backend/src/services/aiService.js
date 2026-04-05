import axios from 'axios';

// AI service to generate form from description
export const generateFormFromDescription = async (description) => {
    try {
        const prompt = `You are an expert form builder AI. Based on the following description, generate a complete form structure in JSON format, including a relevant title, a short description, and an array of appropriate questions (fields) with types, validation rules, and placeholders.

Description: "${description}"

Return ONLY a valid JSON object matching this exact structure:
{
  "title": "Clear, concise form title",
  "description": "Helpful form description or instructions",
  "questions": [
    {
      "type": "text | email | tel | number | textarea | radio | checkbox | select | date",
      "label": "clear question text",
      "placeholder": "helpful placeholder text",
      "required": true/false,
      "validation": { "pattern": "regex", "minLength": 0, "maxLength": 100, "min": 0, "max": 100, "errorMessage": "msg" },
      "options": [
        {"value": "option_1", "label": "Option 1"}
      ]
    }
  ]
}

Common patterns:
- Email fields: type "email" with email pattern
- Phone fields: type "tel" with phone pattern
- Name fields: type "text"
- Age/quantity: type "number"
- Long responses: type "textarea"
- Multiple choice: type "radio", "checkbox", or "select"

Do not include any Markdown formatting blocks (\`\`\`json) or extra text outside the JSON object. Just return the raw JSON object starting with { and ending with }.`;

        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            // Fallback: Generate basic form based on common keywords
            return generateFallbackForm(description);
        }

        const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
        const response = await axios.post(
            `${baseUrl}/chat/completions`,
            {
                model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that generates form structures in JSON format.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1500,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const generatedText = response.data.choices[0].message.content.trim();

        // Use Regex to find the first '{' and last '}' to extract the JSON object robustly
        const startIndex = generatedText.indexOf('{');
        const endIndex = generatedText.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1) {
            throw new Error('No JSON object found in the response');
        }

        const jsonText = generatedText.substring(startIndex, endIndex + 1);
        const formObject = JSON.parse(jsonText);
        
        // Ensure it has questions array
        if (!formObject.questions || !Array.isArray(formObject.questions)) {
            throw new Error('Parsed JSON does not contain a valid questions array');
        }
        
        return formObject;
    } catch (error) {
        console.error('AI generation error details:', error.response?.data || error.message);
        console.error('Full response text that failed parsing:', error.generatedText || 'N/A');

        // Fallback to basic form generation
        return generateFallbackForm(description);
    }
};

// Fallback form generation based on keywords
const generateFallbackForm = (description) => {
    const lowerDesc = description.toLowerCase();
    const questions = [];

    // Common field patterns
    if (lowerDesc.includes('name')) {
        questions.push({
            type: 'text',
            label: 'Full Name',
            placeholder: 'Enter your full name',
            required: true,
            validation: {
                minLength: 2,
                maxLength: 100,
                errorMessage: 'Name must be between 2 and 100 characters',
            },
        });
    }

    if (lowerDesc.includes('email')) {
        questions.push({
            type: 'email',
            label: 'Email Address',
            placeholder: 'your.email@example.com',
            required: true,
            validation: {
                pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                errorMessage: 'Please enter a valid email address',
            },
        });
    }

    if (lowerDesc.includes('phone') || lowerDesc.includes('mobile') || lowerDesc.includes('contact')) {
        questions.push({
            type: 'tel',
            label: 'Phone Number',
            placeholder: '+1 (555) 000-0000',
            required: true,
            validation: {
                pattern: '^[+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,9}$',
                errorMessage: 'Please enter a valid phone number',
            },
        });
    }

    if (lowerDesc.includes('age')) {
        questions.push({
            type: 'number',
            label: 'Age',
            placeholder: 'Enter your age',
            required: true,
            validation: {
                min: 1,
                max: 120,
                errorMessage: 'Age must be between 1 and 120',
            },
        });
    }

    if (lowerDesc.includes('address')) {
        questions.push({
            type: 'textarea',
            label: 'Address',
            placeholder: 'Enter your full address',
            required: false,
            validation: {
                maxLength: 500,
            },
        });
    }

    if (lowerDesc.includes('message') || lowerDesc.includes('comment') || lowerDesc.includes('feedback')) {
        questions.push({
            type: 'textarea',
            label: 'Message',
            placeholder: 'Enter your message here...',
            required: false,
            validation: {
                maxLength: 1000,
            },
        });
    }

    if (lowerDesc.includes('date') || lowerDesc.includes('birth')) {
        questions.push({
            type: 'date',
            label: 'Date',
            placeholder: '',
            required: false,
        });
    }

    // If no fields were generated, add a generic text field
    if (questions.length === 0) {
        questions.push({
            type: 'text',
            label: 'Response',
            placeholder: 'Enter your response',
            required: true,
        });
    }

    return {
        title: 'Generated Form',
        description: 'Auto-generated form based on description',
        questions: questions
    };
};

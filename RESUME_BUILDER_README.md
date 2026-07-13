# AI Resume Builder - Setup Instructions

## Quick Start

### 1. Install Required Dependencies

```bash
pip install PyPDF2 PyMuPDF
```

`PyMuPDF` (fitz) is highly recommended for better PDF text extraction in the ATS Checker.

### 2. Initialize Database

Run the database initialization script:

```bash
python init_resume_db.py
```

This will create the `ResumeData` table in your database.

### 3. Start the Application

```bash
python app.py
```

### 4. Access the Resume Builder

Navigate to:
- Main Resume Page: `http://localhost:5000/resume_template`
- Direct Builder: `http://localhost:5000/resume_builder`

### 5. Exporting to PDF
Click the **"Download Resume"** button. This will open the browser's print dialog. Select **"Save as PDF"** as the destination to get a perfectly formatted PDF of your resume.

## Features

### 🤖 AI-Powered Content Generation
- Professional summary generation
- Job description optimization
- Uses Gemini API for intelligent suggestions

### 📊 ATS Score Checker
- Upload existing resume (PDF/TXT)
- Get comprehensive ATS compatibility score
- Receive actionable improvement suggestions

### 💾 Data Persistence
- Auto-save resume data
- Load previous resumes
- Update and maintain multiple versions

### 👁️ Live Preview
- See changes in real-time
- Professional formatting
- Export-ready view

## Usage Tips

1. **Start with Personal Info**: Fill in your contact details first
2. **Use AI for Summary**: Let AI generate a professional summary
3. **Improve Descriptions**: Use the "Improve with AI" button on job descriptions
4. **Add Skills Strategically**: Include both technical and soft skills
5. **Check ATS Score**: Upload your final resume to verify ATS compatibility
6. **Save Regularly**: Click "Save Resume" to persist your progress

## Troubleshooting

### Database Issues
If you encounter database errors:
```bash
python init_resume_db.py
```

### AI Generation Not Working
Verify your Gemini API key is set in `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

### File Upload Issues
Ensure uploads directory exists:
```bash
mkdir -p uploads
```

## Architecture

```
Resume Builder
├── Backend (Flask)
│   ├── Routes (/resume_builder, /api/*)
│   ├── Database Model (ResumeData)
│   └── AI Integration (Gemini API)
├── Frontend
│   ├── HTML (templates/resume_builder.html)
│   ├── CSS (static/css/resume_builder.css)
│   └── JavaScript (static/js/resume_builder.js)
└── Features
    ├── Multi-step Form
    ├── AI Content Generation
    ├── ATS Checking
    ├── Live Preview
    └── Data Persistence
```

## API key note

Make sure your Gemini API key is properly configured. The app will use the key from the `.env` file or fall back to the default key in `app.py`.

## Next Steps

Consider implementing:
- PDF export functionality (using ReportLab or WeasyPrint)
- Multiple resume templates
- Resume versioning
- Email resume feature
- Print optimization

---

**Enjoy building your perfect resume! 🎉**

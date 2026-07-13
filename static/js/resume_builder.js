// Resume Builder JavaScript

document.addEventListener('DOMContentLoaded', function () {
    let resumeData = {
        personal_info: {},
        professional_summary: '',
        work_experience: [],
        education: [],
        skills: [],
        soft_skills: [],
        projects: [],
        certifications: []
    };

    // Load existing resume data if available
    loadResumeData();

    // Personal Information
    const personalFields = ['fullName', 'email', 'phone', 'location', 'linkedin', 'website'];
    personalFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function () {
                resumeData.personal_info[field] = this.value;
                updatePreview();
            });
        }
    });

    // Professional Summary
    const summaryTextarea = document.getElementById('professionalSummary');
    if (summaryTextarea) {
        summaryTextarea.addEventListener('input', function () {
            resumeData.professional_summary = this.value;
            updatePreview();
        });
    }

    // AI Summary Generation
    document.getElementById('generateSummary').addEventListener('click', function () {
        const aiInputs = document.getElementById('aiSummaryInputs');
        aiInputs.style.display = aiInputs.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('generateSummarySubmit').addEventListener('click', async function () {
        const targetRole = document.getElementById('targetRole').value;
        const yearsExp = document.getElementById('yearsExp').value;
        const industry = document.getElementById('industry').value;
        const skills = resumeData.skills || [];

        if (!targetRole) {
            alert('Please enter a target job role');
            return;
        }

        showLoading('Generating AI summary...');

        try {
            const response = await fetch('/api/generate_summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    job_role: targetRole,
                    years_experience: yearsExp,
                    skills: skills,
                    industry: industry
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                document.getElementById('professionalSummary').value = data.summary;
                resume_text = data.summary;
                resumeData.professional_summary = data.summary;
                updatePreview();
                document.getElementById('aiSummaryInputs').style.display = 'none';
            } else {
                alert('Error generating summary: ' + (data.message || 'Unknown error. Check console and API key.'));
            }
        } catch (error) {
            console.error('Summary generation error:', error);
            alert('Error generating summary: ' + error.message);
        } finally {
            hideLoading();
        }
    });

    // Work Experience
    let experienceCounter = 0;
    function createExperienceEntry(data = null) {
        const container = document.getElementById('experienceContainer');
        const entryId = 'exp-' + experienceCounter++;

        const entry = document.createElement('div');
        entry.className = 'experience-entry fade-in';
        entry.id = entryId;
        entry.innerHTML = `
            <i class="fas fa-times remove-entry" onclick="removeEntry('${entryId}', 'experience')"></i>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Job Title *</label>
                    <input type="text" class="form-control exp-title" required value="${data ? data.title || '' : ''}">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Company *</label>
                    <input type="text" class="form-control exp-company" required value="${data ? data.company || '' : ''}">
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Start Date</label>
                    <input type="month" class="form-control exp-start" value="${data ? data.start_date || '' : ''}">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">End Date</label>
                    <input type="month" class="form-control exp-end" value="${data ? data.end_date || '' : ''}" ${data && data.current ? 'disabled' : ''}>
                    <div class="form-check mt-2">
                        <input class="form-check-input exp-current" type="checkbox" ${data && data.current ? 'checked' : ''}>
                        <label class="form-check-label">Currently working here</label>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Responsibilities</label>
                <button type="button" class="btn ai-improve-btn btn-sm float-end improve-desc-btn">
                    <i class="fas fa-magic me-1"></i>Improve with AI
                </button>
                <textarea class="form-control exp-desc" rows="4" 
                    placeholder="• Led development of key features&#10;• Improved system performance by 40%&#10;• Mentored junior developers">${data ? data.description || '' : ''}</textarea>
            </div>
        `;

        container.appendChild(entry);

        // Add listener for current checkbox to disable end date
        const currentCheckbox = entry.querySelector('.exp-current');
        const endDateInput = entry.querySelector('.exp-end');
        currentCheckbox.addEventListener('change', function () {
            endDateInput.disabled = this.checked;
            if (this.checked) endDateInput.value = '';
            collectExperienceData();
        });

        attachExperienceListeners(entry);
        return entry;
    }

    document.getElementById('addExperience').addEventListener('click', () => createExperienceEntry());

    function attachExperienceListeners(entry) {
        const inputs = entry.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', collectExperienceData);
        });

        // AI Improve Description
        const improveBtn = entry.querySelector('.improve-desc-btn');
        const descTextarea = entry.querySelector('.exp-desc');
        const titleInput = entry.querySelector('.exp-title');

        if (improveBtn) {
            improveBtn.addEventListener('click', async function () {
                const description = descTextarea.value;
                const jobTitle = titleInput.value;

                if (!description) {
                    alert('Please enter a job description first');
                    return;
                }

                showLoading('Improving description with AI...');

                try {
                    const response = await fetch('/api/improve_description', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            description: description,
                            job_title: jobTitle
                        })
                    });

                    const data = await response.json();

                    if (data.status === 'success') {
                        descTextarea.value = data.improved_description;
                        collectExperienceData();
                    } else {
                        alert('Error improving description: ' + (data.message || 'Unknown error. Check Gemini API key.'));
                    }
                } catch (error) {
                    console.error('Improvement error:', error);
                    alert('Error improving description: ' + error.message);
                } finally {
                    hideLoading();
                }
            });
        }
    }

    function collectExperienceData() {
        const entries = document.querySelectorAll('.experience-entry');
        resumeData.work_experience = [];

        entries.forEach(entry => {
            const exp = {
                title: entry.querySelector('.exp-title').value,
                company: entry.querySelector('.exp-company').value,
                start_date: entry.querySelector('.exp-start').value,
                end_date: entry.querySelector('.exp-end').value,
                current: entry.querySelector('.exp-current').checked,
                description: entry.querySelector('.exp-desc').value
            };
            resumeData.work_experience.push(exp);
        });

        updatePreview();
    }

    // Education
    let educationCounter = 0;
    function createEducationEntry(data = null) {
        const container = document.getElementById('educationContainer');
        const entryId = 'edu-' + educationCounter++;

        const entry = document.createElement('div');
        entry.className = 'education-entry fade-in';
        entry.id = entryId;
        entry.innerHTML = `
            <i class="fas fa-times remove-entry" onclick="removeEntry('${entryId}', 'education')"></i>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Degree *</label>
                    <input type="text" class="form-control edu-degree" placeholder="Bachelor of Science" required value="${data ? data.degree || '' : ''}">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Field of Study *</label>
                    <input type="text" class="form-control edu-field" placeholder="Computer Science" required value="${data ? data.field || '' : ''}">
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">School/University *</label>
                    <input type="text" class="form-control edu-school" required value="${data ? data.school || '' : ''}">
                </div>
                <div class="col-md-3 mb-3">
                    <label class="form-label">Graduation Year</label>
                    <input type="number" class="form-control edu-year" min="1950" max="2030" value="${data ? data.year || '' : ''}">
                </div>
                <div class="col-md-3 mb-3">
                    <label class="form-label">GPA (Optional)</label>
                    <input type="text" class="form-control edu-gpa" placeholder="3.8/4.0" value="${data ? data.gpa || '' : ''}">
                </div>
            </div>
        `;

        container.appendChild(entry);
        attachEducationListeners(entry);
        return entry;
    }

    document.getElementById('addEducation').addEventListener('click', () => createEducationEntry());

    function attachEducationListeners(entry) {
        const inputs = entry.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', collectEducationData);
        });
    }

    function collectEducationData() {
        const entries = document.querySelectorAll('.education-entry');
        resumeData.education = [];

        entries.forEach(entry => {
            const edu = {
                degree: entry.querySelector('.edu-degree').value,
                field: entry.querySelector('.edu-field').value,
                school: entry.querySelector('.edu-school').value,
                year: entry.querySelector('.edu-year').value,
                gpa: entry.querySelector('.edu-gpa').value
            };
            resumeData.education.push(edu);
        });

        updatePreview();
    }

    // Skills
    const skillInput = document.getElementById('skillInput');
    const skillsContainer = document.getElementById('skillsContainer');

    skillInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && this.value.trim()) {
            e.preventDefault();
            addSkill(this.value.trim(), 'skills');
            this.value = '';
        }
    });

    const softSkillInput = document.getElementById('softSkillInput');
    const softSkillsContainer = document.getElementById('softSkillsContainer');

    softSkillInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && this.value.trim()) {
            e.preventDefault();
            addSkill(this.value.trim(), 'soft_skills');
            this.value = '';
        }
    });

    function addSkill(skill, type) {
        const container = type === 'skills' ? skillsContainer : softSkillsContainer;

        // Add to data if not already present
        if (!resumeData[type]) resumeData[type] = [];
        if (!resumeData[type].includes(skill)) {
            resumeData[type].push(skill);

            // Add to UI
            const badge = document.createElement('span');
            badge.className = 'skill-badge';
            badge.innerHTML = `
                ${skill}
                <i class="fas fa-times remove-skill" onclick="removeSkill(this, '${skill}', '${type}')"></i>
            `;
            container.appendChild(badge);
        }

        updatePreview();
    }

    window.removeSkill = function (element, skill, type) {
        // Remove from data
        resumeData[type] = resumeData[type].filter(s => s !== skill);

        // Remove from UI
        element.parentElement.remove();

        updatePreview();
    };

    window.removeEntry = function (entryId, type) {
        const element = document.getElementById(entryId);
        if (element) {
            element.remove();
            if (type === 'experience') {
                collectExperienceData();
            } else if (type === 'education') {
                collectEducationData();
            }
        }
    };

    // ATS Checker
    const atsFileInput = document.getElementById('atsFileInput');
    const uploadBox = document.getElementById('uploadBox');

    uploadBox.addEventListener('click', () => atsFileInput.click());

    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            atsFileInput.files = e.dataTransfer.files;
            processATSCheck(file);
        }
    });

    atsFileInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            processATSCheck(this.files[0]);
        }
    });

    async function processATSCheck(file) {
        showLoading('Analyzing resume for ATS compatibility...');

        const formData = new FormData();
        formData.append('resume_file', file);

        try {
            const response = await fetch('/api/check_ats', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.status === 'success') {
                displayATSResults(data.analysis);
            } else {
                alert('Error checking ATS: ' + (data.message || 'Unable to analyze resume. Ensure file is readable.'));
            }
        } catch (error) {
            console.error('ATS check error:', error);
            alert('Error checking ATS: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    function displayATSResults(analysis) {
        const resultsDiv = document.getElementById('atsResults');
        resultsDiv.style.display = 'block';

        // Update overall score
        document.getElementById('overallScore').textContent = analysis.scores.overall_score;

        // Update individual scores
        const scores = analysis.scores;
        updateScoreBar('keyword', scores.keyword_optimization);
        updateScoreBar('format', scores.format_compatibility);
        updateScoreBar('section', scores.section_completeness);
        updateScoreBar('contact', scores.contact_information);

        // Display suggestions
        const suggestionsList = document.getElementById('suggestionsList');
        suggestionsList.innerHTML = '';
        analysis.suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            suggestionsList.appendChild(li);
        });
    }

    function updateScoreBar(type, score) {
        document.getElementById(type + 'Score').textContent = score + '%';
        const bar = document.getElementById(type + 'Bar');
        setTimeout(() => {
            bar.style.width = score + '%';
        }, 100);
    }

    // Preview Update
    function updatePreview() {
        // Personal Info
        const name = resumeData.personal_info.fullName || 'Your Name';
        document.getElementById('preview-name').textContent = name;

        document.getElementById('preview-email').textContent = resumeData.personal_info.email || '';
        document.getElementById('preview-phone').textContent = resumeData.personal_info.phone || '';
        document.getElementById('preview-location').textContent = resumeData.personal_info.location || '';

        // Professional Summary
        const summarySection = document.getElementById('preview-summary');
        if (resumeData.professional_summary) {
            summarySection.style.display = 'block';
            document.getElementById('preview-summary-text').textContent = resumeData.professional_summary;
        } else {
            summarySection.style.display = 'none';
        }

        // Work Experience
        const expSection = document.getElementById('preview-experience');
        const expList = document.getElementById('preview-experience-list');
        if (resumeData.work_experience && resumeData.work_experience.length > 0) {
            expSection.style.display = 'block';
            expList.innerHTML = '';

            resumeData.work_experience.forEach(exp => {
                if (exp.title || exp.company) {
                    const div = document.createElement('div');
                    div.className = 'preview-exp-item';

                    const endDate = exp.current ? 'Present' : exp.end_date || '';
                    const dateRange = exp.start_date || endDate ?
                        `${exp.start_date || ''} - ${endDate}` : '';

                    div.innerHTML = `
                        <h6>${exp.title}</h6>
                        <div class="company">${exp.company}</div>
                        ${dateRange ? `<div class="date">${dateRange}</div>` : ''}
                        ${exp.description ? `<div>${exp.description.split('\n').filter(l => l.trim()).map(line =>
                        `<div>• ${line.replace(/^[•\-\*]\s*/, '')}</div>`
                    ).join('')}</div>` : ''}
                    `;
                    expList.appendChild(div);
                }
            });
        } else {
            expSection.style.display = 'none';
        }

        // Education
        const eduSection = document.getElementById('preview-education');
        const eduList = document.getElementById('preview-education-list');
        if (resumeData.education && resumeData.education.length > 0) {
            eduSection.style.display = 'block';
            eduList.innerHTML = '';

            resumeData.education.forEach(edu => {
                if (edu.degree || edu.school) {
                    const div = document.createElement('div');
                    div.className = 'preview-edu-item';
                    div.innerHTML = `
                        <h6>${edu.degree}${edu.field ? ' in ' + edu.field : ''}</h6>
                        <div class="school">${edu.school}</div>
                        ${edu.year || edu.gpa ? `<div class="date">${edu.year || ''}${edu.gpa ? ' • GPA: ' + edu.gpa : ''}</div>` : ''}
                    `;
                    eduList.appendChild(div);
                }
            });
        } else {
            eduSection.style.display = 'none';
        }

        // Skills
        const skillsSection = document.getElementById('preview-skills');
        const skillsList = document.getElementById('preview-skills-list');
        const allSkills = [...(resumeData.skills || []), ...(resumeData.soft_skills || [])];

        if (allSkills.length > 0) {
            skillsSection.style.display = 'block';
            skillsList.innerHTML = '';

            allSkills.forEach(skill => {
                const span = document.createElement('span');
                span.className = 'preview-skill';
                span.textContent = skill;
                skillsList.appendChild(span);
            });
        } else {
            skillsSection.style.display = 'none';
        }
    }

    // Save Resume
    document.getElementById('saveResume').addEventListener('click', async function () {
        showLoading('Saving resume...');

        try {
            const response = await fetch('/api/save_resume_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resumeData)
            });

            const data = await response.json();

            if (data.status === 'success') {
                setTimeout(() => {
                    alert('Resume saved successfully!');
                }, 500);
            } else {
                setTimeout(() => {
                    alert('Error saving resume: ' + (data.message || 'Database error.'));
                }, 500);
            }
        } catch (error) {
            console.error('Save error:', error);
            setTimeout(() => {
                alert('Error saving resume: ' + error.message);
            }, 500);
        } finally {
            hideLoading();
        }
    });

    // Download PDF (implemented using browser print)
    document.getElementById('downloadPDF').addEventListener('click', function () {
        // Trigger print dialog
        window.print();
    });

    // Load existing resume data
    async function loadResumeData() {
        try {
            const response = await fetch('/api/get_resume_data');
            const data = await response.json();

            if (data.status === 'success' && data.data) {
                resumeData = { ...resumeData, ...data.data };
                populateForm();
                updatePreview();
            }
        } catch (error) {
            console.error('Error loading resume data:', error);
        }
    }

    function populateForm() {
        // Populate personal info
        if (resumeData.personal_info) {
            Object.keys(resumeData.personal_info).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = resumeData.personal_info[key];
                }
            });
        }

        // Populate summary
        if (resumeData.professional_summary) {
            const summaryEl = document.getElementById('professionalSummary');
            if (summaryEl) summaryEl.value = resumeData.professional_summary;
        }

        // Populate work experience
        if (resumeData.work_experience && Array.isArray(resumeData.work_experience)) {
            const container = document.getElementById('experienceContainer');
            container.innerHTML = '';
            resumeData.work_experience.forEach(exp => {
                createExperienceEntry(exp);
            });
        }

        // Populate education
        if (resumeData.education && Array.isArray(resumeData.education)) {
            const container = document.getElementById('educationContainer');
            container.innerHTML = '';
            resumeData.education.forEach(edu => {
                createEducationEntry(edu);
            });
        }

        // Populate skills
        if (resumeData.skills && Array.isArray(resumeData.skills)) {
            skillsContainer.innerHTML = '';
            const techSkills = [...resumeData.skills];
            resumeData.skills = []; // Avoid duplicates in addSkill
            techSkills.forEach(skill => {
                addSkill(skill, 'skills');
            });
        }

        if (resumeData.soft_skills && Array.isArray(resumeData.soft_skills)) {
            softSkillsContainer.innerHTML = '';
            const softSkills = [...resumeData.soft_skills];
            resumeData.soft_skills = []; // Avoid duplicates in addSkill
            softSkills.forEach(skill => {
                addSkill(skill, 'soft_skills');
            });
        }
    }

    // Loading Modal Functions
    let loadingModalInstance = null;
    function showLoading(message) {
        const modalElement = document.getElementById('loadingModal');
        if (!modalElement) return;

        const messageEl = document.getElementById('loadingMessage');
        if (messageEl) messageEl.textContent = message;

        if (!loadingModalInstance) {
            loadingModalInstance = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
        }
        loadingModalInstance.show();
    }

    function hideLoading() {
        if (loadingModalInstance) {
            // Use a small delay to ensure modal is shown before trying to hide it
            // which prevents Bootstrap race condition hangs
            setTimeout(() => {
                loadingModalInstance.hide();
                // Clean up backdrop manually if it sticks
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                document.body.classList.remove('modal-open');
                document.body.style.paddingRight = '';
            }, 500);
        }
    }
});

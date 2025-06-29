import React, { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef
import { Upload, Plus, Trash2, Download, Sparkles, Save, FileText, User } from 'lucide-react';

const ResumeEditor = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [savedResumes, setSavedResumes] = useState([]); // Initialized as an empty array
  const [currentResume, setCurrentResume] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    customSections: []
  });
  const [enhancing, setEnhancing] = useState({});
  const [useMockAI, setUseMockAI] = useState(false); // Add this line to define useMockAI and setUseMockAI
  const fileInputRef = useRef();

  // New useEffect hook to load saved resumes on component mount
  useEffect(() => {
    const fetchSavedResumes = async () => {
      try {
        const response = await fetch('http://localhost:8000/resumes'); // Call your backend endpoint
        if (response.ok) {
          const data = await response.json();
          // Ensure data.resumes is an array before setting state
          setSavedResumes(Array.isArray(data.resumes) ? data.resumes : []);
        } else {
          console.error('Failed to fetch saved resumes:', response.statusText);
          // It's good practice to also clear/reset savedResumes on error
          setSavedResumes([]);
        }
      } catch (error) {
        console.error('Error fetching saved resumes:', error);
        // Clear/reset savedResumes on network error as well
        setSavedResumes([]);
      }
    };

    fetchSavedResumes();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      // Mock parsing - in real app, you'd parse the file
      const mockParsedData = {
        personalInfo: {
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          summary: 'Experienced software developer with 5+ years in full-stack development.'
        },
        experience: [
          {
            id: 1,
            title: 'Senior Software Developer',
            company: 'Tech Corp',
            duration: '2021 - Present',
            description: 'Led development of web applications using React and Node.js.'
          }
        ],
        education: [
          {
            id: 1,
            degree: 'Bachelor of Science in Computer Science',
            institution: 'University of Technology',
            year: '2019'
          }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
        customSections: [
          {
            id: 1,
            title: 'Certifications',
            type: 'list',
            items: ['AWS Certified Developer', 'Google Cloud Professional']
          }
        ]
      };
      setCurrentResume(mockParsedData);
    }
  };

  const handlePersonalInfoChange = (field, value) => {
    setCurrentResume(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      title: '',
      company: '',
      duration: '',
      description: ''
    };
    setCurrentResume(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id, field, value) => {
    setCurrentResume(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setCurrentResume(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      degree: '',
      institution: '',
      year: ''
    };
    setCurrentResume(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id, field, value) => {
    setCurrentResume(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setCurrentResume(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    setCurrentResume(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const updateSkill = (index, value) => {
    setCurrentResume(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const removeSkill = (index) => {
    setCurrentResume(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addCustomSection = () => {
    const newSection = {
      id: Date.now(),
      title: '',
      type: 'text', // 'text', 'list', or 'entries'
      content: '',
      items: [],
      entries: []
    };
    setCurrentResume(prev => ({
      ...prev,
      customSections: [...prev.customSections, newSection]
    }));
  };

  const updateCustomSection = (id, field, value) => {
    setCurrentResume(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === id ? { ...section, [field]: value } : section
      )
    }));
  };

  const removeCustomSection = (id) => {
    setCurrentResume(prev => ({
      ...prev,
      customSections: prev.customSections.filter(section => section.id !== id)
    }));
  };

  const addCustomSectionItem = (sectionId) => {
    setCurrentResume(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === sectionId 
          ? { ...section, items: [...section.items, ''] }
          : section
      )
    }));
  };

  const updateCustomSectionItem = (sectionId, itemIndex, value) => {
    setCurrentResume(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              items: section.items.map((item, i) => i === itemIndex ? value : item)
            }
          : section
      )
    }));
  };

  const removeCustomSectionItem = (sectionId, itemIndex) => {
    setCurrentResume(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              items: section.items.filter((_, i) => i !== itemIndex)
            }
          : section
      )
    }));
  };

  const addCustomSectionEntry = (sectionId) => {
    const newEntry = {
      id: Date.now(),
      title: '',
      subtitle: '',
      description: ''
    };
    setCurrentResume(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === sectionId 
          ? { ...section, entries: [...section.entries, newEntry] }
          : section
      )
    }));
  };

  const updateCustomSectionEntry = (sectionId, entryId, field, value) => {
    setCurrentResume(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              entries: section.entries.map(entry => 
                entry.id === entryId ? { ...entry, [field]: value } : entry
              )
            }
          : section
      )
    }));
  };

  const removeCustomSectionEntry = (sectionId, entryId) => {
    setCurrentResume(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              entries: section.entries.filter(entry => entry.id !== entryId)
            }
          : section
      )
    }));
  };

  const enhanceWithAI = async (section, content) => {
    setEnhancing(prev => ({ ...prev, [section]: true }));
    
    // Construct the URL with the use_mock query parameter
    const apiUrl = `http://localhost:8000/ai-enhance?use_mock=${useMockAI}`;

    try {
      const response = await fetch(apiUrl, { // Use the constructed URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ section, content })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to enhance content with AI');
      }

      const result = await response.json();
      
      if (section === 'summary') {
        handlePersonalInfoChange('summary', result.enhanced_content);
      } else if (section.startsWith('experience-')) {
        const expId = parseInt(section.split('-')[1]);
        updateExperience(expId, 'description', result.enhanced_content);
      } else if (section.startsWith('custom-')) {
        const customId = parseInt(section.split('-')[1]);
        updateCustomSection(customId, 'content', result.enhanced_content);
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      alert(`AI Enhancement Error: ${error.message}`); // Show error to user
    } finally {
      setEnhancing(prev => ({ ...prev, [section]: false }));
    }
  };

  const saveResume = async () => {
    try {
      const resumeData = {
        ...currentResume,
        timestamp: new Date().toISOString(),
      };
      
      const response = await fetch('http://localhost:8000/save-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData)
      });
      
      if (response.ok) {
        const result = await response.json();
        // Add the resume with the ID assigned by the backend
        setSavedResumes(prev => [...prev, { ...resumeData, id: result.id, timestamp: result.timestamp }]);
        alert('Resume saved successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to save resume:', errorData);
        alert(`Error saving resume: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Error saving resume');
    }
  };

  const downloadResume = () => {
    const dataStr = JSON.stringify(currentResume, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${currentResume.personalInfo.name || 'resume'}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const loadSavedResume = (resume) => {
    setCurrentResume(resume);
    setActiveTab('editor');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Resume Editor</h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'editor' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <FileText className="inline w-4 h-4 mr-2" />
              Editor
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'saved' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <User className="inline w-4 h-4 mr-2" />
              Saved Resumes ({savedResumes.length})
            </button>
          </div>
        </div>

        {activeTab === 'editor' && (
          <div className="max-w-4xl mx-auto">
            {/* AI Choice Toggle */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-end">
              <label htmlFor="mock-ai-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="mock-ai-toggle"
                    className="sr-only"
                    checked={useMockAI}
                    onChange={(e) => setUseMockAI(e.target.checked)}
                  />
                  <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  Use Mock AI <span className="text-sm text-gray-500">(for testing)</span>
                </div>
              </label>
              <style jsx>{`
                input:checked ~ .dot {
                  transform: translateX(100%);
                  background-color: #6366f1; /* Indigo 500 */
                }
                input:checked ~ .block {
                  background-color: #a78bfa; /* Violet 400 */
                }
              `}</style>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Upload Resume</h2>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload PDF or DOCX
              </button>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={currentResume.personalInfo.name}
                  onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={currentResume.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={currentResume.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={currentResume.personalInfo.location}
                  onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Professional Summary</label>
                  <button
                    onClick={() => enhanceWithAI('summary', currentResume.personalInfo.summary)}
                    disabled={enhancing.summary}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {enhancing.summary ? 'Enhancing...' : 'Enhance with AI'}
                  </button>
                </div>
                <textarea
                  placeholder="Write a brief professional summary..."
                  value={currentResume.personalInfo.summary}
                  onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24"
                />
              </div>
            </div>

            {/* Experience Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Experience</h2>
                <button
                  onClick={addExperience}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Experience
                </button>
              </div>
              {currentResume.experience.map((exp) => (
                <div key={exp.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g., 2021 - Present)"
                      value={exp.duration}
                      onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">Job Description</label>
                      <button
                        onClick={() => enhanceWithAI(`experience-${exp.id}`, exp.description)}
                        disabled={enhancing[`experience-${exp.id}`]}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4" />
                        {enhancing[`experience-${exp.id}`] ? 'Enhancing...' : 'Enhance with AI'}
                      </button>
                    </div>
                    <textarea
                      placeholder="Describe your responsibilities and achievements..."
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Education</h2>
                <button
                  onClick={addEducation}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Education
                </button>
              </div>
              {currentResume.education.map((edu) => (
                <div key={edu.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Year"
                        value={edu.year}
                        onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 flex-1"
                      />
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Skills</h2>
                <button
                  onClick={addSkill}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentResume.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Skill"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 flex-1"
                    />
                    <button
                      onClick={() => removeSkill(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Sections */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Custom Sections</h2>
                <button
                  onClick={addCustomSection}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
              </div>
              {currentResume.customSections.map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Section Title (e.g., Certifications, Projects, Awards)"
                          value={section.title}
                          onChange={(e) => updateCustomSection(section.id, 'title', e.target.value)}
                          className="border border-gray-300 rounded-lg px-4 py-2"
                        />
                        <select
                          value={section.type}
                          onChange={(e) => updateCustomSection(section.id, 'type', e.target.value)}
                          className="border border-gray-300 rounded-lg px-4 py-2"
                        >
                          <option value="text">Text Block</option>
                          <option value="list">Bullet List</option>
                          <option value="entries">Structured Entries</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCustomSection(section.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Text Block Type */}
                  {section.type === 'text' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">Content</label>
                        <button
                          onClick={() => enhanceWithAI(`custom-${section.id}`, section.content)}
                          disabled={enhancing[`custom-${section.id}`]}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4" />
                          {enhancing[`custom-${section.id}`] ? 'Enhancing...' : 'Enhance with AI'}
                        </button>
                      </div>
                      <textarea
                        placeholder="Enter section content..."
                        value={section.content || ''}
                        onChange={(e) => updateCustomSection(section.id, 'content', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24"
                      />
                    </div>
                  )}

                  {/* List Type */}
                  {section.type === 'list' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">List Items</label>
                        <button
                          onClick={() => addCustomSectionItem(section.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Item
                        </button>
                      </div>
                      {(section.items || []).map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="List item"
                            value={item}
                            onChange={(e) => updateCustomSectionItem(section.id, index, e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 flex-1"
                          />
                          <button
                            onClick={() => removeCustomSectionItem(section.id, index)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Structured Entries Type */}
                  {section.type === 'entries' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">Entries</label>
                        <button
                          onClick={() => addCustomSectionEntry(section.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Entry
                        </button>
                      </div>
                      {(section.entries || []).map((entry) => (
                        <div key={entry.id} className="border border-gray-200 rounded p-3 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Title (e.g., Project Name, Certification)"
                              value={entry.title}
                              onChange={(e) => updateCustomSectionEntry(section.id, entry.id, 'title', e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-2"
                            />
                            <input
                              type="text"
                              placeholder="Subtitle (e.g., Organization, Date)"
                              value={entry.subtitle}
                              onChange={(e) => updateCustomSectionEntry(section.id, entry.id, 'subtitle', e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-2"
                            />
                          </div>
                          <textarea
                            placeholder="Description..."
                            value={entry.description}
                            onChange={(e) => updateCustomSectionEntry(section.id, entry.id, 'description', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                          />
                          <button
                            onClick={() => removeCustomSectionEntry(section.id, entry.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {currentResume.customSections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No custom sections yet. Add sections like Certifications, Projects, Awards, or Languages.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={saveResume}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Resume
              </button>
              <button
                onClick={downloadResume}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download JSON
              </button>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Saved Resumes</h2>
            {savedResumes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">No saved resumes yet. Create and save your first resume!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {savedResumes.map((resume) => (
                  <div key={resume.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{resume.personalInfo.name || 'Untitled Resume'}</h3>
                        <p className="text-gray-600">{resume.personalInfo.email}</p>
                        <p className="text-sm text-gray-500">Saved: {new Date(resume.timestamp).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => loadSavedResume(resume)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Load Resume
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeEditor;
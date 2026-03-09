import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Project form
  const [projectForm, setProjectForm] = useState({
    id: null,
    title: '', 
    description: '', 
    tech: '', 
    image: '', 
    github: '', 
    live: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!isAdmin) return;
    try {
      const response = await axios.get(`${API_URL}/admin/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/admin/login`, adminForm);
      if(response.data.success) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminForm({ username: '', password: '' });
        await fetchMessages();
        setCurrentPage('admin');
      }
    } catch (error) {
      setLoginError('Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setShowProjectForm(false);
    setEditingId(null);
    setProjectForm({ id: null, title: '', description: '', tech: '', image: '', github: '', live: '' });
    setCurrentPage('home');
  };

  const handleAddProject = () => {
    setProjectForm({ id: null, title: '', description: '', tech: '', image: '', github: '', live: '' });
    setEditingId(null);
    setShowProjectForm(true);
  };

  const handleEditProject = (project) => {
    console.log('Editing project:', project);
    setProjectForm({
      id: project.id,
      title: project.title,
      description: project.description,
      tech: project.tech || '',
      image: project.image || '',
      github: project.github || '',
      live: project.live || ''
    });
    setEditingId(project.id);
    setShowProjectForm(true);
  };

  const handleCancelForm = () => {
    setShowProjectForm(false);
    setEditingId(null);
    setProjectForm({ id: null, title: '', description: '', tech: '', image: '', github: '', live: '' });
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectForm.title || !projectForm.description) {
      alert('Title and description are required');
      return;
    }
    
    setFormLoading(true);
    
    try {
      let response;
      
      if (editingId) {
        // UPDATE existing project
        console.log('Updating project with ID:', editingId);
        console.log('Update URL:', `${API_URL}/admin/projects/${editingId}`);
        console.log('Update data:', projectForm);
        
        response = await axios.put(`${API_URL}/admin/projects/${editingId}`, {
          title: projectForm.title,
          description: projectForm.description,
          tech: projectForm.tech,
          image: projectForm.image,
          github: projectForm.github,
          live: projectForm.live
        });
        
        console.log('Update response:', response.data);
        alert('Project updated successfully!');
      } else {
        // ADD new project
        response = await axios.post(`${API_URL}/admin/projects`, {
          title: projectForm.title,
          description: projectForm.description,
          tech: projectForm.tech,
          image: projectForm.image,
          github: projectForm.github,
          live: projectForm.live
        });
        
        console.log('Add response:', response.data);
        alert('Project added successfully!');
      }
      
      // Reset form and refresh projects
      setShowProjectForm(false);
      setEditingId(null);
      setProjectForm({ id: null, title: '', description: '', tech: '', image: '', github: '', live: '' });
      await fetchProjects(); // Wait for projects to refresh
      
    } catch (error) {
      console.error('Error saving project:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to save project';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 404) {
        errorMessage = 'Project not found. Please refresh the page and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.error || 'Invalid project data';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please check if backend is running.';
      }
      
      alert(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`${API_URL}/admin/projects/${id}`);
        alert('Project deleted successfully!');
        await fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Skill icons mapping
  const skillIcons = {
    'React.js': '⚛️',
    'Node.js': '🟢',
    'MySQL': '🗄️',
    'JavaScript': '📜',
    'HTML5': '🌐',
    'CSS3': '🎨',
    'Python': '🐍',
    'Java': '☕',
    'C++': '⚙️',
    'PHP': '🐘',
    'Express.js': '🚂',
    'Git': '📦'
  };

  // Contact icons
  const contactIcons = {
    github: '🐙',
    telegram: '💬',
    email: '📧',
    phone: '📱'
  };

  // STYLES
  const styles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#0B1120',
      color: '#E2E8F0',
      lineHeight: 1.6,
      minHeight: '100vh'
    },
    content: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '0 24px'
    },
    nav: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '24px 0',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    navLinks: {
      display: 'flex',
      gap: '32px',
      alignItems: 'center'
    },
    navLink: {
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      color: '#94A3B8',
      padding: '8px 16px',
      borderRadius: '30px',
      transition: 'all 0.3s ease'
    },
    adminLink: {
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      color: '#3B82F6',
      border: '1px solid #3B82F6',
      padding: '8px 20px',
      borderRadius: '30px',
      background: 'transparent',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
    },
    pageContainer: {
      padding: '48px 0 60px'
    },
    heroSection: {
      marginBottom: '64px',
      textAlign: 'center'
    },
    profileImage: {
      width: '180px',
      height: '180px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #3B82F6',
      boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
      marginBottom: '20px',
      transition: 'transform 0.3s ease, boxShadow 0.3s ease'
    },
    heroName: {
      fontSize: '48px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      color: '#FFFFFF',
      letterSpacing: '-0.5px',
      textShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
    },
    heroTitle: {
      fontSize: '22px',
      color: '#3B82F6',
      marginBottom: '20px',
      fontWeight: '500'
    },
    combinedTextBox: {
      background: 'linear-gradient(145deg, #1E293B, #0F172A)',
      padding: '35px 40px',
      borderRadius: '20px',
      maxWidth: '800px',
      margin: '0 auto 25px',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 30px rgba(59, 130, 246, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    },
    mainText: {
      fontSize: '20px',
      color: '#E2E8F0',
      lineHeight: '1.8',
      marginBottom: '20px',
      fontStyle: 'italic',
      fontWeight: '400'
    },
    quoteText: {
      fontSize: '20px',
      color: '#3B82F6',
      lineHeight: '1.8',
      fontStyle: 'italic',
      fontWeight: '600',
      borderTop: '1px solid rgba(59, 130, 246, 0.3)',
      paddingTop: '20px',
      marginTop: '10px'
    },
    highlight: {
      color: '#3B82F6',
      fontWeight: '700'
    },
    techPillInline: {
      display: 'inline-block',
      background: 'rgba(59, 130, 246, 0.2)',
      color: '#3B82F6',
      padding: '4px 12px',
      borderRadius: '30px',
      fontSize: '16px',
      margin: '0 4px',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    techStack: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: '28px'
    },
    techPill: {
      background: 'rgba(59, 130, 246, 0.1)',
      color: '#3B82F6',
      padding: '8px 20px',
      borderRadius: '30px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center'
    },
    primaryButton: {
      background: '#3B82F6',
      color: '#FFFFFF',
      border: 'none',
      padding: '12px 28px',
      fontSize: '15px',
      fontWeight: '600',
      borderRadius: '30px',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
    },
    sectionTitle: {
      fontSize: '30px',
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: '30px',
      position: 'relative',
      paddingBottom: '10px',
      borderBottom: '2px solid #3B82F6',
      display: 'inline-block',
      textShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
    },
    skillsSection: {
      marginTop: '50px',
      marginBottom: '50px'
    },
    skillsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '15px'
    },
    skillCard: {
      background: '#1E293B',
      padding: '15px 10px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease',
      cursor: 'default'
    },
    skillIcon: {
      fontSize: '28px',
      width: '40px',
      textAlign: 'center'
    },
    skillName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#E2E8F0'
    },
    projectsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '40px'
    },
    projectCard: {
      background: '#1E293B',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease'
    },
    projectImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
      background: '#0F172A'
    },
    projectImagePlaceholder: {
      width: '100%',
      height: '200px',
      background: 'linear-gradient(45deg, #1E293B, #0F172A)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      color: '#3B82F6',
      borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
    },
    projectContent: {
      padding: '20px'
    },
    projectTitle: {
      fontSize: '20px',
      fontWeight: '600',
      margin: '0 0 8px 0',
      color: '#FFFFFF'
    },
    projectTech: {
      fontSize: '14px',
      color: '#3B82F6',
      marginBottom: '12px',
      fontWeight: '500'
    },
    projectDesc: {
      fontSize: '14px',
      color: '#94A3B8',
      marginBottom: '16px',
      lineHeight: '1.6'
    },
    projectLinks: {
      display: 'flex',
      gap: '16px',
      marginBottom: '16px'
    },
    projectLink: {
      color: '#3B82F6',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      transition: 'all 0.3s ease'
    },
    adminActions: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px',
      borderTop: '1px solid rgba(59, 130, 246, 0.2)',
      paddingTop: '16px'
    },
    dangerButton: {
      background: '#EF4444',
      color: '#FFFFFF',
      border: 'none',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: '500',
      borderRadius: '30px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)'
    },
    editButton: {
      background: '#3B82F6',
      color: '#FFFFFF',
      border: 'none',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: '500',
      borderRadius: '30px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
      marginRight: '8px'
    },
    adminPanel: {
      background: '#1E293B',
      borderRadius: '12px',
      padding: '32px',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      marginBottom: '30px'
    },
    adminHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    },
    adminTitle: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#FFFFFF',
      margin: 0
    },
    addButton: {
      background: '#3B82F6',
      color: '#FFFFFF',
      border: 'none',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '600',
      borderRadius: '30px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
    },
    projectForm: {
      background: '#0F172A',
      padding: '24px',
      borderRadius: '10px',
      marginBottom: '30px',
      border: '1px solid rgba(59, 130, 246, 0.2)'
    },
    formTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: '16px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      color: '#94A3B8',
      marginBottom: '4px'
    },
    input: {
      width: '100%',
      padding: '12px',
      background: '#1E293B',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#FFFFFF',
      transition: 'all 0.3s ease'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      background: '#1E293B',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#FFFFFF',
      minHeight: '100px',
      transition: 'all 0.3s ease'
    },
    formButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    saveButton: {
      background: '#3B82F6',
      color: '#FFFFFF',
      border: 'none',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '600',
      borderRadius: '30px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
    },
    cancelButton: {
      background: '#334155',
      color: '#E2E8F0',
      border: 'none',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '600',
      borderRadius: '30px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    messagesSection: {
      marginTop: '40px'
    },
    messageCard: {
      background: '#0F172A',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px',
      border: '1px solid rgba(59, 130, 246, 0.1)'
    },
    adminLogin: {
      maxWidth: '360px',
      margin: '40px auto',
      padding: '32px',
      background: '#1E293B',
      borderRadius: '12px',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
    },
    errorMessage: {
      color: '#EF4444',
      marginBottom: '16px',
      fontSize: '13px'
    },
    contactContainer: {
      maxWidth: '700px',
      margin: '0 auto'
    },
    contactIntro: {
      fontSize: '18px',
      color: '#94A3B8',
      marginBottom: '32px',
      textAlign: 'center'
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px',
      marginBottom: '20px'
    },
    contactCard: {
      background: '#1E293B',
      padding: '20px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      textDecoration: 'none',
      color: '#E2E8F0',
      transition: 'all 0.3s ease'
    },
    contactIcon: {
      fontSize: '32px',
      width: '50px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '12px',
      color: '#3B82F6'
    },
    contactInfo: {
      flex: 1
    },
    contactLabel: {
      fontSize: '12px',
      color: '#94A3B8',
      marginBottom: '2px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    contactValue: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#FFFFFF'
    },
    footer: {
      padding: '32px 0',
      textAlign: 'center',
      color: '#64748B',
      fontSize: '14px',
      borderTop: '1px solid rgba(255,255,255,0.1)'
    }
  };

  // Home page
  const renderHome = () => (
    <div>
      <div style={styles.heroSection}>
        <img 
          src="/profile.jpg" 
          alt="Dagim Belayneh" 
          style={styles.profileImage}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.3)';
          }}
        />
        
        <h1 style={styles.heroName}>Dagim Belayneh</h1>
        <p style={styles.heroTitle}>Computer Science Student | Full-Stack Developer</p>
        
        <div style={styles.combinedTextBox}>
          <p style={styles.mainText}>
            <span style={styles.highlight}>I'm a passionate Full-Stack Developer</span> with expertise in building 
            modern web applications using{' '}
            <span style={styles.techPillInline}>⚛️ React.js</span>{' '}
            <span style={styles.techPillInline}>🟢 Node.js</span>{' '}
            <span style={styles.techPillInline}>🚂 Express</span>{' '}
            <span style={styles.techPillInline}>🗄️ MySQL</span>. 
            Currently pursuing Computer Science at Debre Birhan University, 
            I love transforming ideas into elegant, functional, and user-friendly digital experiences.
          </p>
          
          <p style={styles.quoteText}>
            "First, solve the problem. Then, write the code."
          </p>
        </div>
        
        <div style={styles.techStack}>
          <span style={styles.techPill}>⚛️ React.js</span>
          <span style={styles.techPill}>🟢 Node.js</span>
          <span style={styles.techPill}>🗄️ MySQL</span>
          <span style={styles.techPill}>🚂 Express.js</span>
          <span style={styles.techPill}>📜 JavaScript</span>
          <span style={styles.techPill}>🐍 Python</span>
        </div>
        
        <div style={styles.buttonGroup}>
          <button 
            style={styles.primaryButton}
            onClick={() => navigateTo('projects')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
            }}
          >
            View My Projects
          </button>
        </div>
      </div>

      <div style={styles.skillsSection}>
        <h2 style={styles.sectionTitle}>Technical Skills</h2>
        <div style={styles.skillsGrid}>
          {[
            'React.js', 'Node.js', 'MySQL', 'JavaScript', 'HTML5', 'CSS3',
            'Python', 'Java', 'C++', 'PHP', 'Express.js', 'Git'
          ].map(skill => (
            <div 
              key={skill} 
              style={styles.skillCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.borderColor = '#3B82F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
              }}
            >
              <span style={styles.skillIcon}>{skillIcons[skill] || '🔧'}</span>
              <span style={styles.skillName}>{skill}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 style={styles.sectionTitle}>Recent Projects</h2>
      
      <div style={styles.projectsGrid}>
        {projects.length > 0 ? projects.map(project => (
          <div 
            key={project.id} 
            style={styles.projectCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.borderColor = '#3B82F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
            }}
          >
            {project.image ? (
              <img src={project.image} alt={project.title} style={styles.projectImage} />
            ) : (
              <div style={styles.projectImagePlaceholder}>
                📁
              </div>
            )}
            <div style={styles.projectContent}>
              <h3 style={styles.projectTitle}>{project.title}</h3>
              <p style={styles.projectTech}>Tech: {project.tech || 'Not specified'}</p>
              <p style={styles.projectDesc}>{project.description}</p>
              <div style={styles.projectLinks}>
                {project.github && (
                  <a 
                    href={project.github} 
                    style={styles.projectLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#60A5FA';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#3B82F6';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    GitHub →
                  </a>
                )}
                {project.live && (
                  <a 
                    href={project.live} 
                    style={styles.projectLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#60A5FA';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#3B82F6';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    Live Demo →
                  </a>
                )}
              </div>
            </div>
          </div>
        )) : (
          <p style={{color: '#94A3B8'}}>No projects yet. Add some in the admin panel!</p>
        )}
      </div>
    </div>
  );

  // Projects page
  const renderProjects = () => (
    <div>
      <h2 style={styles.sectionTitle}>All Projects</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={styles.projectsGrid}>
          {projects.length > 0 ? projects.map(project => (
            <div key={project.id} style={styles.projectCard}>
              {project.image ? (
                <img src={project.image} alt={project.title} style={styles.projectImage} />
              ) : (
                <div style={styles.projectImagePlaceholder}>
                  📁
                </div>
              )}
              <div style={styles.projectContent}>
                <h3 style={styles.projectTitle}>{project.title}</h3>
                <p style={styles.projectTech}>Tech: {project.tech || 'Not specified'}</p>
                <p style={styles.projectDesc}>{project.description}</p>
                <div style={styles.projectLinks}>
                  {project.github && (
                    <a href={project.github} style={styles.projectLink} target="_blank" rel="noopener noreferrer">
                      GitHub →
                    </a>
                  )}
                  {project.live && (
                    <a href={project.live} style={styles.projectLink} target="_blank" rel="noopener noreferrer">
                      Live Demo →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <p style={{color: '#94A3B8'}}>No projects yet.</p>
          )}
        </div>
      )}
    </div>
  );

  // Contact page
  const renderContact = () => (
    <div style={styles.contactContainer}>
      <h2 style={styles.sectionTitle}>Get In Touch</h2>
      
      <p style={styles.contactIntro}>
        Feel free to reach out for collaborations, opportunities, or just a friendly conversation.
      </p>
      
      <div style={styles.contactGrid}>
        <a 
          href="https://github.com/Babi-2580" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={styles.contactCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.borderColor = '#3B82F6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
          }}
        >
          <div style={styles.contactIcon}>{contactIcons.github}</div>
          <div style={styles.contactInfo}>
            <div style={styles.contactLabel}>GitHub</div>
            <div style={styles.contactValue}>@Babi-2580</div>
          </div>
        </a>

        <a 
          href="https://t.me/Dagiiii1212" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={styles.contactCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.borderColor = '#3B82F6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
          }}
        >
          <div style={styles.contactIcon}>{contactIcons.telegram}</div>
          <div style={styles.contactInfo}>
            <div style={styles.contactLabel}>Telegram</div>
            <div style={styles.contactValue}>@Dagiiii1212</div>
          </div>
        </a>

        <a 
          href="mailto:babibelay1221@gmail.com" 
          style={styles.contactCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.borderColor = '#3B82F6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
          }}
        >
          <div style={styles.contactIcon}>{contactIcons.email}</div>
          <div style={styles.contactInfo}>
            <div style={styles.contactLabel}>Email</div>
            <div style={styles.contactValue}>babibelay1221@gmail.com</div>
          </div>
        </a>

        <a 
          href="tel:+251966407199" 
          style={styles.contactCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.borderColor = '#3B82F6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
          }}
        >
          <div style={styles.contactIcon}>{contactIcons.phone}</div>
          <div style={styles.contactInfo}>
            <div style={styles.contactLabel}>Phone</div>
            <div style={styles.contactValue}>0966-40-71-99</div>
          </div>
        </a>
      </div>

      <div style={{...styles.contactCard, cursor: 'default', marginTop: '10px'}}>
        <div style={styles.contactIcon}>{contactIcons.phone}</div>
        <div style={styles.contactInfo}>
          <div style={styles.contactLabel}>Alternative Phone</div>
          <div style={styles.contactValue}>0979-32-99-98</div>
        </div>
      </div>
    </div>
  );

  // Admin page
  const renderAdmin = () => {
    if (!isAdmin) {
      return (
        <div style={styles.adminLogin}>
          <h2 style={{marginBottom: '20px', fontSize: '22px', color: '#FFFFFF'}}>Admin Login</h2>
          {loginError && <div style={styles.errorMessage}>{loginError}</div>}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={adminForm.username}
              onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={adminForm.password}
              onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
              style={styles.input}
            />
            <button 
              type="submit" 
              style={styles.primaryButton}
              disabled={loginLoading}
              onMouseEnter={(e) => {
                if (!loginLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
              }}
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      );
    }

    return (
      <div style={styles.adminPanel}>
        <div style={styles.adminHeader}>
          <h2 style={styles.adminTitle}>Admin Dashboard</h2>
          <button 
            style={styles.addButton}
            onClick={handleAddProject}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
            }}
          >
            <span>➕</span> Add New Project
          </button>
        </div>

        {showProjectForm && (
          <div style={styles.projectForm}>
            <h3 style={styles.formTitle}>
              {editingId ? '✏️ Edit Project' : '➕ Add New Project'}
            </h3>
            <form onSubmit={handleProjectSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Project Title *</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  style={styles.input}
                  placeholder="e.g., Algorithmic Trading Bot"
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Technologies *</label>
                <input
                  type="text"
                  value={projectForm.tech}
                  onChange={(e) => setProjectForm({...projectForm, tech: e.target.value})}
                  style={styles.input}
                  placeholder="e.g., Python, AWS, React, Node.js"
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  style={styles.textarea}
                  placeholder="Describe your project..."
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Project Image URL</label>
                <input
                  type="text"
                  value={projectForm.image}
                  onChange={(e) => setProjectForm({...projectForm, image: e.target.value})}
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>GitHub URL (optional)</label>
                <input
                  type="text"
                  value={projectForm.github}
                  onChange={(e) => setProjectForm({...projectForm, github: e.target.value})}
                  style={styles.input}
                  placeholder="https://github.com/username/repo"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Live Demo URL (optional)</label>
                <input
                  type="text"
                  value={projectForm.live}
                  onChange={(e) => setProjectForm({...projectForm, live: e.target.value})}
                  style={styles.input}
                  placeholder="https://myapp.com"
                />
              </div>
              
              <div style={styles.formButtons}>
                <button 
                  type="submit" 
                  style={styles.saveButton}
                  disabled={formLoading}
                  onMouseEnter={(e) => {
                    if (!formLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
                  }}
                >
                  {formLoading ? 'Saving...' : (editingId ? 'Update Project' : 'Save Project')}
                </button>
                <button 
                  type="button" 
                  style={styles.cancelButton}
                  onClick={handleCancelForm}
                  disabled={formLoading}
                  onMouseEnter={(e) => {
                    if (!formLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div>
          <h3 style={{marginBottom: '20px', fontSize: '20px', color: '#FFFFFF'}}>Manage Projects</h3>
          <div style={styles.projectsGrid}>
            {projects.map(project => (
              <div key={project.id} style={styles.projectCard}>
                {project.image ? (
                  <img src={project.image} alt={project.title} style={styles.projectImage} />
                ) : (
                  <div style={styles.projectImagePlaceholder}>
                    📁
                  </div>
                )}
                <div style={styles.projectContent}>
                  <h3 style={styles.projectTitle}>{project.title}</h3>
                  <p style={styles.projectTech}>Tech: {project.tech || 'Not specified'}</p>
                  <p style={styles.projectDesc}>{project.description.substring(0, 100)}...</p>
                  <div style={styles.adminActions}>
                    <button 
                      style={styles.editButton}
                      onClick={() => handleEditProject(project)}
                      disabled={formLoading}
                      onMouseEnter={(e) => {
                        if (!formLoading) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      style={styles.dangerButton}
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={formLoading}
                      onMouseEnter={(e) => {
                        if (!formLoading) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.messagesSection}>
          <h3 style={{marginBottom: '16px', fontSize: '20px', color: '#FFFFFF'}}>Messages ({messages.length})</h3>
          {messages.map(msg => (
            <div key={msg.id} style={styles.messageCard}>
              <p><span style={{color: '#3B82F6'}}>{msg.name}</span> ({msg.email})</p>
              <p style={{marginTop: '8px', color: '#E2E8F0'}}>{msg.message}</p>
              <p style={{fontSize: '12px', color: '#64748B', marginTop: '8px'}}>{new Date(msg.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={handleLogout}
          style={{...styles.dangerButton, marginTop: '24px', padding: '12px 24px', fontSize: '14px'}}
          disabled={formLoading}
          onMouseEnter={(e) => {
            if (!formLoading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.3)';
          }}
        >
          Logout
        </button>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <nav style={styles.nav}>
          <div style={styles.navLinks}>
            <span 
              style={styles.navLink} 
              onClick={() => navigateTo('home')}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Home
            </span>
            <span 
              style={styles.navLink} 
              onClick={() => navigateTo('projects')}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Projects
            </span>
            <span 
              style={styles.navLink} 
              onClick={() => navigateTo('contact')}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Contact
            </span>
            <span 
              style={styles.adminLink} 
              onClick={() => setShowAdminLogin(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3B82F6';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#3B82F6';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
              }}
            >
              Admin
            </span>
          </div>
        </nav>

        <div style={styles.pageContainer}>
          {showAdminLogin && !isAdmin && renderAdmin()}
          {currentPage === 'home' && renderHome()}
          {currentPage === 'projects' && renderProjects()}
          {currentPage === 'contact' && renderContact()}
          {currentPage === 'admin' && isAdmin && renderAdmin()}
        </div>

        <footer style={styles.footer}>
          <p>© 2026 Dagim Belayneh • Building the web, one line at a time</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
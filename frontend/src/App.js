import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    profile_name: 'Dagim Belayneh',
    profile_title: 'Computer Science Student | Full-Stack Developer',
    profile_image: '/profile.jpg'
  });
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Admin UI state
  const [adminSection, setAdminSection] = useState("dashboard");
  const [showPassword, setShowPassword] = useState(false);
  
  // Admin settings form
  const [settingsForm, setSettingsForm] = useState({
    username: '',
    password: '',
    profile_name: '',
    profile_title: '',
    profile_image: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  
  // Project form
  const [projectForm, setProjectForm] = useState({
    id: null,
    title: '', 
    description: '', 
    technologies: '', 
    image: '', 
    github: '', 
    live: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Check for saved admin session on load
  useEffect(() => {
    fetchProjects();
    fetchProfileSettings();

    // Force admin to login every time the app starts
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminData");

    setIsAdmin(false);
    setAdminData(null);
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

  const fetchProfileSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      setProfileSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
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
      const response = await axios.post(`${API_URL}/admin/login`, loginForm);
      if(response.data.success) {
        setIsAdmin(true);
        setAdminData(response.data.admin);
        // Save to localStorage
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        
        setLoginForm({ username: '', password: '' });
        await fetchMessages();
        await fetchProfileSettings();
        setAdminSection('dashboard');
      }
    } catch (error) {
      setLoginError('Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminData(null);
    // Clear localStorage
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminData');
    setShowProjectForm(false);
    setEditingId(null);
    setProjectForm({ id: null, title: '', description: '', technologies: '', image: '', github: '', live: '' });
    setAdminSection('dashboard');
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMessage('');
    
    // Only send fields that have values
    const updates = {};
    if (settingsForm.username) updates.username = settingsForm.username;
    if (settingsForm.password) updates.password = settingsForm.password;
    if (settingsForm.profile_name) updates.profile_name = settingsForm.profile_name;
    if (settingsForm.profile_title) updates.profile_title = settingsForm.profile_title;
    if (settingsForm.profile_image) updates.profile_image = settingsForm.profile_image;
    
    if (Object.keys(updates).length === 0) {
      setSettingsMessage('No changes to update');
      setSettingsLoading(false);
      setTimeout(() => setSettingsMessage(''), 3000);
      return;
    }
    
    try {
      const response = await axios.put(`${API_URL}/admin/settings`, updates);
      if(response.data.success) {
        setSettingsMessage('Settings updated successfully!');
        // Update local state
        if (response.data.settings) {
          setAdminData(response.data.settings);
          setProfileSettings({
            profile_name: response.data.settings.profile_name || profileSettings.profile_name,
            profile_title: response.data.settings.profile_title || profileSettings.profile_title,
            profile_image: response.data.settings.profile_image || profileSettings.profile_image
          });
        }
        // Clear form
        setSettingsForm({
          username: '',
          password: '',
          profile_name: '',
          profile_title: '',
          profile_image: ''
        });
        setTimeout(() => setSettingsMessage(''), 3000);
      }
    } catch (error) {
      setSettingsMessage('Failed to update settings');
      setTimeout(() => setSettingsMessage(''), 3000);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleAddProject = () => {
    setProjectForm({ id: null, title: '', description: '', technologies: '', image: '', github: '', live: '' });
    setEditingId(null);
    setAdminSection('addProject');
  };

  const handleEditProject = (project) => {
    setProjectForm({
      id: project.id,
      title: project.title,
      description: project.description,
      technologies: project.technologies || '',
      image: project.image || '',
      github: project.github || '',
      live: project.live || ''
    });
    setEditingId(project.id);
    setAdminSection('addProject');
  };

  const handleCancelForm = () => {
    setShowProjectForm(false);
    setEditingId(null);
    setProjectForm({ id: null, title: '', description: '', technologies: '', image: '', github: '', live: '' });
    setAdminSection('manageProjects');
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectForm.title || !projectForm.description) {
      alert('Title and description are required');
      return;
    }
    
    setFormLoading(true);
    
    try {
      if (editingId) {
        // UPDATE existing project
        await axios.put(`${API_URL}/admin/projects/${editingId}`, {
          title: projectForm.title,
          description: projectForm.description,
          technologies: projectForm.technologies,
          image: projectForm.image,
          github: projectForm.github,
          live: projectForm.live
        });
        alert('Project updated successfully!');
      } else {
        // ADD new project
        await axios.post(`${API_URL}/admin/projects`, {
          title: projectForm.title,
          description: projectForm.description,
          technologies: projectForm.technologies,
          image: projectForm.image,
          github: projectForm.github,
          live: projectForm.live
        });
        alert('Project added successfully!');
      }
      
      setShowProjectForm(false);
      setEditingId(null);
      setProjectForm({ id: null, title: '', description: '', technologies: '', image: '', github: '', live: '' });
      await fetchProjects();
      setAdminSection('manageProjects');
      
    } catch (error) {
      console.error('Error saving project:', error);
      alert(error.response?.data?.error || 'Failed to save project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`${API_URL}/admin/projects/${id}/delete`);
        alert('Project deleted successfully!');
        await fetchProjects();
      } catch (error) {
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
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      width: '100%',
      boxSizing: 'border-box'
    },
    nav: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '20px 0',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      width: '100%',
      flexWrap: 'wrap',
      gap: '15px'
    },
    navLinks: {
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'flex-end'
    },
    navLink: {
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      color: '#94A3B8',
      padding: '8px 16px',
      borderRadius: '30px',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap'
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
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
      whiteSpace: 'nowrap'
    },
    pageContainer: {
      padding: '40px 0 50px',
      width: '100%'
    },
    heroSection: {
      marginBottom: '50px',
      textAlign: 'center',
      width: '100%'
    },
    profileImage: {
      width: 'min(180px, 30vw)',
      height: 'min(180px, 30vw)',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #3B82F6',
      boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
      marginBottom: '20px',
      transition: 'transform 0.3s ease, boxShadow 0.3s ease',
      maxWidth: '180px',
      maxHeight: '180px'
    },
    heroName: {
      fontSize: 'clamp(32px, 6vw, 48px)',
      fontWeight: '700',
      margin: '0 0 8px 0',
      color: '#FFFFFF',
      letterSpacing: '-0.5px',
      textShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
      wordBreak: 'break-word'
    },
    heroTitle: {
      fontSize: 'clamp(18px, 3vw, 22px)',
      color: '#3B82F6',
      marginBottom: '20px',
      fontWeight: '500',
      wordBreak: 'break-word'
    },
    combinedTextBox: {
      background: 'linear-gradient(145deg, #1E293B, #0F172A)',
      padding: 'clamp(20px, 4vw, 35px)',
      borderRadius: '20px',
      maxWidth: '800px',
      margin: '0 auto 25px',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 30px rgba(59, 130, 246, 0.2)',
      width: '100%',
      boxSizing: 'border-box'
    },
    mainText: {
      fontSize: 'clamp(16px, 2.5vw, 20px)',
      color: '#E2E8F0',
      lineHeight: '1.8',
      marginBottom: '20px',
      fontStyle: 'italic',
      fontWeight: '400',
      wordBreak: 'break-word'
    },
    quoteText: {
      fontSize: 'clamp(16px, 2.5vw, 20px)',
      color: '#3B82F6',
      lineHeight: '1.8',
      fontStyle: 'italic',
      fontWeight: '600',
      borderTop: '1px solid rgba(59, 130, 246, 0.3)',
      paddingTop: '20px',
      marginTop: '10px',
      wordBreak: 'break-word'
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
      fontSize: 'clamp(14px, 2vw, 16px)',
      margin: '2px',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      whiteSpace: 'nowrap'
    },
    techStack: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: '28px',
      width: '100%'
    },
    techPill: {
      background: 'rgba(59, 130, 246, 0.1)',
      color: '#3B82F6',
      padding: '8px 20px',
      borderRadius: '30px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)',
      whiteSpace: 'nowrap'
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap'
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
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
      whiteSpace: 'nowrap'
    },
    sectionTitle: {
      fontSize: 'clamp(24px, 4vw, 30px)',
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: '30px',
      position: 'relative',
      paddingBottom: '10px',
      borderBottom: '2px solid #3B82F6',
      display: 'inline-block',
      textShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
      maxWidth: '100%',
      wordBreak: 'break-word'
    },
    skillsSection: {
      marginTop: '50px',
      marginBottom: '50px',
      width: '100%'
    },
    skillsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '15px',
      width: '100%'
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
      cursor: 'default',
      width: '100%',
      boxSizing: 'border-box'
    },
    skillIcon: {
      fontSize: '28px',
      width: '40px',
      textAlign: 'center',
      flexShrink: 0
    },
    skillName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#E2E8F0',
      wordBreak: 'break-word'
    },
    projectsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px',
      marginBottom: '40px',
      width: '100%'
    },
    projectCard: {
      background: '#1E293B',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    },
    projectImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
      background: '#0F172A',
      flexShrink: 0
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
      borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
      flexShrink: 0
    },
    projectContent: {
      padding: '20px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    projectTitle: {
      fontSize: '20px',
      fontWeight: '600',
      margin: '0 0 8px 0',
      color: '#FFFFFF',
      wordBreak: 'break-word'
    },
    projectTech: {
      fontSize: '14px',
      color: '#3B82F6',
      marginBottom: '12px',
      fontWeight: '500',
      wordBreak: 'break-word'
    },
    projectDesc: {
      fontSize: '14px',
      color: '#94A3B8',
      marginBottom: '16px',
      lineHeight: '1.6',
      wordBreak: 'break-word',
      flex: 1
    },
    projectLinks: {
      display: 'flex',
      gap: '16px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    projectLink: {
      color: '#3B82F6',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap'
    },
    adminActions: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px',
      borderTop: '1px solid rgba(59, 130, 246, 0.2)',
      paddingTop: '16px',
      flexWrap: 'wrap'
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
      boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)',
      whiteSpace: 'nowrap'
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
      whiteSpace: 'nowrap'
    },
    adminContainer: {
      display: "flex",
      minHeight: "80vh",
      width: "100%",
      gap: "20px"
    },
    adminSidebar: {
      width: "250px",
      background: "#1e293b",
      color: "white",
      padding: "25px 15px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      height: "fit-content",
      position: "sticky",
      top: "20px"
    },
    sidebarButton: {
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      padding: "12px 15px",
      textAlign: "left",
      fontSize: "15px",
      fontWeight: "500",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      width: "100%"
    },
    sidebarButtonActive: {
      background: "#3b82f6",
      color: "white"
    },
    logoutButton: {
      background: "#ef4444",
      border: "none",
      color: "white",
      padding: "12px 15px",
      textAlign: "left",
      fontSize: "15px",
      fontWeight: "500",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginTop: "20px",
      width: "100%"
    },
    adminContent: {
      flex: 1,
      padding: "0",
      width: "100%"
    },
    adminLoginWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "70vh",
      width: "100%"
    },
    adminLoginBox: {
      width: "400px",
      background: "#1e293b",
      padding: "40px",
      borderRadius: "16px",
      border: "1px solid rgba(59, 130, 246, 0.3)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
    },
    adminTitle: {
      textAlign: "center",
      marginBottom: "30px",
      color: "#ffffff",
      fontSize: "28px"
    },
    inputGroup: {
      marginBottom: "20px",
      width: "100%"
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "500",
      color: "#94a3b8",
      fontSize: "14px"
    },
    input: {
      width: "100%",
      padding: "12px 15px",
      borderRadius: "8px",
      border: "1px solid #334155",
      background: "#0f172a",
      color: "#ffffff",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s ease",
      boxSizing: "border-box"
    },
    passwordWrapper: {
      position: "relative",
      width: "100%"
    },
    togglePassword: {
      position: "absolute",
      right: "15px",
      top: "12px",
      cursor: "pointer",
      fontSize: "13px",
      color: "#3b82f6",
      fontWeight: "500",
      background: "transparent",
      border: "none"
    },
    loginButton: {
      width: "100%",
      padding: "14px",
      border: "none",
      borderRadius: "8px",
      background: "#3b82f6",
      color: "white",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginTop: "10px",
      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
    },
    errorMessage: {
      color: "#ef4444",
      marginBottom: "15px",
      fontSize: "14px",
      textAlign: "center"
    },
    card: {
      background: "#1e293b",
      borderRadius: "12px",
      padding: "25px",
      border: "1px solid rgba(59, 130, 246, 0.2)",
      marginBottom: "20px"
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#ffffff",
      marginBottom: "20px"
    },
    statGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginTop: "20px"
    },
    statItem: {
      background: "#0f172a",
      padding: "20px",
      borderRadius: "10px",
      textAlign: "center"
    },
    statNumber: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#3b82f6",
      marginBottom: "5px"
    },
    statLabel: {
      fontSize: "14px",
      color: "#94a3b8"
    },
    contactContainer: {
      maxWidth: '800px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    },
    contactIntro: {
      fontSize: '18px',
      color: '#94A3B8',
      marginBottom: '32px',
      textAlign: 'center',
      wordBreak: 'break-word'
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '20px',
      width: '100%'
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
      transition: 'all 0.3s ease',
      width: '100%',
      boxSizing: 'border-box',
      minWidth: 0
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
      color: '#3B82F6',
      flexShrink: 0
    },
    contactInfo: {
      flex: 1,
      minWidth: 0
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
      color: '#FFFFFF',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    footer: {
      padding: '32px 0',
      textAlign: 'center',
      color: '#64748B',
      fontSize: '14px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      width: '100%',
      wordBreak: 'break-word'
    }
  };

  // Home page
  const renderHome = () => (
    <div style={{width: '100%'}}>
      <div style={styles.heroSection}>
        <img 
          src={profileSettings.profile_image || "/profile.jpg"} 
          alt={profileSettings.profile_name} 
          style={styles.profileImage}
        />
        
        <h1 style={styles.heroName}>{profileSettings.profile_name}</h1>
        <p style={styles.heroTitle}>{profileSettings.profile_title}</p>
        
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
          <button style={styles.primaryButton} onClick={() => navigateTo('projects')}>
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
            <div key={skill} style={styles.skillCard}>
              <span style={styles.skillIcon}>{skillIcons[skill] || '🔧'}</span>
              <span style={styles.skillName}>{skill}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 style={styles.sectionTitle}>Recent Projects</h2>
      
      <div style={styles.projectsGrid}>
        {projects.length > 0 ? projects.map(project => (
          <div key={project.id} style={styles.projectCard}>
            {project.image ? (
              <img src={project.image} alt={project.title} style={styles.projectImage} />
            ) : (
              <div style={styles.projectImagePlaceholder}>📁</div>
            )}
            <div style={styles.projectContent}>
              <h3 style={styles.projectTitle}>{project.title}</h3>
              <p style={styles.projectTech}>Tech: {project.technologies || 'Not specified'}</p>
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
          <p style={{color: '#94A3B8', gridColumn: '1/-1', textAlign: 'center'}}>
            No projects yet. Add some in the admin panel!
          </p>
        )}
      </div>
    </div>
  );

  // Projects page
  const renderProjects = () => (
    <div style={{width: '100%'}}>
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
                <div style={styles.projectImagePlaceholder}>📁</div>
              )}
              <div style={styles.projectContent}>
                <h3 style={styles.projectTitle}>{project.title}</h3>
                <p style={styles.projectTech}>Tech: {project.technologies || 'Not specified'}</p>
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
            <p style={{color: '#94A3B8', gridColumn: '1/-1', textAlign: 'center'}}>
              No projects yet.
            </p>
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
        <a href="https://github.com/Babi-2580" target="_blank" rel="noopener noreferrer" style={styles.contactCard}>
          <div style={styles.contactIcon}>{contactIcons.github}</div>
          <div style={styles.contactInfo}>
            <div style={styles.contactLabel}>GitHub</div>
            <div style={styles.contactValue}>@Babi-2580</div>
          </div>
        </a>

        <a href="https://t.me/Dagiiii1212" target="_blank" rel="noopener noreferrer" style={styles.contactCard}>
          <div style={styles.contactIcon}>{contactIcons.telegram}</div>
          <div style={styles.contactInfo}>
            <div style={styles.contactLabel}>Telegram</div>
            <div style={styles.contactValue}>@Dagiiii1212</div>
          </div>
        </a>

        <a href="mailto:babibelay1221@gmail.com" style={styles.contactCard}>
          <div style={styles.contactIcon}>{contactIcons.email}</div>
          <div style={styles.contactInfo}>
            <div style={styles.contactLabel}>Email</div>
            <div style={styles.contactValue}>babibelay1221@gmail.com</div>
          </div>
        </a>

        <a href="tel:+251966407199" style={styles.contactCard}>
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

  // ADMIN SECTION RENDERERS
  const renderDashboard = () => (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Dashboard Overview</h2>
      <div style={styles.statGrid}>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>{projects.length}</div>
          <div style={styles.statLabel}>Total Projects</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>{messages.length}</div>
          <div style={styles.statLabel}>Messages</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>{adminData?.username || 'dagi'}</div>
          <div style={styles.statLabel}>Admin User</div>
        </div>
      </div>
    </div>
  );

  const renderAddProject = () => (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>{editingId ? 'Edit Project' : 'Add New Project'}</h2>
      <form onSubmit={handleProjectSubmit}>
        <div style={styles.inputGroup}>
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
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Technologies *</label>
          <input
            type="text"
            value={projectForm.technologies}
            onChange={(e) => setProjectForm({...projectForm, technologies: e.target.value})}
            style={styles.input}
            placeholder="e.g., Python, AWS, React, Node.js"
            required
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Description *</label>
          <textarea
            value={projectForm.description}
            onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
            style={{...styles.input, minHeight: '120px'}}
            placeholder="Describe your project..."
            required
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Project Image URL</label>
          <input
            type="text"
            value={projectForm.image}
            onChange={(e) => setProjectForm({...projectForm, image: e.target.value})}
            style={styles.input}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>GitHub URL (optional)</label>
          <input
            type="text"
            value={projectForm.github}
            onChange={(e) => setProjectForm({...projectForm, github: e.target.value})}
            style={styles.input}
            placeholder="https://github.com/username/repo"
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Live Demo URL (optional)</label>
          <input
            type="text"
            value={projectForm.live}
            onChange={(e) => setProjectForm({...projectForm, live: e.target.value})}
            style={styles.input}
            placeholder="https://myapp.com"
          />
        </div>
        
        <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
          <button type="submit" style={styles.loginButton} disabled={formLoading}>
            {formLoading ? 'Saving...' : (editingId ? 'Update Project' : 'Save Project')}
          </button>
          <button type="button" style={{...styles.loginButton, background: '#ef4444'}} onClick={handleCancelForm}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderManageProjects = () => (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Manage Projects</h2>
      <div style={styles.projectsGrid}>
        {projects.length > 0 ? projects.map(project => (
          <div key={project.id} style={styles.projectCard}>
            {project.image ? (
              <img src={project.image} alt={project.title} style={styles.projectImage} />
            ) : (
              <div style={styles.projectImagePlaceholder}>📁</div>
            )}
            <div style={styles.projectContent}>
              <h3 style={styles.projectTitle}>{project.title}</h3>
              <p style={styles.projectTech}>Tech: {project.technologies || 'Not specified'}</p>
              <p style={styles.projectDesc}>{project.description.substring(0, 100)}...</p>
              <div style={styles.adminActions}>
                <button style={styles.editButton} onClick={() => handleEditProject(project)}>
                  ✏️ Edit
                </button>
                <button style={styles.dangerButton} onClick={() => handleDeleteProject(project.id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        )) : (
          <p style={{color: '#94A3B8', gridColumn: '1/-1', textAlign: 'center'}}>
            No projects yet. Add your first project!
          </p>
        )}
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Profile Settings</h2>
      
      {settingsMessage && (
        <div style={{background: '#10B981', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px'}}>
          {settingsMessage}
        </div>
      )}
      
      <form onSubmit={handleUpdateSettings}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Change Username</label>
          <input
            type="text"
            placeholder="New username"
            value={settingsForm.username}
            onChange={(e) => setSettingsForm({...settingsForm, username: e.target.value})}
            style={styles.input}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Change Password</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={settingsForm.password}
              onChange={(e) => setSettingsForm({...settingsForm, password: e.target.value})}
              style={styles.input}
            />
            <span
              style={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Profile Name</label>
          <input
            type="text"
            placeholder={profileSettings.profile_name}
            value={settingsForm.profile_name}
            onChange={(e) => setSettingsForm({...settingsForm, profile_name: e.target.value})}
            style={styles.input}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Profile Title</label>
          <input
            type="text"
            placeholder={profileSettings.profile_title}
            value={settingsForm.profile_title}
            onChange={(e) => setSettingsForm({...settingsForm, profile_title: e.target.value})}
            style={styles.input}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Profile Image Path</label>
          <input
            type="text"
            placeholder="/profile.jpg"
            value={settingsForm.profile_image}
            onChange={(e) => setSettingsForm({...settingsForm, profile_image: e.target.value})}
            style={styles.input}
          />
          <small style={{color: '#94A3B8', display: 'block', marginTop: '4px'}}>
            Save image in public folder as /profile.jpg
          </small>
        </div>
        
        <button type="submit" style={styles.loginButton} disabled={settingsLoading}>
          {settingsLoading ? 'Updating...' : 'Update Settings'}
        </button>
      </form>
    </div>
  );

  const renderMessages = () => (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Messages ({messages.length})</h2>
      {messages.length > 0 ? messages.map(msg => (
        <div key={msg.id} style={{background: '#0f172a', padding: '16px', borderRadius: '8px', marginBottom: '12px'}}>
          <p><span style={{color: '#3B82F6'}}>{msg.name}</span> ({msg.email})</p>
          <p style={{marginTop: '8px', color: '#E2E8F0'}}>{msg.message}</p>
          <p style={{fontSize: '12px', color: '#64748B', marginTop: '8px'}}>
            {new Date(msg.created_at).toLocaleString()}
          </p>
        </div>
      )) : (
        <p style={{color: '#94A3B8'}}>No messages yet.</p>
      )}
    </div>
  );

  // Admin page
  const renderAdmin = () => {
    if (!isAdmin) {
      return (
        <div style={styles.adminLoginWrapper}>
          <div style={styles.adminLoginBox}>
            <h2 style={styles.adminTitle}>Admin Login</h2>
            
            {loginError && <div style={styles.errorMessage}>{loginError}</div>}
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  style={styles.input}
                />
                <span
                  style={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
            </div>

            <button style={styles.loginButton} onClick={handleLogin} disabled={loginLoading}>
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.adminContainer}>
        <div style={styles.adminSidebar}>
          <h3 style={{marginBottom: "20px", color: "white"}}>Admin Panel</h3>

          <button 
            onClick={() => setAdminSection("dashboard")} 
            style={{
              ...styles.sidebarButton,
              ...(adminSection === "dashboard" ? styles.sidebarButtonActive : {})
            }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => setAdminSection("addProject")} 
            style={{
              ...styles.sidebarButton,
              ...(adminSection === "addProject" ? styles.sidebarButtonActive : {})
            }}
          >
            ➕ Add Project
          </button>
          <button 
            onClick={() => setAdminSection("manageProjects")} 
            style={{
              ...styles.sidebarButton,
              ...(adminSection === "manageProjects" ? styles.sidebarButtonActive : {})
            }}
          >
            📋 Manage Projects
          </button>
          <button 
            onClick={() => setAdminSection("profile")} 
            style={{
              ...styles.sidebarButton,
              ...(adminSection === "profile" ? styles.sidebarButtonActive : {})
            }}
          >
            👤 Profile Settings
          </button>
          <button 
            onClick={() => setAdminSection("messages")} 
            style={{
              ...styles.sidebarButton,
              ...(adminSection === "messages" ? styles.sidebarButtonActive : {})
            }}
          >
            💬 Messages
          </button>

          <button onClick={handleLogout} style={styles.logoutButton}>
            🚪 Logout
          </button>
        </div>

        <div style={styles.adminContent}>
          {adminSection === "dashboard" && renderDashboard()}
          {adminSection === "addProject" && renderAddProject()}
          {adminSection === "manageProjects" && renderManageProjects()}
          {adminSection === "profile" && renderProfileSettings()}
          {adminSection === "messages" && renderMessages()}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <nav style={styles.nav}>
          <div style={styles.navLinks}>
            <span style={styles.navLink} onClick={() => navigateTo('home')}>Home</span>
            <span style={styles.navLink} onClick={() => navigateTo('projects')}>Projects</span>
            <span style={styles.navLink} onClick={() => navigateTo('contact')}>Contact</span>
            <span style={styles.adminLink} onClick={() => navigateTo('admin')}>Admin</span>
          </div>
        </nav>

        <div style={styles.pageContainer}>
          {currentPage === 'home' && renderHome()}
          {currentPage === 'projects' && renderProjects()}
          {currentPage === 'contact' && renderContact()}
          {currentPage === 'admin' && renderAdmin()}
        </div>

        <footer style={styles.footer}>
          <p>© 2026 Dagim Belayneh • Building the web, one line at a time</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
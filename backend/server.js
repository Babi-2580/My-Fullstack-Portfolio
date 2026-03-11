const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Install: npm install bcryptjs

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'portfolio_db',
    port: 3307
});

db.connect((err) => {
    if(err) {
        console.log('❌ Database connection failed:', err);
    } else {
        console.log('✅ Connected to MySQL database!');
    }
});

// ============= PUBLIC API ROUTES =============

// GET all projects
app.get('/api/projects', (req, res) => {
    db.query("SELECT * FROM projects ORDER BY id DESC", (err, results) => {
        if(err) {
            console.error('Error fetching projects:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// GET admin settings (public profile info)
app.get('/api/settings', (req, res) => {
    db.query("SELECT profile_name, profile_title, profile_image FROM admin_settings WHERE id = 1", (err, results) => {
        if(err) {
            console.error('Error fetching settings:', err);
            return res.status(500).json({ error: err.message });
        }
        if(results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({ profile_name: 'Dagim Belayneh', profile_title: 'Computer Science Student | Full-Stack Developer', profile_image: '/profile.jpg' });
        }
    });
});

// POST contact message
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    db.query(
        "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)",
        [name, email, message],
        (err) => {
            if(err) {
                console.error('Error saving message:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Message sent successfully!" });
        }
    );
});

// ============= ADMIN API ROUTES =============

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    db.query("SELECT * FROM admin_settings WHERE username = ?", [username], (err, results) => {
        if(err) {
            console.error('Login error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        if(results.length > 0 && results[0].password === password) {
            // Don't send password back
            const { password, ...adminData } = results[0];
            res.json({ success: true, admin: adminData });
        } else {
            res.status(401).json({ success: false, error: "Invalid credentials" });
        }
    });
});

// UPDATE admin settings (change username, password, profile)
app.put('/api/admin/settings', (req, res) => {
    const { username, password, profile_name, profile_title, profile_image } = req.body;
    
    let query = "UPDATE admin_settings SET ";
    const params = [];
    
    if (username) {
        query += "username = ?, ";
        params.push(username);
    }
    if (password) {
        query += "password = ?, ";
        params.push(password);
    }
    if (profile_name) {
        query += "profile_name = ?, ";
        params.push(profile_name);
    }
    if (profile_title) {
        query += "profile_title = ?, ";
        params.push(profile_title);
    }
    if (profile_image) {
        query += "profile_image = ?, ";
        params.push(profile_image);
    }
    
    // Remove trailing comma and space
    query = query.slice(0, -2) + " WHERE id = 1";
    
    db.query(query, params, (err, result) => {
        if(err) {
            console.error('Error updating settings:', err);
            return res.status(500).json({ error: err.message });
        }
        
        // Get updated settings
        db.query("SELECT id, username, profile_name, profile_title, profile_image FROM admin_settings WHERE id = 1", (err, results) => {
            if(err) return res.status(500).json({ error: err.message });
            res.json({ success: true, settings: results[0] });
        });
    });
});

// GET all messages (admin only)
app.get('/api/admin/messages', (req, res) => {
    db.query("SELECT * FROM messages ORDER BY id DESC", (err, results) => {
        if(err) {
            console.error('Error fetching messages:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// CREATE project
app.post('/api/admin/projects', (req, res) => {
    const { title, description, technologies, image, github, live } = req.body;
    
    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }
    
    const sql = "INSERT INTO projects (title, description, technologies, image, github, live) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [title, description, technologies || '', image || '', github || '', live || ''], (err, result) => {
        if(err) {
            console.error('Error creating project:', err);
            return res.status(500).json({ error: err.message });
        }
        
        // Return the created project
        db.query("SELECT * FROM projects WHERE id = ?", [result.insertId], (err, rows) => {
            if(err) return res.status(500).json({ error: err.message });
            res.status(201).json(rows[0]);
        });
    });
});

// UPDATE project - FIXED
app.put('/api/admin/projects/:id', (req, res) => {
    const { title, description, technologies, image, github, live } = req.body;
    const { id } = req.params;
    
    console.log('Updating project ID:', id);
    
    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }
    
    // First check if project exists
    db.query("SELECT * FROM projects WHERE id = ?", [id], (err, results) => {
        if (err) {
            console.error('Error checking project:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }
        
        // Update project
        const sql = "UPDATE projects SET title = ?, description = ?, technologies = ?, image = ?, github = ?, live = ? WHERE id = ?";
        db.query(sql, [title, description, technologies || '', image || '', github || '', live || '', id], (err, result) => {
            if(err) {
                console.error('Error updating project:', err);
                return res.status(500).json({ error: err.message });
            }
            
            // Return updated project
            db.query("SELECT * FROM projects WHERE id = ?", [id], (err, rows) => {
                if(err) return res.status(500).json({ error: err.message });
                res.json(rows[0]);
            });
        });
    });
});

// DELETE project
app.delete('/api/admin/projects/:id', (req, res) => {
    const { id } = req.params;
    
    db.query("DELETE FROM projects WHERE id = ?", [id], (err, result) => {
        if(err) {
            console.error('Error deleting project:', err);
            return res.status(500).json({ error: err.message });
        }
        if(result.affectedRows === 0) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.json({ message: "Project deleted successfully" });
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔑 Default admin: dagi / Dagi123`);
});
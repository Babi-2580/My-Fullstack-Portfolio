const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

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

// Create tables if they don't exist
db.query(`
    CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        tech VARCHAR(255),
        image VARCHAR(500),
        github VARCHAR(500),
        live VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

db.query(`
    CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// ============= PUBLIC API ROUTES =============
app.get('/api/projects', (req, res) => {
    db.query("SELECT * FROM projects ORDER BY id DESC", (err, results) => {
        if(err) {
            console.error('Error fetching projects:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

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

// ============= ADMIN ROUTES =============
const ADMIN_USERNAME = 'dagi';
const ADMIN_PASSWORD = 'Dagi123';

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: "Invalid credentials" });
    }
});

// CREATE project
app.post('/api/admin/projects', (req, res) => {
    const { title, description, tech, image, github, live } = req.body;
    
    console.log('📝 CREATE PROJECT REQUEST:', req.body);
    
    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }
    
    const sql = "INSERT INTO projects (title, description, tech, image, github, live) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [title, description, tech || '', image || '', github || '', live || ''], (err, result) => {
        if(err) {
            console.error('Error creating project:', err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log('✅ Project created with ID:', result.insertId);
        
        // Return the created project with ID
        const selectSql = "SELECT * FROM projects WHERE id = ?";
        db.query(selectSql, [result.insertId], (err, rows) => {
            if(err) {
                console.error('Error fetching created project:', err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json(rows[0]);
        });
    });
});

// UPDATE project - COMPLETELY FIXED
app.put('/api/admin/projects/:id', (req, res) => {
    const { title, description, tech, image, github, live } = req.body;
    const { id } = req.params;
    
    console.log('🔄 UPDATE PROJECT REQUEST');
    console.log('ID from params:', id);
    console.log('Request body:', req.body);
    
    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
        console.log('❌ Invalid ID provided:', id);
        return res.status(400).json({ error: "Invalid project ID" });
    }
    
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
            console.log('❌ Project not found with ID:', id);
            return res.status(404).json({ error: "Project not found" });
        }
        
        console.log('✅ Project found:', results[0]);
        
        // Project exists, proceed with update
        const sql = "UPDATE projects SET title = ?, description = ?, tech = ?, image = ?, github = ?, live = ? WHERE id = ?";
        db.query(sql, [title, description, tech || '', image || '', github || '', live || '', id], (err, result) => {
            if(err) {
                console.error('Error updating project:', err);
                return res.status(500).json({ error: err.message });
            }
            
            console.log('✅ Update successful, affected rows:', result.affectedRows);
            
            // Return updated project
            db.query("SELECT * FROM projects WHERE id = ?", [id], (err, rows) => {
                if(err) {
                    console.error('Error fetching updated project:', err);
                    return res.status(500).json({ error: err.message });
                }
                console.log('✅ Returning updated project:', rows[0]);
                res.json(rows[0]);
            });
        });
    });
});

// DELETE project
app.delete('/api/admin/projects/:id', (req, res) => {
    const { id } = req.params;
    
    console.log('🗑️ DELETE PROJECT REQUEST for ID:', id);
    
    db.query("DELETE FROM projects WHERE id = ?", [id], (err, result) => {
        if(err) {
            console.error('Error deleting project:', err);
            return res.status(500).json({ error: err.message });
        }
        if(result.affectedRows === 0) {
            return res.status(404).json({ error: "Project not found" });
        }
        console.log('✅ Project deleted successfully');
        res.json({ message: "Project deleted successfully" });
    });
});

// GET messages
app.get('/api/admin/messages', (req, res) => {
    db.query("SELECT * FROM messages ORDER BY id DESC", (err, results) => {
        if(err) {
            console.error('Error fetching messages:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔑 Admin login: dagi / Dagi123`);
});
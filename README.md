# 🚀 Dagim Belayneh - Full-Stack Portfolio

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/Babi-2580/my-portfolio?style=social)
![GitHub forks](https://img.shields.io/github/forks/Babi-2580/my-portfolio?style=social)
![GitHub followers](https://img.shields.io/github/followers/Babi-2580?style=social)

✨ **Modern Full-Stack Portfolio Built with React & Django** ✨

</div>

---

## 📊 GitHub Analytics

<div align="center">

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=Babi-2580&show_icons=true&theme=midnight-purple&hide_border=true)

![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=Babi-2580&layout=compact&theme=midnight-purple&hide_border=true)

![GitHub Streak](https://github-readme-streak-stats.herokuapp.com/?user=Babi-2580&theme=midnight-purple&hide_border=true)

</div>

---

## 🎯 Project Overview

A professional portfolio website showcasing my skills and projects as a **Full-Stack Developer**. Features a sleek dark theme with blue accents, complete admin panel for project management, and contact form with database storage.

**Backend migrated from Express.js to Django for better scalability and security!**

---

## ✨ Features

✅ Modern dark theme with blue accents (#0B1120)  
✅ Complete CRUD operations for projects  
✅ Admin dashboard with login (**dagi / Dagi123**)  
✅ Contact form with database storage  
✅ Project images support  
✅ Fully responsive design  
✅ Beautiful hover animations  
✅ RESTful API architecture  

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database |
|----------|---------|----------|
| React.js 19 | Django 6.0 | SQLite (Dev) |
| Axios | Django REST Framework | MySQL (Prod) |
| CSS-in-JS | Python 3.14 | |

</div>

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL (optional, SQLite works by default)

### Installation

```bash
# Clone repository
git clone https://github.com/Babi-2580/my-portfolio.git
cd my-portfolio

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install Django backend dependencies
pip install -r requirements.txt

# Install React frontend dependencies
cd frontend
npm install
cd ..

# Run migrations (SQLite by default)
python manage.py makemigrations
python manage.py migrate

# Create superuser for admin panel
python manage.py createsuperuser

# Start Django backend (port 8000)
python manage.py runserver

# Open new terminal for React frontend (port 3000)
cd frontend
npm start
Default Admin Credentials
text
Username: dagi
Password: Dagi123
📁 Project Structure
text
my-portfolio/
├── api/                    # Django API app
│   ├── models.py          # Database models
│   ├── views.py           # API endpoints
│   ├── urls.py            # URL routing
│   └── admin.py           # Django admin config
├── portfolio_backend/      # Django project settings
│   ├── settings.py        # Configuration
│   └── urls.py            # Main URLs
├── frontend/               # React app
│   ├── src/
│   │   └── App.js         # Main React component
│   └── public/
│       └── profile.jpg    # Profile image
├── media/                  # Uploaded files
├── manage.py               # Django CLI
└── requirements.txt       # Python dependencies
📸 Screenshots
<div align="center">
Home Page	Projects Page	Admin Panel
https://via.placeholder.com/400x200?text=Home+Page	https://via.placeholder.com/400x200?text=Projects+Page	https://via.placeholder.com/400x200?text=Admin+Panel
</div>
🔑 API Endpoints
Method	Endpoint	Description
GET	/api/projects	Get all projects
GET	/api/settings	Get profile settings
POST	/api/contact	Send contact message
POST	/api/admin/login	Admin login
PUT	/api/admin/settings	Update settings
GET	/api/admin/messages	Get contact messages
POST	/api/admin/projects	Create project
PUT	/api/admin/projects/<id>	Update project
DELETE	/api/admin/projects/<id>/delete	Delete project
📬 Contact
<div align="center">
https://img.shields.io/badge/GitHub-Babi--2580-181717?style=for-the-badge&logo=github
https://img.shields.io/badge/Telegram-@Dagiiii1212-2CA5E0?style=for-the-badge&logo=telegram
https://img.shields.io/badge/Email-babibelay1221@gmail.com-D14836?style=for-the-badge&logo=gmail

📱 Phone: 0966-40-71-99 / 0979-32-99-98

</div>
📊 Weekly Development Breakdown
text
React.js      ████████████░░░░░░   60%
Django        ████████░░░░░░░░░░   40%
Python        ████████░░░░░░░░░░   40%
CSS           ██████████░░░░░░░░   50%
SQL           ██████░░░░░░░░░░░░   30%
⭐ Show Your Support
<div align="center">
If you like this project, please give it a star! ⭐

https://img.shields.io/github/stars/Babi-2580/my-portfolio?style=for-the-badge


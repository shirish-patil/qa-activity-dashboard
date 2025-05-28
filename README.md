# AI-Powered QA Activity Dashboard

A full-stack web application that leverages AI to automate and enhance QA activity tracking and analysis. Built with modern technologies and best practices.

## 🚀 Key Features

### AI Integration
- **Smart Activity Summarization**: Uses OpenAI's GPT to automatically generate concise summaries of QA activities
- **Intelligent Categorization**: AI-powered classification of activities into relevant categories
- **Predictive Analytics**: Machine learning models to predict QA trends and workload

### Technical Highlights
- **Real-time Analytics**: Interactive dashboards with Recharts for data visualization
- **Role-based Access Control**: Secure authentication and authorization system
- **RESTful API**: Well-structured backend with Express.js and Prisma ORM
- **Modern UI/UX**: Responsive design with TailwindCSS and HeadlessUI
- **Type Safety**: TypeScript implementation for robust codebase

## 🛠️ Tech Stack

### Frontend
- React 18 with Hooks
- TailwindCSS for styling
- Recharts for data visualization
- Formik & Yup for form handling
- React Router for navigation
- JWT for authentication

### Backend
- Node.js & Express.js
- Prisma ORM
- PostgreSQL database
- OpenAI API integration
- JWT authentication
- RESTful API architecture

## 🏗️ Architecture

## Features
- User authentication and role-based access
- Activity tracking and management
- AI-powered activity summaries
- Interactive analytics and reporting
- Team collaboration features

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/shirish-patil/qa-activity-dashboard.git
   cd qa-activity-dashboard
   ```

2. **Set up environment variables**
   ```bash
   # Frontend
   cp .env.example .env
   
   # Backend
   cd backend
   cp .env.example .env
   ```

3. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development servers**
   ```bash
   # Frontend (from root directory)
   npm start
   
   # Backend (from backend directory)
   npm run dev
   ```

## 🔑 Key Technical Decisions

1. **AI Integration**
   - Used OpenAI's GPT for natural language processing
   - Implemented efficient prompt engineering
   - Optimized API calls for cost-effectiveness

2. **Database Design**
   - Normalized schema for data integrity
   - Efficient indexing for performance
   - Prisma ORM for type safety

3. **Security**
   - JWT-based authentication
   - Role-based access control
   - Environment variable management
   - Input validation and sanitization

## 🎯 Future Enhancements

1. **AI Features**
   - Implement sentiment analysis for activity feedback
   - Add automated QA process optimization suggestions
   - Enhance predictive analytics

2. **Technical Improvements**
   - Add end-to-end testing
   - Implement WebSocket for real-time updates
   - Add CI/CD pipeline

## 📝 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

Shirish Patil
- GitHub: [@shirish-patil](https://github.com/shirish-patil)
- LinkedIn: [https://www.linkedin.com/in/shirish-patil/]

## Documentation
For detailed documentation, please visit the [docs](docs/README.md) directory. It includes:
- Interview preparation guides
- Technical documentation
- Setup and deployment guides  
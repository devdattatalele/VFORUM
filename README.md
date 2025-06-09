# VForums And Events

A modern, feature-rich forum and events platform built for VIT students, designed to foster community engagement, knowledge sharing, and event discovery.

## 🚀 Features

### 📋 Forums & Q&A
- **Real-time Q&A System**: Ask questions, get answers from the community
- **Functional Tag System**: Browse and filter questions by technology tags
- **Voting System**: Like comments and upvote questions
- **Threaded Comments**: Nested comment system for better discussions
- **Edit Functionality**: Edit both questions and comments after posting
- **Search & Filter**: Advanced search with community and tag filtering
- **Community-based Organization**: Organized by tech communities (GDG, ACM, IEEE, etc.)

### 🎉 Events Management
- **Event Discovery**: Browse upcoming tech events, workshops, and hackathons
- **Real-time Data**: Live event information with RSVP counts
- **Community Events**: Events organized by different tech clubs
- **Event Details**: Comprehensive event pages with descriptions and timings

### 🎨 User Experience
- **Timeline Scroll Bar**: Visual progress indicator with section navigation
- **Dark/Light Theme**: Seamless theme switching
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Personalized Dashboard**: Welcome page with recent activities

### 🔐 Authentication
- **VIT Email Only**: Secure authentication restricted to @vit.edu.in emails
- **Professional Landing**: Beautiful sign-up/sign-in experience
- **User Profiles**: Avatar support and user information management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Firebase (Firestore, Authentication)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Form Management**: React Hook Form + Zod validation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/devdattatalele/VFORUM.git
   cd VFORUM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication with Email/Password provider
3. Set up Firestore database
4. Configure authentication domain restrictions for @vit.edu.in emails
5. Add your Firebase config to `.env.local`

### Email Domain Restriction
The platform is configured to only allow @vit.edu.in email addresses for authentication.

## 📱 Usage

### For Students
1. **Sign Up**: Use your VIT email to create an account
2. **Ask Questions**: Post questions in relevant community sections
3. **Answer & Help**: Contribute by answering questions in your expertise areas
4. **Discover Events**: Browse upcoming tech events and workshops
5. **Join Communities**: Engage with GDG, ACM, IEEE, and other tech communities

### For Organizers
1. **Create Events**: Post upcoming workshops, hackathons, and tech talks
2. **Manage Community**: Moderate discussions in your community space
3. **Track Engagement**: Monitor event RSVPs and forum participation

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── events/            # Event-related pages
│   ├── qna/               # Q&A forum pages
│   └── community/         # Community pages
├── components/            # Reusable React components
│   ├── events/           # Event-specific components
│   ├── layout/           # Layout components (Header, Sidebar, etc.)
│   ├── qna/              # Q&A specific components
│   └── ui/               # Base UI components
├── contexts/             # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and services
│   └── services/         # Firebase service functions
└── types/                # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Advanced search with AI
- [ ] Mobile app development
- [ ] Integration with VIT academic systems
- [ ] Advanced event management features
- [ ] Mentorship matching system

## 👥 Community

- **Built by VIT students, for VIT students**
- **Tech Communities**: GDG, ACM, IEEE, AI Club, and more
- **Purpose**: Foster learning, collaboration, and innovation

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Join our community discussions

---

**Made with ❤️ by VIT Tech Community**

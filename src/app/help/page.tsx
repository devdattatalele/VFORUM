import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  MessageSquare, 
  Users, 
  Search, 
  Bell, 
  Zap,
  Calendar,
  Vote,
  Bot,
  Globe,
  Archive,
  Shield,
  Rocket,
  Mail,
  CheckCircle2,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I ask a question on the forum?",
      answer: "Click 'Ask a Question' button, fill in your title, description, and relevant tags, then submit. Make sure to be specific and provide context for better answers."
    },
    {
      question: "Can I create events without being a moderator?",
      answer: "Event creation requires moderator privileges. Contact admin if you'd like to become a moderator and help organize community events."
    },
    {
      question: "How does the upvoting system work?",
      answer: "Community members can upvote helpful questions and answers. Higher upvoted content appears more prominently and helps identify quality discussions."
    },
    {
      question: "What communities are available?",
      answer: "We have communities for various tech interests including Web Development, Data Science, Mobile Development, DevOps, and more. Browse all communities to find your niche."
    },
    {
      question: "How do I get notifications for events?",
      answer: "Sign in to your account and join relevant communities. You'll receive notifications for new events and discussions in your areas of interest."
    },
    {
      question: "Can I edit or delete my posts?",
      answer: "Yes, you can edit your own questions and comments. Deletion may be restricted for posts with active discussions to maintain thread continuity."
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <Card variant="outlined" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle size="lg" className="text-blue-900 dark:text-blue-100">
              VForums And Events Help Center
            </CardTitle>
          </div>
          <CardDescription className="text-blue-700 dark:text-blue-300 text-lg max-w-3xl mx-auto">
            Your unified platform for campus tech communities. Learn about our features, upcoming updates, and how we're solving campus communication challenges.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Problem Statement */}
      <Card>
        <CardHeader>
          <CardTitle size="md" className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            What Problem Are We Solving?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600 dark:text-red-400">Before VForums And Events:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Scattered communication across multiple WhatsApp groups</li>
                <li>• Lost event announcements in message floods</li>
                <li>• No centralized knowledge base for common questions</li>
                <li>• Difficulty discovering relevant tech communities</li>
                <li>• Lack of structured discussion threads</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 dark:text-green-400">With VForums And Events:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Centralized platform for all tech communities</li>
                <li>• Organized event discovery and management</li>
                <li>• Searchable Q&A with tag-based organization</li>
                <li>• Community-specific discussion spaces</li>
                <li>• Persistent knowledge sharing and archival</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          Platform Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hover={true} className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardHeader>
              <CardTitle size="sm" className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <MessageSquare className="h-5 w-5" />
                Q&A Forums
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-900 dark:text-blue-100 text-sm space-y-2">
              <ul className="space-y-1">
                <li>• Categorized discussion threads</li>
                <li>• Tag-based organization</li>
                <li>• Upvoting system</li>
                <li>• Community-specific forums</li>
              </ul>
            </CardContent>
          </Card>

          <Card hover={true} className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
            <CardHeader>
              <CardTitle size="sm" className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                <Calendar className="h-5 w-5" />
                Event Management
              </CardTitle>
            </CardHeader>
            <CardContent className="text-purple-900 dark:text-purple-100 text-sm space-y-2">
              <ul className="space-y-1">
                <li>• Centralized event listings</li>
                <li>• Workshop announcements</li>
                <li>• Hackathon information</li>
                <li>• Club activity updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card hover={true} className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
            <CardHeader>
              <CardTitle size="sm" className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Users className="h-5 w-5" />
                Community Building
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-900 dark:text-green-100 text-sm space-y-2">
              <ul className="space-y-1">
                <li>• Tech community discovery</li>
                <li>• Interest-based grouping</li>
                <li>• Peer-to-peer learning</li>
                <li>• Networking opportunities</li>
              </ul>
            </CardContent>
          </Card>

          <Card hover={true} className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
            <CardHeader>
              <CardTitle size="sm" className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <Search className="h-5 w-5" />
                Smart Search
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-900 dark:text-orange-100 text-sm space-y-2">
              <ul className="space-y-1">
                <li>• Tag-based filtering</li>
                <li>• Content search</li>
                <li>• Community filtering</li>
                <li>• Advanced sorting</li>
              </ul>
            </CardContent>
          </Card>

          <Card hover={true} className="border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-800">
            <CardHeader>
              <CardTitle size="sm" className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                <Vote className="h-5 w-5" />
                Quality Control
              </CardTitle>
            </CardHeader>
            <CardContent className="text-indigo-900 dark:text-indigo-100 text-sm space-y-2">
              <ul className="space-y-1">
                <li>• Community moderation</li>
                <li>• Content upvoting</li>
                <li>• Quality indicators</li>
                <li>• Reputation system</li>
              </ul>
            </CardContent>
          </Card>

          <Card hover={true} className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <CardHeader>
              <CardTitle size="sm" className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="text-red-900 dark:text-red-100 text-sm space-y-2">
              <ul className="space-y-1">
                <li>• Event reminders</li>
                <li>• New replies alerts</li>
                <li>• Community updates</li>
                <li>• Personalized feeds</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle size="md" className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-500" />
            Getting Started
          </CardTitle>
          <CardDescription>
            Quick guide to make the most of VForums And Events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600 dark:text-green-400">For New Users:</h4>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <span className="text-muted-foreground">Sign in with your VIT email address</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <span className="text-muted-foreground">Browse existing questions and discussions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <span className="text-muted-foreground">Join communities relevant to your interests</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <span className="text-muted-foreground">Ask your first question to get started</span>
                </li>
              </ol>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">For Active Contributors:</h4>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <span className="text-muted-foreground">Answer questions in your expertise area</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <span className="text-muted-foreground">Share resources and helpful links</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <span className="text-muted-foreground">Create events for your community</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <span className="text-muted-foreground">Help moderate and maintain quality</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-blue-500" />
          Frequently Asked Questions
        </h2>
        <div className="grid gap-4">
          {faqs.map((faq, index) => (
            <Card key={index} hover={true}>
              <CardHeader>
                <CardTitle size="sm" className="text-foreground">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact and Support */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle size="md" className="text-blue-900 dark:text-blue-100">Need More Help?</CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            We're here to help you make the most of the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Button variant="primary" asChild>
              <Link href="/qna/ask">
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask a Question
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/qna?tag=help">
                <Search className="mr-2 h-4 w-4" />
                Browse Help Topics
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/community/all">
                <Users className="mr-2 h-4 w-4" />
                Browse Communities
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
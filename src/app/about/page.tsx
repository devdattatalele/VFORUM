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
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold mb-4 font-headline text-foreground">
          VForums And Events Help Center
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Your unified platform for campus tech communities. Learn about our features, upcoming updates, and how we're solving campus communication challenges.
        </p>
      </div>

      {/* Problem Statement */}
      <Card className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <AlertTriangle className="h-6 w-6" />
            The Problem We're Solving
          </CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            Campus Tech Communities Fragmentation & Communication Overload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-orange-900 dark:text-orange-100">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="font-medium">Current Challenges:</p>
              <ul className="space-y-2 text-sm">
                <li>• Students juggle 5-6 different communication channels</li>
                <li>• Valuable discussions get buried in temporary chat threads</li>
                <li>• Newcomers struggle to find the right place to ask questions</li>
                <li>• Event spam creates chaos and reduces engagement</li>
                <li>• No unified, searchable space for collaboration</li>
                <li>• Past solutions aren't preserved for future students</li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-medium">Impact on Students:</p>
              <ul className="space-y-2 text-sm">
                <li>• Discourages first-years from joining communities</li>
                <li>• Important event information gets lost</li>
                <li>• Limits campus potential for technical innovation</li>
                <li>• Reduces collaboration opportunities</li>
                <li>• Creates information barriers for juniors</li>
                <li>• Fragments campus tech culture</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Our Solution */}
      <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Lightbulb className="h-6 w-6" />
            Our Solution
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            A centralized, campus-exclusive Tech Forum platform powered by Google Cloud and Firebase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-green-900 dark:text-green-100">
          <p className="text-sm leading-relaxed">
            VForums And Events brings structure, consistency, and active knowledge sharing to fragmented campus tech culture. 
            Our platform serves as the unified discussion space where all tech communities can collaborate effectively.
          </p>
        </CardContent>
      </Card>

      {/* Current Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-lg">
              <MessageSquare className="h-5 w-5" />
              Q&A Forums
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-900 dark:text-blue-100 text-sm">
            <ul className="space-y-1">
              <li>• Categorized discussion threads</li>
              <li>• Tag-based organization</li>
              <li>• Upvoting system</li>
              <li>• Community-specific forums</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200 text-lg">
              <Calendar className="h-5 w-5" />
              Event Management
            </CardTitle>
          </CardHeader>
          <CardContent className="text-purple-900 dark:text-purple-100 text-sm">
            <ul className="space-y-1">
              <li>• Centralized event listings</li>
              <li>• Workshop announcements</li>
              <li>• Hackathon information</li>
              <li>• Club activity updates</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200 text-lg">
              <Search className="h-5 w-5" />
              Smart Search
            </CardTitle>
          </CardHeader>
          <CardContent className="text-indigo-900 dark:text-indigo-100 text-sm">
            <ul className="space-y-1">
              <li>• Searchable knowledge archive</li>
              <li>• Filter by tags and categories</li>
              <li>• Find past solutions</li>
              <li>• Community-based filtering</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-teal-50 dark:bg-teal-950/20 dark:border-teal-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-200 text-lg">
              <Users className="h-5 w-5" />
              Community Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-teal-900 dark:text-teal-100 text-sm">
            <ul className="space-y-1">
              <li>• Multiple tech clubs supported</li>
              <li>• Senior-junior connections</li>
              <li>• Alumni engagement</li>
              <li>• Cross-community collaboration</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-800 dark:text-rose-200 text-lg">
              <Shield className="h-5 w-5" />
              Campus Security
            </CardTitle>
          </CardHeader>
          <CardContent className="text-rose-900 dark:text-rose-100 text-sm">
            <ul className="space-y-1">
              <li>• VIT email authentication</li>
              <li>• Campus-exclusive access</li>
              <li>• Verified student community</li>
              <li>• Spam-free environment</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-lg">
              <Vote className="h-5 w-5" />
              Quality Control
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-900 dark:text-amber-100 text-sm">
            <ul className="space-y-1">
              <li>• Voting and rating system</li>
              <li>• Best answer highlighting</li>
              <li>• Reputation building</li>
              <li>• Quality content promotion</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Features */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Rocket className="h-6 w-6" />
            Upcoming Features
            <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>
            Exciting new features we're working on to enhance your campus tech experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">AI-Powered Chatbot</h4>
                  <p className="text-sm text-muted-foreground">Dialogflow-powered bot for frequently asked campus and community questions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Smart Notifications</h4>
                  <p className="text-sm text-muted-foreground">Targeted notifications for relevant events and discussions</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Multilingual Support</h4>
                  <p className="text-sm text-muted-foreground">Inclusive participation with multiple language support</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Archive className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Advanced Analytics</h4>
                  <p className="text-sm text-muted-foreground">Insights into community engagement and trending topics</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Email Digest</h4>
                  <p className="text-sm text-muted-foreground">Weekly summaries of important discussions and events</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Achievement System</h4>
                  <p className="text-sm text-muted-foreground">Gamification with badges and recognition for helpful contributors</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Get Started */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Getting Started
          </CardTitle>
          <CardDescription>
            Quick guide to make the most of VForums And Events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">For New Users:</h4>
              <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                <li>Sign in with your VIT email address</li>
                <li>Browse existing questions and discussions</li>
                <li>Join communities relevant to your interests</li>
                <li>Ask your first question to get started</li>
              </ol>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">For Active Contributors:</h4>
              <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                <li>Answer questions in your expertise area</li>
                <li>Share resources and helpful links</li>
                <li>Create events for your community</li>
                <li>Help moderate and maintain quality</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact and Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            We're here to help you make the most of the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="default">
            <Link href="/qna/ask">
              <MessageSquare className="mr-2 h-4 w-4" />
              Ask a Question
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/qna?tag=help">
              <Search className="mr-2 h-4 w-4" />
              Browse Help Topics
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/community/all">
              <Users className="mr-2 h-4 w-4" />
              Browse Communities
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 
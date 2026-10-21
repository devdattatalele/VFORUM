import type { Community, Event, Question, UserProfile, Comment } from "./types"
import { Users, Cpu, Bot, ToyBrick, Code, Rss } from "lucide-react"

// Top navigation, in the order vboard uses: discovery first.
export const NAV_LINKS = [
  { href: "/qna", label: "Forum" },
  { href: "/events", label: "Events" },
  { href: "/communities", label: "Communities" },
]

export const COMMUNITIES: Community[] = [
  {
    id: "all",
    name: "All Communities",
    icon: Users,
    description: "Browse content from all tech communities at VIT.",
  },
  {
    id: "gdg",
    name: "Google Developer Groups (GDG)",
    icon: Code,
    description:
      "Explore events, discussions, and resources from the GDG chapter, focusing on Google technologies and web development.",
  },
  {
    id: "acm",
    name: "ACM Chapter",
    icon: Cpu,
    description:
      "Engage with the Association for Computing Machinery (ACM) chapter for content on computer science, algorithms, and competitive programming.",
  },
  {
    id: "cultural-club",
    name: "cult club",
    icon: Bot,
    description:
      "Dive into Artificial Intelligence and Machine Learning with the AI Club. Find workshops, projects, and discussions.",
  },
  {
    id: "ieee",
    name: "IEEE Org",
    icon: ToyBrick,
    description:
      "Get hands-on with Grss, AESS, and automation projects with the IEEE Org.",
  },
  {
    id: "general-tech",
    name: "General Tech Talks",
    icon: Rss,
    description:
      "A place for general technology discussions, news, and miscellaneous tech topics.",
  },
]

export const DEFAULT_COMMUNITY_ID = "all"

// Mock User Constants
export const MOCK_USER_ID = "mock-user-123"
export const MOCK_USER_DISPLAY_NAME = "VIT Techie"
export const MOCK_USER_PHOTO_URL = "https://placehold.co/100x100.png?text=VT"

export type { Event, Question, Comment, UserProfile, Community } // Re-export types

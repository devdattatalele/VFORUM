"use client";

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, TrendingUp, Clock, MessageSquare, Zap } from 'lucide-react';

interface CommentSortProps {
  currentSort: string;
  onSortChange: (sortBy: string) => void;
  commentCount: number;
}

const sortOptions = [
  {
    value: 'top',
    label: 'Best',
    icon: TrendingUp,
    description: 'Comments with highest score'
  },
  {
    value: 'newest',
    label: 'New',
    icon: Clock,
    description: 'Most recent comments first'
  },
  {
    value: 'oldest',
    label: 'Old',
    icon: Clock,
    description: 'Oldest comments first'
  },
  {
    value: 'controversial',
    label: 'Controversial',
    icon: Zap,
    description: 'Comments with lots of activity'
  }
];

export default function CommentSort({ currentSort, onSortChange, commentCount }: CommentSortProps) {
  const currentOption = sortOptions.find(option => option.value === currentSort) || sortOptions[0];

  return (
    <div className="flex items-center gap-3 text-base text-muted-foreground">
      <MessageSquare className="h-5 w-5" />
      <span className="font-medium text-foreground text-lg">
        {commentCount} Comment{commentCount !== 1 ? 's' : ''}
      </span>
      <span className="opacity-70 hidden sm:inline">•</span>
      <span className="text-base text-muted-foreground hidden sm:inline">Sort by:</span>
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[160px] h-10 text-base">
          <div className="flex items-center gap-2 w-full">
            <currentOption.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{currentOption.label}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium text-base">{option.label}</span>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {option.description}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 
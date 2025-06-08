"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { COMMUNITIES } from "@/lib/constants";
import type { Event } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React from "react";

const eventFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long.").max(1000, "Description too long."),
  posterImageUrl: z.string().url("Please enter a valid image URL."),
  dateTime: z.date({ required_error: "Event date and time are required." }),
  clubName: z.string().min(2, "Club name is required."),
  communityId: z.string({ required_error: "Please select a community." }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event; // For editing existing events
  onSubmitSuccess?: () => void;
}

export default function EventForm({ event, onSubmitSuccess }: EventFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const defaultValues: Partial<EventFormValues> = event
    ? {
        ...event,
        dateTime: new Date(event.dateTime),
      }
    : {
        title: "",
        description: "",
        posterImageUrl: "",
        clubName: "",
      };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  async function onSubmit(data: EventFormValues) {
    setIsLoading(true);
    console.log("Event form submitted:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: event ? "Event Updated!" : "Event Created!",
      description: `"${data.title}" has been successfully ${event ? 'updated' : 'created'}.`,
    });
    
    setIsLoading(false);
    if (onSubmitSuccess) {
      onSubmitSuccess();
    } else {
      router.push('/events'); // Redirect to events page after creation/update
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tech Talk on Quantum Computing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide details about the event, speakers, agenda, etc."
                  className="resize-y min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="posterImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poster Image URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/poster.jpg" {...field} />
              </FormControl>
              <FormDescription>Link to the event's promotional image.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="dateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Event Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP HH:mm")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve time if already set, or default to noon
                          const currentTime = field.value ? { hours: field.value.getHours(), minutes: field.value.getMinutes() } : { hours: 12, minutes: 0};
                          date.setHours(currentTime.hours);
                          date.setMinutes(currentTime.minutes);
                        }
                        field.onChange(date);
                      }}
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
                      initialFocus
                    />
                    {/* Basic Time Picker (can be improved with dedicated component) */}
                    <div className="p-3 border-t border-border">
                       <FormLabel className="text-sm">Time (HH:mm)</FormLabel>
                       <Input 
                        type="time"
                        defaultValue={field.value ? format(field.value, "HH:mm") : "12:00"}
                        onChange={(e) => {
                            if (field.value) {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(field.value);
                                newDate.setHours(parseInt(hours, 10));
                                newDate.setMinutes(parseInt(minutes, 10));
                                field.onChange(newDate);
                            }
                        }}
                       />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clubName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organizing Club/Group Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., GDG VIT Pune" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="communityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Community Channel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the primary community for this event" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMMUNITIES.filter(c => c.id !== 'all').map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                This helps categorize the event on the platform.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {event ? "Update Event" : "
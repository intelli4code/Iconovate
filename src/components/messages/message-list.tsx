
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "../ui/badge";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Timestamp;
  selectedPackage?: string;
}

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(messagesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages: ", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Failed to load messages",
        description: "Could not fetch data from the database.",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inbox</CardTitle>
        <CardDescription>Messages from your website contact form.</CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">
            You have no messages yet.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {messages.map((message) => (
              <AccordionItem key={message.id} value={message.id}>
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full pr-4">
                    <div className="flex-1 text-left">
                      <p className="font-medium">{message.subject}</p>
                      <p className="text-sm text-muted-foreground">From: {message.name} ({message.email})</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {message.createdAt ? format(message.createdAt.toDate(), 'PPpp') : 'No date'}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {message.selectedPackage && (
                     <Badge className="mb-2">Selected Package: {message.selectedPackage}</Badge>
                  )}
                  <p className="whitespace-pre-wrap">{message.message}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

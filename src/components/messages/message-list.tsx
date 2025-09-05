
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";

type MessageStatus = 'New' | 'Contacted' | 'Converted' | 'Archived';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Timestamp;
  selectedPackage?: string;
  status: MessageStatus;
}

const statusStyles: { [key in MessageStatus]: string } = {
  'New': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300',
  'Contacted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300',
  'Converted': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300',
  'Archived': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-300',
};

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<MessageStatus | 'All'>('All');

  useEffect(() => {
    setLoading(true);
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        status: doc.data().status || 'New',
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
  
  const handleStatusUpdate = async (id: string, status: MessageStatus) => {
      const messageRef = doc(db, "messages", id);
      try {
          await updateDoc(messageRef, { status: status });
          toast({ title: "Status Updated", description: `Message has been marked as ${status}.`});
      } catch (error) {
          toast({ variant: "destructive", title: "Update Failed" });
      }
  }

  const filteredMessages = messages.filter(message => 
      activeFilter === 'All' || message.status === activeFilter
  );

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
        <div className="flex gap-2 pt-2">
            {(['All', 'New', 'Contacted', 'Converted', 'Archived'] as const).map(status => (
                <Button key={status} variant={activeFilter === status ? 'default' : 'outline'} onClick={() => setActiveFilter(status)}>
                    {status}
                </Button>
            ))}
        </div>
      </CardHeader>
      <CardContent>
        {filteredMessages.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">
            You have no messages in this category.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredMessages.map((message) => (
              <AccordionItem key={message.id} value={message.id}>
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full pr-4">
                    <div className="flex items-center gap-4 text-left">
                        <Badge variant="outline" className={statusStyles[message.status]}>{message.status}</Badge>
                        <div className="flex-1">
                            <p className="font-medium">{message.subject}</p>
                            <p className="text-sm text-muted-foreground">From: {message.name} ({message.email})</p>
                        </div>
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
                   <div className="mt-4 pt-4 border-t">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Change Status</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {(['New', 'Contacted', 'Converted', 'Archived'] as const).map(status => (
                            <DropdownMenuItem key={status} onSelect={() => handleStatusUpdate(message.id, status)}>
                                Mark as {status}
                            </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

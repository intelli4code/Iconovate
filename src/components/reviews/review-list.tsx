
"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore"
import type { Project } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function ReviewList() {
  const [reviews, setReviews] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    setLoading(true);
    const projectsRef = collection(db, "projects");
    const q = query(
        projectsRef, 
        where("rating", ">", 0),
        orderBy("rating", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
      setReviews(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reviews: ", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Failed to load reviews",
        description: "Could not fetch data from the database.",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  if (loading) {
      return (
        <div className="flex justify-center items-center p-10">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span className="text-muted-foreground">Loading reviews...</span>
        </div>
      )
  }

  if (reviews.length === 0) {
      return (
         <Card className="text-center h-48 flex flex-col justify-center items-center">
            <CardHeader>
                <CardTitle>No Reviews Yet</CardTitle>
                <CardDescription>Completed projects with reviews will appear here.</CardDescription>
            </CardHeader>
        </Card>
      )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {reviews.map((project) => (
            <Card key={project.id}>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://placehold.co/48x48`} data-ai-hint="business person" />
                        <AvatarFallback>{project.client.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle>{project.client}</CardTitle>
                        <CardDescription>
                           Review for <Link href={`/dashboard/projects/${project.id}`} className="text-primary hover:underline">{project.name}</Link>
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                            'h-5 w-5',
                            (project.rating || 0) > i ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                            )}
                        />
                        ))}
                    </div>
                    <p className="text-muted-foreground italic">"{project.review}"</p>
                </CardContent>
            </Card>
        ))}
    </div>
  );
}

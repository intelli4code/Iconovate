
"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Project } from '@/types';

export default function ClientLoginPage() {
  const [name, setName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!orderId.trim() || !name.trim()) {
        setError('Please enter your name and Order ID.');
        setLoading(false);
        return;
    }

    try {
      const projectsRef = collection(db, 'projects');
      // In Firestore, you often use the document ID directly. 
      // If 'id' is a field in the document, this query is correct.
      const q = query(projectsRef, where("id", "==", orderId.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid Order ID. Please check and try again.');
        setLoading(false);
        return;
      }
      
      const projectDoc = querySnapshot.docs[0];
      const project = projectDoc.data() as Project;

      // Case-insensitive check for the client's name
      if (project.client.toLowerCase() === name.trim().toLowerCase()) {
        router.push(`/portal/${project.id}`);
      } else {
        setError('The name provided does not match the client for this Order ID.');
        setLoading(false);
      }

    } catch (err) {
      console.error("Firestore query error:", err);
      setError('Could not verify your details. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex items-center gap-2 mb-6">
        <Rocket className="w-8 h-8 text-primary" />
        <span className="text-2xl font-semibold font-headline text-foreground">BrandBoost AI</span>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Client Portal</CardTitle>
          <CardDescription>Enter your details to view your project status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Jane Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-id">Order ID</Label>
              <Input
                id="order-id"
                type="text"
                placeholder="e.g., proj-001"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'View Project'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Are you an admin?{" "}
        <a href="/login" className="underline">
          Login here
        </a>
      </p>
    </div>
  );
}

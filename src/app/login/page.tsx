
"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LoadingLink } from '@/components/ui/loading-link';
import { useLoading } from '@/contexts/loading-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { showLoader } = useLoading();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showLoader();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const teamRef = collection(db, "teamMembers");

      const teamSnapshot = await getDocs(teamRef);
      if (teamSnapshot.empty) {
        router.push('/dashboard');
        toast({
          title: "Welcome, Admin!",
          description: "Please add yourself to the team in the Team Management page to complete setup.",
        });
        return; 
      }

      const q = query(teamRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("You are not authorized to access the admin dashboard.");
      }
      
      const memberData = querySnapshot.docs[0].data();
      if (memberData.role !== 'Admin') {
          throw new Error("You do not have admin permissions.");
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      setLoading(false);
      console.error("Firebase Auth Error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
      });
      if (auth.currentUser) {
        await auth.signOut();
      }
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
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
       <p className="mt-4 text-center text-sm text-muted-foreground">
        Client?{" "}
        <LoadingLink href="/client-login" className="underline">
          Access the Client Portal
        </LoadingLink>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Are you a designer?{" "}
        <LoadingLink href="/designer/login" className="underline">
          Designer Portal
        </LoadingLink>
      </p>
    </div>
  );
}

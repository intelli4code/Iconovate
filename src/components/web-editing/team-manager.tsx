
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { TeamMember } from "@/types";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";

export function TeamManager() {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "teamMembers"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
      setLoading(false);
    }, (error) => {
      toast({ variant: "destructive", title: "Failed to load team members." });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleToggleShowOnWebsite = async (member: TeamMember) => {
    const memberRef = doc(db, "teamMembers", member.id);
    try {
      await updateDoc(memberRef, {
        showOnWebsite: !member.showOnWebsite
      });
      toast({
        title: "Visibility Updated",
        description: `${member.name} is now ${!member.showOnWebsite ? "visible" : "hidden"} on the website.`,
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Visibility</CardTitle>
        <CardDescription>
          Toggle the switch to show or hide a team member from the public "About Us" and "Team" pages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Show on Website</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : teamMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">No team members found.</TableCell>
              </TableRow>
            ) : (
              teamMembers.map(member => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatarUrl} data-ai-hint="person portrait" />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>{member.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={member.showOnWebsite}
                      onCheckedChange={() => handleToggleShowOnWebsite(member)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

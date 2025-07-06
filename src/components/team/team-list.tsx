
"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, PlusCircle, Trash2, Loader2, UploadCloud } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { db, auth } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { supabase } from "@/lib/supabase"
import type { TeamMember, TeamMemberRole } from "@/types"
import Image from "next/image"

const memberFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().optional(),
});
type MemberFormValues = z.infer<typeof memberFormSchema>;

export function TeamList() {
    const { toast } = useToast()
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError,
    } = useForm<MemberFormValues>({
        resolver: zodResolver(memberFormSchema),
    });

    useEffect(() => {
        setLoading(true);
        const teamRef = collection(db, "teamMembers");
        const q = query(teamRef, orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TeamMember[];
            setTeamMembers(members);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching team members: ", error);
            toast({ variant: "destructive", title: "Failed to load team."});
            setLoading(false);
        });
        return () => unsubscribe();
    }, [toast]);

    const handleOpenDialog = (member: TeamMember | null = null) => {
        if (member) {
            setEditingMember(member);
            reset({ name: member.name, email: member.email });
            if (member.avatarUrl) setPreview(member.avatarUrl);
        } else {
            setEditingMember(null);
            reset({ name: "", email: "", password: "" });
        }
        setIsFormDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsFormDialogOpen(false);
        setEditingMember(null);
        setSelectedFile(null);
        setPreview(null);
        reset();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setPreview(editingMember?.avatarUrl || null);
        }
    };
    
    const onSubmit = async (data: MemberFormValues) => {
        let avatarUrl = editingMember?.avatarUrl || '';
        let avatarPath = editingMember?.avatarPath || '';

        try {
            if (selectedFile) {
                const filePath = `team-pfps/${uuidv4()}-${selectedFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('data-storage')
                    .upload(filePath, selectedFile, { upsert: true });

                if (uploadError) throw uploadError;

                avatarPath = uploadData.path;
                const { data: publicUrlData } = supabase.storage.from('data-storage').getPublicUrl(avatarPath);
                avatarUrl = publicUrlData.publicUrl;
            }

            if (editingMember) {
                const memberRef = doc(db, "teamMembers", editingMember.id);
                await updateDoc(memberRef, { name: data.name, avatarUrl, avatarPath });
                toast({ title: "Member Updated", description: `${data.name}'s details have been saved.` });
            } else {
                 if (!data.password || data.password.length < 6) {
                    setError("password", { type: "manual", message: "Password must be at least 6 characters." });
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                const user = userCredential.user;

                const role: TeamMemberRole = data.email === 'infoathamza@gmail.com' ? 'Admin' : 'Designer';

                await addDoc(collection(db, "teamMembers"), { 
                    name: data.name,
                    email: data.email,
                    role: role, 
                    avatarUrl, 
                    avatarPath, 
                    createdAt: serverTimestamp(),
                    authUid: user.uid,
                });
                toast({ title: "Invitation Sent!", description: `${data.email} has been invited as a ${role}.` });
            }
            handleCloseDialog();
        } catch (error: any) {
            console.error("Error saving member: ", error);
            if (error.code === 'auth/email-already-in-use') {
                setError("email", { type: 'manual', message: 'This email is already registered.' });
            } else if (error.code === 'auth/weak-password') {
                setError("password", { type: 'manual', message: 'Password is too weak. Must be at least 6 characters.' });
            } else {
                 toast({ 
                    variant: "destructive", 
                    title: "Save Failed", 
                    description: error.message || "An unexpected error occurred. Please check Supabase policies." 
                });
            }
        }
    };

    const handleDeleteMember = async (member: TeamMember) => {
        try {
            if (member.avatarPath) {
                await supabase.storage.from('data-storage').remove([member.avatarPath]);
            }
            await deleteDoc(doc(db, "teamMembers", member.id));
            toast({ title: "Member Removed", description: `${member.name} has been removed from the team.` });
        } catch (error: any) {
             console.error("Error deleting member: ", error);
             toast({ 
                 variant: "destructive", 
                 title: "Deletion Failed", 
                 description: error.message || "Failed to delete avatar. Please check Supabase RLS policies." 
            });
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>A list of all members in your workspace.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead className="hidden sm:table-cell">Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center p-6">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
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
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>{member.role}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onSelect={() => handleOpenDialog(member)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => e.preventDefault()}
                                                                className="text-destructive"
                                                                disabled={member.email === 'infoathamza@gmail.com'}
                                                            >
                                                                Remove Member
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently remove {member.name} from the team. This action cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteMember(member)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => handleCloseDialog()}>
                    <DialogHeader>
                        <DialogTitle>{editingMember ? 'Edit Team Member' : 'Invite a new team member'}</DialogTitle>
                        <DialogDescription>{editingMember ? `Update details for ${editingMember.name}.` : 'Enter their details to send an invitation. Role is assigned automatically.'}</DialogDescription>
                    </DialogHeader>
                    <form id="member-form" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-4 py-4">
                             <div className="space-y-2">
                                <Label>Avatar</Label>
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={preview || undefined} />
                                        <AvatarFallback>
                                            <UploadCloud />
                                        </AvatarFallback>
                                    </Avatar>
                                    <Input id="avatar-file" type="file" onChange={handleFileChange} accept="image/*" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="John Doe" {...register("name")} />
                                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="member@example.com" {...register("email")} disabled={!!editingMember} />
                                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                            </div>
                            {!editingMember && (
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
                                </div>
                            )}
                        </div>
                    </form>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" form="member-form" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (editingMember ? 'Save Changes' : 'Send Invitation')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}


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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { supabase } from "@/lib/supabase"
import type { TeamMember, TeamMemberRole } from "@/types"
import Image from "next/image"

const memberFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["Admin", "Designer", "Viewer"], { required_error: "Please select a role." }),
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
        setValue,
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
            reset({ name: member.name, email: member.email, role: member.role });
            if (member.avatarUrl) setPreview(member.avatarUrl);
        } else {
            setEditingMember(null);
            reset({ name: "", email: "", role: "Designer" });
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
                    .from('team-pfps')
                    .upload(filePath, selectedFile, { upsert: true });

                if (uploadError) throw uploadError;

                avatarPath = uploadData.path;
                const { data: publicUrlData } = supabase.storage.from('team-pfps').getPublicUrl(avatarPath);
                avatarUrl = publicUrlData.publicUrl;
            }

            if (editingMember) {
                // Update existing member
                const memberRef = doc(db, "teamMembers", editingMember.id);
                await updateDoc(memberRef, { ...data, avatarUrl, avatarPath });
                toast({ title: "Member Updated", description: `${data.name}'s details have been saved.` });
            } else {
                // Add new member
                await addDoc(collection(db, "teamMembers"), { ...data, avatarUrl, avatarPath, createdAt: serverTimestamp() });
                toast({ title: "Invitation Sent!", description: `${data.email} has been invited as a ${data.role}.` });
            }
            handleCloseDialog();
        } catch (error: any) {
            console.error("Error saving member: ", error);
            toast({ variant: "destructive", title: "Save Failed", description: error.message });
        }
    };

    const handleDeleteMember = async (member: TeamMember) => {
        try {
            // Delete avatar from Supabase if it exists
            if (member.avatarPath) {
                await supabase.storage.from('team-pfps').remove([member.avatarPath]);
            }
            // Delete member from Firestore
            await deleteDoc(doc(db, "teamMembers", member.id));
            toast({ title: "Member Removed", description: `${member.name} has been removed from the team.` });
        } catch (error: any) {
             console.error("Error deleting member: ", error);
             toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
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
                                                                disabled={member.email === 'alex@brandboost.ai'}
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
                        <DialogDescription>{editingMember ? `Update details for ${editingMember.name}.` : 'Enter the email and assign a role to send an invitation.'}</DialogDescription>
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
                                <Input id="email" type="email" placeholder="member@example.com" {...register("email")} />
                                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger id="role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Admin">Admin</SelectItem>
                                                <SelectItem value="Designer">Designer</SelectItem>
                                                <SelectItem value="Viewer">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.role && <p className="text-sm text-destructive mt-1">{errors.role.message}</p>}
                            </div>
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

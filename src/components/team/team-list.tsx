
"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type TeamMemberRole = "Admin" | "Designer" | "Viewer"

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: TeamMemberRole;
    avatar: string;
}

const initialTeamMembers: TeamMember[] = [
    { id: 1, name: 'Alex Drake', email: 'alex@brandboost.ai', role: 'Admin', avatar: `https://placehold.co/40x40/7e22ce/ffffff?text=AD` },
    { id: 2, name: 'Casey Jordan', email: 'casey@brandboost.ai', role: 'Designer', avatar: `https://placehold.co/40x40/16a34a/ffffff?text=CJ` },
    { id: 3, name: 'Morgan Lee', email: 'morgan@brandboost.ai', role: 'Viewer', avatar: `https://placehold.co/40x40/f59e0b/ffffff?text=ML` },
];

const inviteFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["Admin", "Designer", "Viewer"], { required_error: "Please select a role." }),
});
type InviteFormValues = z.infer<typeof inviteFormSchema>;

export function TeamList() {
    const { toast } = useToast()
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    const {
        control: inviteControl,
        register: registerInvite,
        handleSubmit: handleInviteSubmit,
        formState: { errors: inviteErrors, isSubmitting: isInviteSubmitting },
        reset: resetInviteForm,
    } = useForm<InviteFormValues>({
        resolver: zodResolver(inviteFormSchema),
    });

    const onInviteSubmit = (data: InviteFormValues) => {
        const newMember: TeamMember = {
            id: Date.now(),
            name: "New Member",
            email: data.email,
            role: data.role,
            avatar: `https://placehold.co/40x40/7f7f7f/ffffff?text=NM`
        };
        setTeamMembers(prev => [...prev, newMember]);
        toast({
            title: "Invitation Sent!",
            description: `${data.email} has been invited as a ${data.role}.`,
        });
        setIsInviteDialogOpen(false);
        resetInviteForm();
    };

    const handleEditRole = (member: TeamMember, newRole: TeamMemberRole) => {
        setTeamMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: newRole } : m));
        toast({
            title: "Role Updated",
            description: `${member.name}'s role has been changed to ${newRole}.`,
        });
        setEditingMember(null);
    };

    const handleDeleteMember = (memberId: number) => {
        setTeamMembers(prev => prev.filter(m => m.id !== memberId));
        toast({
            variant: "destructive",
            title: "Member Removed",
            description: "The team member has been successfully removed.",
        });
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>A list of all members in your workspace.</CardDescription>
                        </div>
                        <Button onClick={() => setIsInviteDialogOpen(true)}>
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
                            {teamMembers.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.avatar} data-ai-hint="person portrait" />
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
                                                <DropdownMenuItem onSelect={() => setEditingMember(member)}>Edit Role</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Remove Member</DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This will permanently remove {member.name} from the team. This action cannot be undone.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteMember(member.id)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Invite Member Dialog */}
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite a new team member</DialogTitle>
                        <DialogDescription>Enter the email and assign a role to send an invitation.</DialogDescription>
                    </DialogHeader>
                    <form id="invite-form" onSubmit={handleInviteSubmit(onInviteSubmit)}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="invite-email">Email Address</Label>
                                <Input id="invite-email" type="email" placeholder="member@example.com" {...registerInvite("email")} />
                                {inviteErrors.email && <p className="text-sm text-destructive mt-1">{inviteErrors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invite-role">Role</Label>
                                <Controller
                                    name="role"
                                    control={inviteControl}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger id="invite-role">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Admin">Admin</SelectItem>
                                                <SelectItem value="Designer">Designer</SelectItem>
                                                <SelectItem value="Viewer">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {inviteErrors.role && <p className="text-sm text-destructive mt-1">{inviteErrors.role.message}</p>}
                            </div>
                        </div>
                    </form>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsInviteDialogOpen(false); resetInviteForm(); }}>Cancel</Button>
                        <Button type="submit" form="invite-form" disabled={isInviteSubmitting}>
                            {isInviteSubmitting ? "Sending..." : "Send Invitation"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Role for {editingMember?.name}</DialogTitle>
                        <DialogDescription>Select a new role for this team member.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="edit-role">Role</Label>
                        <Select
                            defaultValue={editingMember?.role}
                            onValueChange={(value: TeamMemberRole) => handleEditRole(editingMember!, value)}
                        >
                            <SelectTrigger id="edit-role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Designer">Designer</SelectItem>
                                <SelectItem value="Viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingMember(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

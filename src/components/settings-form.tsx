
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, MoreHorizontal, PlusCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select"

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
})
type ProfileFormValues = z.infer<typeof profileFormSchema>

const inviteFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["Admin", "Designer"], { required_error: "Please select a role." }),
})
type InviteFormValues = z.infer<typeof inviteFormSchema>

const mockTeamMembers = [
    { id: 1, name: 'Alex Drake', email: 'alex@brandboost.ai', role: 'Admin', avatar: 'https://placehold.co/40x40' },
    { id: 2, name: 'Casey Jordan', email: 'casey@brandboost.ai', role: 'Designer', avatar: 'https://placehold.co/40x40' },
];

export function SettingsForm() {
  const { toast } = useToast()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "Alex Drake",
      email: "alex@brandboost.ai",
    },
  })

  const {
      control,
      register: registerInvite,
      handleSubmit: handleInviteSubmit,
      formState: { errors: inviteErrors, isSubmitting: isInviteSubmitting },
      reset: resetInviteForm,
  } = useForm<InviteFormValues>({
      resolver: zodResolver(inviteFormSchema),
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Profile updated:", data)
    toast({
      title: "Profile Updated!",
      description: "Your changes have been saved successfully.",
      action: <CheckCircle className="text-green-500" />,
    })
  }

  const onInviteSubmit = async (data: InviteFormValues) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Invite sent:", data);
      toast({
          title: "Invitation Sent!",
          description: `${data.email} has been invited as a ${data.role}.`,
      });
      setIsInviteDialogOpen(false);
      resetInviteForm();
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              This is how others will see you on the site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...registerProfile("fullName")} />
                {profileErrors.fullName && <p className="text-sm text-destructive mt-1">{profileErrors.fullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...registerProfile("email")} />
                 {profileErrors.email && <p className="text-sm text-destructive mt-1">{profileErrors.email.message}</p>}
              </div>
              <Button type="submit" disabled={isProfileSubmitting}>
                {isProfileSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="account" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your subscription, billing, and team settings. This feature is under construction.
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>

      <TabsContent value="team" className="mt-4">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Team Management</CardTitle>
                        <CardDescription>Invite and manage your team members.</CardDescription>
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
                        {mockTeamMembers.map(member => (
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
                                            <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">Remove Member</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="appearance" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the app. This feature is under construction.
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
      <TabsContent value="notifications" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications. This feature is under construction.
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite a new team member</DialogTitle>
                    <DialogDescription>
                        Enter the email and assign a role to send an invitation.
                    </DialogDescription>
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
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger id="invite-role">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Designer">Designer</SelectItem>
                                            <SelectItem value="Admin">Admin</SelectItem>
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
    </Tabs>
  )
}

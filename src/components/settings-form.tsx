
"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Loader2, UploadCloud } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Switch } from "./ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { db, auth } from "@/lib/firebase"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import type { TeamMember } from "@/types"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from 'uuid';
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const notificationsFormSchema = z.object({
    projectUpdates: z.boolean().default(false),
    clientMessages: z.boolean().default(true),
    invoicePayments: z.boolean().default(true),
});
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export function SettingsForm() {
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfileForm
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  });

  const {
    handleSubmit: handleNotificationsSubmit,
    control: notificationsControl,
    formState: { isSubmitting: isNotificationsSubmitting },
  } = useForm<NotificationsFormValues>({
      resolver: zodResolver(notificationsFormSchema),
      defaultValues: {
          projectUpdates: true,
          clientMessages: true,
          invoicePayments: true
      }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setLoadingUser(true);
            try {
                const teamRef = collection(db, "teamMembers");
                const q = query(teamRef, where("email", "==", user.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = { id: userDoc.id, ...userDoc.data() } as TeamMember;
                    setCurrentUser(userData);
                    resetProfileForm({ fullName: userData.name, email: userData.email });
                    setPreview(userData.avatarUrl || null);
                } else {
                    toast({ variant: "destructive", title: "Profile Not Found" });
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Error Loading Profile" });
            } finally {
                setLoadingUser(false);
            }
        } else {
            setLoadingUser(false);
        }
    });
    return () => unsubscribe();
  }, [resetProfileForm, toast]);


  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!currentUser) {
        toast({ variant: "destructive", title: "Update Failed", description: "User profile not loaded." });
        return;
    }

    let avatarUrl = currentUser.avatarUrl || '';
    let avatarPath = currentUser.avatarPath || '';

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
        
        const userDocRef = doc(db, "teamMembers", currentUser.id);
        
        // Prevent changing the email of the main demo admin account
        const emailToUpdate = currentUser.email === 'infoathamza@gmail.com' ? currentUser.email : data.email;
        if(currentUser.email !== 'infoathamza@gmail.com' && currentUser.email !== data.email) {
            // Note: In a real app, updating the email in Firebase Auth would require re-authentication.
            // Here we only update it in our Firestore database.
            console.warn("User email change requested. Firestore will be updated, but Firebase Auth email is not changed in this demo.")
        }


        await updateDoc(userDocRef, { name: data.fullName, email: emailToUpdate, avatarUrl, avatarPath });
        
        toast({
            title: "Profile Updated!",
            description: "Your changes have been saved successfully.",
            action: <CheckCircle className="text-green-500" />,
        });
        setSelectedFile(null); // Clear file after successful upload
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save your profile changes. " + error.message,
        });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    } else {
        setSelectedFile(null);
        setPreview(currentUser?.avatarUrl || null);
    }
  };

  const onNotificationsSubmit = async (data: NotificationsFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Notifications settings updated:", data);
    toast({
        title: "Notifications Updated!",
        description: "Your notification preferences have been saved.",
        action: <CheckCircle className="text-green-500" />,
    });
  }

  const handleRequestDeletion = () => {
    toast({
        title: "Deletion Request Sent",
        description: "Your request to delete your account has been received. You will be contacted by support within 48 hours."
    })
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
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
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                <fieldset disabled={loadingUser || isProfileSubmitting} className="space-y-4">
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
                    <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" {...registerProfile("fullName")} />
                        {profileErrors.fullName && <p className="text-sm text-destructive mt-1">{profileErrors.fullName.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" {...registerProfile("email")} disabled={currentUser?.email === 'infoathamza@gmail.com'} />
                        {currentUser?.email === 'infoathamza@gmail.com' && <p className="text-xs text-muted-foreground mt-1">The primary admin email cannot be changed in this demo.</p>}
                        {profileErrors.email && <p className="text-sm text-destructive mt-1">{profileErrors.email.message}</p>}
                    </div>
                    <Button type="submit">
                        {isProfileSubmitting || loadingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Save Changes"}
                    </Button>
                </fieldset>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance" className="mt-4">
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                Customize the look and feel of the app.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Theme</Label>
                    <RadioGroup defaultValue="dark" className="grid max-w-md grid-cols-2 gap-8 pt-2">
                        <Label className="[&:has([data-state=checked])>div]:border-primary">
                            <RadioGroupItem value="light" className="sr-only" />
                            <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                                <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                    <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                    <div className="h-2 w-4/5 rounded-lg bg-[#ecedef]" />
                                    <div className="h-2 w-full rounded-lg bg-[#ecedef]" />
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                    <div className="h-2 w-full rounded-lg bg-[#ecedef]" />
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                    <div className="h-2 w-full rounded-lg bg-[#ecedef]" />
                                    </div>
                                </div>
                            </div>
                            <span className="block w-full p-2 text-center font-normal">Light</span>
                        </Label>
                         <Label className="[&:has([data-state=checked])>div]:border-primary">
                            <RadioGroupItem value="dark" className="sr-only" />
                            <div className="items-center rounded-md border-2 border-primary bg-popover p-1 hover:border-accent">
                                <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                                    <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                    <div className="h-2 w-4/5 rounded-lg bg-slate-400" />
                                    <div className="h-2 w-full rounded-lg bg-slate-400" />
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                                    <div className="h-2 w-full rounded-lg bg-slate-400" />
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                                    <div className="h-2 w-full rounded-lg bg-slate-400" />
                                    </div>
                                </div>
                            </div>
                            <span className="block w-full p-2 text-center font-normal">Dark</span>
                        </Label>
                    </RadioGroup>
                </div>
                 <Button>Update Appearance</Button>
            </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="mt-4">
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                    Configure how you receive notifications.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleNotificationsSubmit(onNotificationsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Project Updates</Label>
                                <p className="text-sm text-muted-foreground">Receive email notifications for major project status changes.</p>
                            </div>
                            <Controller
                                name="projectUpdates"
                                control={notificationsControl}
                                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                            />
                        </div>
                         <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Client Messages</Label>
                                <p className="text-sm text-muted-foreground">Get notified when a client sends a new message or feedback.</p>
                            </div>
                            <Controller
                                name="clientMessages"
                                control={notificationsControl}
                                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                            />
                        </div>
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Invoice Payments</Label>
                                <p className="text-sm text-muted-foreground">Receive a notification when a client pays an invoice.</p>
                            </div>
                             <Controller
                                name="invoicePayments"
                                control={notificationsControl}
                                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={isNotificationsSubmitting}>
                        {isNotificationsSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Save Preferences"}
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
                Manage your subscription and account settings.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Subscription Plan</Label>
                    <p className="text-muted-foreground">You are currently on the <span className="font-semibold text-foreground">Pro Plan</span>.</p>
                    <Button variant="outline">Change Plan</Button>
                </div>
            </CardContent>
            <CardHeader className="pt-0">
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
                 <Card className="border-destructive">
                    <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="font-semibold">Delete Account</h3>
                            <p className="text-sm text-muted-foreground">Permanently delete your account and all of your data. This action is irreversible.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={currentUser?.email === 'infoathamza@gmail.com'}>
                                    Request Account Deletion
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will send a request to our support team to permanently delete your account and all associated data. This process is irreversible and may take up to 48 hours to complete.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRequestDeletion} className="bg-destructive hover:bg-destructive/90">Yes, Request Deletion</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </Card>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

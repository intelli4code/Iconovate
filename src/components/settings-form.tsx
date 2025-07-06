
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
import { CheckCircle, AlertTriangle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { cn } from "@/lib/utils"
import { Switch } from "./ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"

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


  const onProfileSubmit = async (data: ProfileFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Profile updated:", data);
    toast({
      title: "Profile Updated!",
      description: "Your changes have been saved successfully.",
      action: <CheckCircle className="text-green-500" />,
    });
  }

  const onNotificationsSubmit = async (data: NotificationsFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Notifications settings updated:", data);
    toast({
        title: "Notifications Updated!",
        description: "Your notification preferences have been saved.",
        action: <CheckCircle className="text-green-500" />,
    });
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
                    <RadioGroup defaultValue="dark" className="grid max-w-md grid-cols-3 gap-8 pt-2">
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
                            <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:border-accent">
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
                        {isNotificationsSubmitting ? "Saving..." : "Save Preferences"}
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
                            <p className="text-sm text-muted-foreground">Permanently delete your account and all of your data. This action cannot be undone.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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

"use client"

import * as React from "react"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatDistanceToNow } from "date-fns"
import type { Project, Notification } from "@/types"
import { LoadingLink } from "@/components/ui/loading-link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, Info } from "lucide-react"
import { Badge } from "./ui/badge"

export function NotificationCenter() {
  const [notifications, setNotifications] = React.useState<(Notification & { projectName: string, projectId: string })[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const allNotifications = snapshot.docs.flatMap(doc => {
        const project = doc.data() as Project
        return project.notifications?.map(n => ({
          ...n,
          projectName: project.name,
          projectId: doc.id
        })) || []
      })

      allNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setNotifications(allNotifications.slice(0, 7))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0">{notifications.length}</Badge>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
            <p className="p-2 text-sm text-muted-foreground">Loading...</p>
        ) : notifications.length > 0 ? (
          notifications.map(n => (
            <DropdownMenuItem key={n.id} asChild className="cursor-pointer">
              <LoadingLink href={`/dashboard/projects/${n.projectId}`} className="flex items-start gap-3">
                <Info className="h-4 w-4 mt-1 text-primary"/>
                <div className="flex-1">
                    <p className="text-sm leading-tight whitespace-normal">{n.text}</p>
                    <p className="text-xs text-muted-foreground">{n.projectName} - {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</p>
                </div>
              </LoadingLink>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-4 text-sm text-center text-muted-foreground">No new notifications</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

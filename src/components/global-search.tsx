"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { collection, onSnapshot, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, Invoice } from "@/types"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { FileText, FolderKanban, User, Users } from "lucide-react"

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter()
  const [projects, setProjects] = React.useState<Project[]>([])
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [clients, setClients] = React.useState<string[]>([])

  React.useEffect(() => {
    const projectsQuery = query(collection(db, "projects"))
    const invoicesQuery = query(collection(db, "invoices"))

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[]
      setProjects(projectsData)
      const uniqueClients = [...new Set(projectsData.map(p => p.client))]
      setClients(uniqueClients)
    })

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[]
      setInvoices(invoicesData)
    })

    return () => {
      unsubscribeProjects()
      unsubscribeInvoices()
    }
  }, [])
  
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [onOpenChange, open])

  const runCommand = (command: () => unknown) => {
    onOpenChange(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Clients">
          {clients.map((client) => (
            <CommandItem
              key={client}
              value={`Client: ${client}`}
              onSelect={() => runCommand(() => router.push(`/dashboard/clients/${encodeURIComponent(client)}`))}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>{client}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandGroup heading="Projects">
          {projects.map((project) => (
            <CommandItem
              key={project.id}
              value={`Project: ${project.name} ${project.client}`}
              onSelect={() => runCommand(() => router.push(`/dashboard/projects/${project.id}`))}
            >
              <FolderKanban className="mr-2 h-4 w-4" />
              <span>{project.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandGroup heading="Invoices">
          {invoices.map((invoice) => (
            <CommandItem
              key={invoice.id}
              value={`Invoice: ${invoice.invoiceNumber} ${invoice.clientName}`}
              onSelect={() => runCommand(() => router.push(`/dashboard/invoices`))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>{invoice.invoiceNumber}</span>
              <span className="ml-2 text-muted-foreground text-xs">{invoice.clientName}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

import { mockProjects } from "@/lib/data"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Palette, Type, MessageSquare, Rocket } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function ClientPortalPage({ params }: { params: { id: string } }) {
  const project = mockProjects.find((p) => p.id === params.id)

  if (!project) {
    notFound()
  }
  
  const mockups = [
    { src: 'https://placehold.co/600x400', alt: 'Business Card Mockup', hint: 'business card' },
    { src: 'https://placehold.co/600x400', alt: 'Website Mockup', hint: 'website design' },
    { src: 'https://placehold.co/600x400', alt: 'Signage Mockup', hint: 'office signage' },
  ]

  return (
    <div className="min-h-screen bg-secondary/30">
        <header className="bg-background border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-primary" />
                    <span className="text-lg font-semibold font-headline text-primary">BrandBoost AI</span>
                </div>
                <h2 className="text-muted-foreground text-sm">Client Portal</h2>
            </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">{project.name}</h1>
                <p className="text-muted-foreground text-lg">Project for {project.client}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Logo Presentation */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Logo Presentation</CardTitle>
                            <CardDescription>Here's how the new logo looks in various applications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {mockups.map((mockup, index) => (
                                    <div key={index} className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                    <Image src={mockup.src} alt={mockup.alt} layout="fill" objectFit="cover" data-ai-hint={mockup.hint} />
                                    </div>
                                ))}
                            </div>
                            <Button className="mt-6 w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" /> Download Presentation PDF
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Brand Guidelines */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Brand Guidelines</CardTitle>
                            <CardDescription>The official rules for using the new brand identity.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <section>
                                <h3 className="flex items-center font-semibold mb-1"><FileText className="mr-2 h-4 w-4 text-primary" />Logo Usage</h3>
                                <p className="text-muted-foreground text-sm">Rules for clear space, minimum size, and correct application.</p>
                            </section>
                             <section>
                                <h3 className="flex items-center font-semibold mb-1"><Palette className="mr-2 h-4 w-4 text-primary" />Color Palette</h3>
                                <p className="text-muted-foreground text-sm">Primary and secondary colors with HEX, RGB, and CMYK values.</p>
                            </section>
                            <section>
                                <h3 className="flex items-center font-semibold mb-1"><Type className="mr-2 h-4 w-4 text-primary" />Typography</h3>
                                <p className="text-muted-foreground text-sm">Specifications for headlines, body text, and other typographic elements.</p>
                            </section>
                            <Button className="mt-4 w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" /> Download Guidelines PDF
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Feedback */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-8">
                        <CardHeader>
                            <CardTitle>Project Feedback</CardTitle>
                            <CardDescription>Leave your comments and suggestions here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {project.feedback.map((fb, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://placehold.co/40x40`} data-ai-hint={fb.user === 'Client' ? 'business person' : 'creative professional'} />
                                        <AvatarFallback>{fb.user.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm">{fb.user}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(fb.timestamp).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 p-2 bg-secondary rounded-md">{fb.comment}</p>
                                    </div>
                                </div>
                                ))}
                                {project.feedback.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No feedback has been shared yet.</p>}
                            </div>
                            <Separator className="my-4" />
                            <div>
                                <Label htmlFor="client-comment" className="font-semibold">Add your feedback</Label>
                                <Textarea id="client-comment" placeholder="The logo looks great, but could we try..." className="mt-2" />
                                <Button className="mt-3 w-full">
                                    <MessageSquare className="mr-2 h-4 w-4" /> Submit Feedback
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    </div>
  )
}

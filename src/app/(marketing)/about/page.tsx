
import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import type { TeamMember, SiteStat, SiteImage } from "@/types";

async function getPageData() {
    try {
        const teamQuery = query(collection(db, "teamMembers"), where("showOnWebsite", "==", true));
        const teamSnapshot = await getDocs(teamQuery);
        const teamMembers = teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TeamMember[];

        const contentDoc = await getDocs(collection(db, "siteContent"));
        let stats: SiteStat[] = [];
        let aboutStoryImageUrl = "https://placehold.co/600x700.png";
        let aboutStoryImageHint = "professional man";

        if (!contentDoc.empty) {
            const contentData = contentDoc.docs[0].data();
            stats = contentData.stats || [];
            aboutStoryImageUrl = contentData.images?.aboutStory?.imageUrl || aboutStoryImageUrl;
            aboutStoryImageHint = contentData.images?.aboutStory?.imageHint || aboutStoryImageHint;
        }

        return { teamMembers, stats, aboutStoryImageUrl, aboutStoryImageHint };
    } catch (error) {
        console.error("Failed to fetch about page data:", error);
        return {
            teamMembers: [],
            stats: [
                { id: "1", value: '0', label: 'Lessons Completed', order: 1 },
                { id: "2", value: '0', label: 'Countries Learning', order: 2 },
                { id: "3", value: '0', label: 'Certificates Issued', order: 3 },
                { id: "4", value: '0', label: 'Brands Boosted', order: 4 },
            ],
            aboutStoryImageUrl: "https://placehold.co/600x700.png",
            aboutStoryImageHint: "professional man"
        };
    }
}


export default async function AboutPage() {
    const { teamMembers, stats, aboutStoryImageUrl, aboutStoryImageHint } = await getPageData();

    return (
        <div className="py-16 md:py-24">
            {/* Hero Section */}
            <section className="container mx-auto px-4 text-center">
                <p className="text-primary font-semibold">ABOUT US</p>
                <h1 className="text-4xl md:text-6xl font-bold mt-2">Hello, we're BrandBoost AI.</h1>
                <h1 className="text-4xl md:text-6xl font-bold">It's nice to meet you 👋</h1>
                <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
                    We merge artistic vision with artificial intelligence to deliver exceptional results with unprecedented speed and precision, making high-end design services accessible to businesses of all sizes.
                </p>
            </section>

            {/* Our Story Section */}
            <section className="container mx-auto px-4 mt-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative flex justify-center">
                        <Image
                            src={aboutStoryImageUrl}
                            data-ai-hint={aboutStoryImageHint}
                            alt="A team of designers collaborating"
                            width={600}
                            height={700}
                            className="rounded-lg object-cover w-[80%] md:w-full max-w-md transform rotate-3"
                        />
                    </div>
                    <div className="max-w-lg">
                        <h2 className="text-3xl font-bold">Our Story</h2>
                        <p className="mt-4 text-muted-foreground text-lg">
                            BrandBoost AI was founded to democratize world-class branding. We noticed a gap in the market: ambitious startups and growing businesses needed high-quality design but were often priced out or left with generic, uninspired solutions.
                        </p>
                        <p className="mt-4 text-muted-foreground">
                            Instead of relying on traditional, time-consuming methods, we integrated cutting-edge AI into our creative process. This allows us to automate research, generate diverse concepts, and produce stunning assets at a fraction of the time and cost. We strive to not only create beautiful designs but to build strategic brand assets that drive growth and create lasting market impact.
                        </p>
                        <Button asChild className="mt-6 rounded-full">
                            <LoadingLink href="/contact">Work With Us</LoadingLink>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Our Team Section */}
            <section className="container mx-auto px-4 mt-24 text-center">
                <h2 className="text-3xl font-bold">Our Team</h2>
                <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                    Meet the creative minds and technical wizards behind BrandBoost AI. We're a blend of designers, developers, and strategists passionate about building brands.
                </p>
                <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="bg-card/50 p-6 rounded-lg text-center flex flex-col items-center">
                            <div className="p-1 bg-gradient-to-tr from-primary to-pink-500 rounded-full">
                                <Avatar className="w-28 h-28 border-4 border-background">
                                    <AvatarImage src={member.avatarUrl} data-ai-hint="person portrait" />
                                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                            </div>
                            <h3 className="mt-4 text-xl font-bold">{member.name}</h3>
                            <p className="text-primary">{member.role}</p>
                        </div>
                    ))}
                </div>
                 {teamMembers.length === 0 && <p className="text-muted-foreground mt-8">Team members will be displayed here.</p>}
            </section>

            {/* Truth in Numbers Section */}
            <section className="container mx-auto px-4 mt-24 text-center">
                <h2 className="text-3xl font-bold">Truth in Numbers</h2>
                <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Our track record speaks for itself. We're proud of the impact we've made for our clients worldwide.</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                    {stats.map((stat) => (
                        <div key={stat.id}>
                            <h3 className="text-5xl md:text-6xl font-bold text-primary">{stat.value}</h3>
                            <p className="mt-2 text-muted-foreground">{stat.label}</p>
                        </div>
                    ))}
                </div>
                 {stats.length === 0 && <p className="text-muted-foreground mt-8">Key statistics will be displayed here.</p>}
            </section>
        </div>
    );
}

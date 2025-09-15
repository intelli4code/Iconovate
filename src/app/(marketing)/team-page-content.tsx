
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { TeamMember } from "@/types";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function TeamPageContent() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  useEffect(() => {
    async function getTeamData() {
      try {
          const teamQuery = query(collection(db, "teamMembers"), where("showOnWebsite", "==", true));
          const teamSnapshot = await getDocs(teamQuery);
          setTeamMembers(teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TeamMember[]);
      } catch (error) {
          console.error("Failed to fetch team data:", error);
      }
    }
    getTeamData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-16 md:py-24"
    >
      <motion.section
        variants={fadeIn}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-bold">Meet the Minds Behind the Magic</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We are a diverse team of creative designers, brand strategists, and tech innovators passionate about building unforgettable brands.
        </p>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {teamMembers.map((member) => (
          <motion.div
            key={member.id}
            variants={staggerItem}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-card/50 p-6 rounded-lg text-center flex flex-col items-center"
          >
             <div className="p-1 bg-gradient-to-tr from-primary to-pink-500 rounded-full">
                <Avatar className="w-28 h-28 border-4 border-background">
                    <AvatarImage src={member.avatarUrl} data-ai-hint="person portrait" />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
             </div>
              <h3 className="mt-4 text-xl font-bold">{member.name}</h3>
              <p className="text-primary">{member.role}</p>
          </motion.div>
        ))}
         {teamMembers.length === 0 && <p className="col-span-full text-center text-muted-foreground mt-8">Team members will be displayed here.</p>}
      </motion.section>

      <motion.section
        variants={fadeIn}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-24 text-center bg-card/50 rounded-lg p-10"
      >
        <h2 className="text-3xl font-bold">Join Our Team</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Ready to make an impact? We're looking for passionate individuals to join our mission.
        </p>
        <div className="mt-8 flex justify-center">
            <Button asChild size="lg" className="rounded-full">
                <LoadingLink href="/contact">See Open Positions</LoadingLink>
            </Button>
        </div>
      </motion.section>
    </motion.div>
  );
}

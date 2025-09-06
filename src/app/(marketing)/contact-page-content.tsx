
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { saveContactMessage } from "@/ai/flows/save-contact-message";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import type { SaveContactMessageInput } from "@/types/contact-form";
import { SaveContactMessageInputSchema } from "@/types/contact-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Service } from "@/types";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function ContactPageContent() {
  const searchParams = useSearchParams();
  const selectedPackage = searchParams.get('plan');
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);

  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm<SaveContactMessageInput>({
    resolver: zodResolver(SaveContactMessageInputSchema),
    defaultValues: {
      service: selectedPackage || ""
    }
  });
  
  useEffect(() => {
    const servicesQuery = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubscribeServices = onSnapshot(servicesQuery, (snapshot) => {
        setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[]);
    });
    return () => unsubscribeServices();
  }, []);

  useEffect(() => {
    setValue('service', selectedPackage || "");
  }, [selectedPackage, setValue]);

  const onSubmit: SubmitHandler<SaveContactMessageInput> = async (data) => {
    try {
      const result = await saveContactMessage(data);
      if (result.success) {
        toast({
          title: "Message Sent!",
          description: "Thank you for contacting us. We'll get back to you shortly.",
          action: <CheckCircle className="text-green-500" />
        });
        reset();
      } else {
        throw new Error(result.error || "An unknown error occurred.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Could not send your message. Please try again.",
      });
    }
  };


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
        <h1 className="text-4xl md:text-6xl font-bold">Get In Touch</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We'd love to hear about your project. Fill out the form below or reach out to us through our channels. Let's build something amazing together.
        </p>
      </motion.section>

      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        className="mt-16 grid lg:grid-cols-5 gap-12"
      >
        <div className="lg:col-span-3">
          <div className="p-8 rounded-lg bg-card/50 h-full">
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {selectedPackage && (
                <Card className="bg-secondary/50">
                  <CardContent className="p-4">
                    <p className="text-sm">You've selected the <span className="font-bold text-primary">{selectedPackage}</span> package.</p>
                  </CardContent>
                </Card>
              )}
               <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="John Doe" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
              </div>
                <div className="space-y-2">
                <Label>Service of Interest</Label>
                <Controller
                  name="service"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value || selectedPackage || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service..." />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                            <SelectItem key={service.id} value={service.title}>{service.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {errors.service && <p className="text-sm text-destructive">{errors.service.message}</p>}
              </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea id="description" {...register("description")} placeholder="Tell us about your project, goals, and target audience." />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>
                
                 <div className="grid sm:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label htmlFor="duration">Expected Duration</Label>
                        <Input id="duration" {...register("duration")} placeholder="e.g., 2-4 Weeks" />
                        {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="budget">Budget Range</Label>
                        <Input id="budget" {...register("budget")} placeholder="e.g., $500 - $1000" />
                        {errors.budget && <p className="text-sm text-destructive">{errors.budget.message}</p>}
                    </div>
                 </div>

                 <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="sourceFiles">Required Source Files</Label>
                        <Input id="sourceFiles" {...register("sourceFiles")} placeholder="e.g., Figma, Adobe Illustrator" />
                        {errors.sourceFiles && <p className="text-sm text-destructive">{errors.sourceFiles.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="revisions">Expected Revisions</Label>
                        <Input id="revisions" type="number" {...register("revisions")} placeholder="e.g., 3" />
                         {errors.revisions && <p className="text-sm text-destructive">{errors.revisions.message}</p>}
                    </div>
                 </div>

              <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Send Message"}
              </Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
           <div className="p-8 rounded-lg bg-card/50 h-full">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-6 text-lg">
                    <div className="flex items-center gap-4">
                    <Mail className="h-6 w-6 text-primary" />
                    <span className="text-muted-foreground">hello@brandboostai.com</span>
                    </div>
                    <div className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <span className="text-muted-foreground">(555) 123-4567</span>
                    </div>
                    <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <span className="text-muted-foreground">123 Design Lane<br />Creativity City, DC 12345</span>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

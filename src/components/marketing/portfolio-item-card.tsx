
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import type { PortfolioItem } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function PortfolioCardContent({ item }: { item: PortfolioItem }) {

    const ratioClasses = {
        '1:1': 'aspect-square',
        '16:9': 'aspect-video',
        '9:16': 'aspect-[9/16]',
    };

    return (
        <Card className="overflow-hidden group bg-card/50 border-border/50 cursor-pointer h-full">
            <CardContent className="p-0 flex flex-col h-full">
                <div className={cn("relative w-full overflow-hidden", ratioClasses[item.aspectRatio || '1:1'])}>
                    <Image
                        src={item.imageUrl}
                        alt={`Portfolio piece for ${item.title}`}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="p-6 flex-grow">
                    <p className="text-sm text-primary font-semibold">{item.category}</p>
                    <h3 className="mt-1 text-xl font-bold">{item.title}</h3>
                </div>
            </CardContent>
        </Card>
    );
}

export function PortfolioItemCard({ item }: { item: PortfolioItem }) {
  if (item.fileType === 'pdf') {
      return (
          <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
              <PortfolioCardContent item={item} />
          </a>
      )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
            <PortfolioCardContent item={item} />
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] bg-card/80 backdrop-blur-sm p-2 sm:p-4 flex flex-col">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-full flex-1">
            <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-contain"
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}

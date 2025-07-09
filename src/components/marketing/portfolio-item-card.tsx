
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import type { PortfolioItem } from "@/types";

export function PortfolioItemCard({ item }: { item: PortfolioItem }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden group bg-card/50 border-border/50 cursor-pointer">
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={item.imageUrl}
                data-ai-hint={item.imageHint}
                alt={`Portfolio piece for ${item.title}`}
                width={600}
                height={400}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <p className="text-sm text-primary font-semibold">{item.category}</p>
              <h3 className="mt-1 text-xl font-bold">{item.title}</h3>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-card/50 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.title}</DialogTitle>
          <DialogDescription>{item.category}</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">
            {item.content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

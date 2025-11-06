"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

type ImportType = 'projects' | 'clients' | 'team';

export function ImportDataCards() {
  const [loading, setLoading] = useState<ImportType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };
  
  const handleImport = async (type: ImportType) => {
    if (!selectedFile) {
      toast({ variant: 'destructive', title: 'No File Selected', description: `Please select a CSV file to import for ${type}.` });
      return;
    }
    
    setLoading(type);
    
    // Placeholder for actual import logic
    console.log(`Importing ${selectedFile.name} for ${type}...`);
    // Example: You would use a library like PapaParse here to parse the CSV
    // and then batch-write the data to Firestore.
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

    toast({
      title: "Import Started",
      description: `Your file "${selectedFile.name}" is being processed. This is a placeholder action.`
    });

    setLoading(null);
    setSelectedFile(null);
  };

  const importOptions: { type: ImportType, title: string, description: string }[] = [
    { type: 'projects', title: 'Projects', description: 'Import projects from a CSV file.' },
    { type: 'clients', title: 'Clients', description: 'Import a list of clients from a CSV.' },
    { type: 'team', title: 'Team Members', description: 'Import your team members.' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {importOptions.map(option => (
        <Card key={option.type}>
          <CardHeader>
            <CardTitle>{option.title}</CardTitle>
            <CardDescription>{option.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" accept=".csv" onChange={handleFileChange} />
            {selectedFile && <p className="text-xs text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" />{selectedFile.name}</p>}
            <Button onClick={() => handleImport(option.type)} disabled={!!loading} className="w-full">
              {loading === option.type ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Import {option.title}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

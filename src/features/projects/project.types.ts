export interface Project {
  id: string; 
  name: string; 
  templateId: string | null; 
  thumbnail: string; 
  description?: string; 
  favorite: boolean; 
  status: "draft" | "published" | "archived" | "trashed" | "private"; 
  createdAt: number; 
  updatedAt: number; 
  pages: string[]; 
  isPublic: boolean; 
  ownerId: string;
}
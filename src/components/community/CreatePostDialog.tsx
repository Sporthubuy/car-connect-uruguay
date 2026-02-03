import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCommunities } from '@/hooks/useSupabase';
import { createCommunityPost } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCommunityId?: string;
}

export function CreatePostDialog({ isOpen, onClose, defaultCommunityId }: CreatePostDialogProps) {
  const [communityId, setCommunityId] = useState(defaultCommunityId || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { data: communities = [] } = useCommunities();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityId || !title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await createCommunityPost(communityId, title.trim(), content.trim());
      toast.success('Publicacion creada');
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      setCommunityId(defaultCommunityId || '');
      setTitle('');
      setContent('');
      onClose();
    } catch (err: any) {
      toast.error('Error al crear publicacion', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setCommunityId(defaultCommunityId || '');
      setTitle('');
      setContent('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear publicacion</DialogTitle>
          <DialogDescription>
            Comparte algo con la comunidad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Comunidad *</Label>
            <Select value={communityId} onValueChange={setCommunityId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar comunidad" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Titulo *</Label>
            <Input
              placeholder="Titulo de tu publicacion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Contenido *</Label>
            <Textarea
              placeholder="Escribe el contenido de tu publicacion..."
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!communityId || !title.trim() || !content.trim() || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Publicar
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

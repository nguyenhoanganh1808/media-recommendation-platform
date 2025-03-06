import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Film, Gamepad2, BookOpen } from 'lucide-react';

interface MediaCardProps {
  id: string;
  title: string;
  type: 'movie' | 'game' | 'manga';
  imageUrl: string;
  rating: number;
}

export default function MediaCard({
  id,
  title,
  type,
  imageUrl,
  rating,
}: MediaCardProps) {
  const typeIcon = {
    movie: <Film className="h-4 w-4" />,
    game: <Gamepad2 className="h-4 w-4" />,
    manga: <BookOpen className="h-4 w-4" />,
  };

  const typePath = {
    movie: 'movies',
    game: 'games',
    manga: 'manga',
  };

  return (
    <Link href={`/${typePath[type]}/${id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={imageUrl || '/placeholder.svg'}
            alt={title}
            fill
            className="object-cover"
          />
          <Badge className="absolute top-2 right-2 flex items-center gap-1">
            {typeIcon[type]}
            <span className="capitalize">{type}</span>
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{title}</h3>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

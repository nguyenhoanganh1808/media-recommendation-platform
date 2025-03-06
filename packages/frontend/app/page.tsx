import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, TrendingUp, Film, Gamepad2, BookOpen } from 'lucide-react';
import MediaCard from '@/components/media-card';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen ">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Star className="h-6 w-6 text-primary" />
            <span>MediaVerse</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/movies" className="text-sm font-medium">
              Movies
            </Link>
            <Link href="/games" className="text-sm font-medium">
              Games
            </Link>
            <Link href="/manga" className="text-sm font-medium">
              Manga
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Discover, Rate, and Share Your Favorite Media
                </h1>
                <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                  Join our community to rate movies, games, and manga. Get
                  personalized recommendations based on your taste.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
                <Link href="/media">
                  <Button variant="outline">Browse Media</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="container mx-auto py-12 px-4 md:px-6">
          <Tabs defaultValue="trending" className="w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">
                Discover Media
              </h2>
              <TabsList>
                <TabsTrigger
                  value="trending"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="movies" className="flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  Movies
                </TabsTrigger>
                <TabsTrigger value="games" className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Games
                </TabsTrigger>
                <TabsTrigger value="manga" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Manga
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="trending" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <MediaCard
                  id="1"
                  title="Dune: Part Two"
                  type="movie"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.8}
                />
                <MediaCard
                  id="2"
                  title="Elden Ring"
                  type="game"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.9}
                />
                <MediaCard
                  id="3"
                  title="Chainsaw Man"
                  type="manga"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.7}
                />
                <MediaCard
                  id="4"
                  title="Oppenheimer"
                  type="movie"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.6}
                />
              </div>
            </TabsContent>
            <TabsContent value="movies" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <MediaCard
                  id="1"
                  title="Dune: Part Two"
                  type="movie"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.8}
                />
                <MediaCard
                  id="4"
                  title="Oppenheimer"
                  type="movie"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.6}
                />
                <MediaCard
                  id="5"
                  title="Poor Things"
                  type="movie"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.5}
                />
                <MediaCard
                  id="6"
                  title="The Batman"
                  type="movie"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.4}
                />
              </div>
            </TabsContent>
            <TabsContent value="games" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <MediaCard
                  id="2"
                  title="Elden Ring"
                  type="game"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.9}
                />
                <MediaCard
                  id="7"
                  title="Baldur's Gate 3"
                  type="game"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.9}
                />
                <MediaCard
                  id="8"
                  title="Final Fantasy VII Rebirth"
                  type="game"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.7}
                />
                <MediaCard
                  id="9"
                  title="Hollow Knight: Silksong"
                  type="game"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.8}
                />
              </div>
            </TabsContent>
            <TabsContent value="manga" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <MediaCard
                  id="3"
                  title="Chainsaw Man"
                  type="manga"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.7}
                />
                <MediaCard
                  id="10"
                  title="Jujutsu Kaisen"
                  type="manga"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.8}
                />
                <MediaCard
                  id="11"
                  title="One Piece"
                  type="manga"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.9}
                />
                <MediaCard
                  id="12"
                  title="Berserk"
                  type="manga"
                  imageUrl="/placeholder.svg?height=400&width=300"
                  rating={4.9}
                />
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <footer className="container mx-auto border-t py-6 md:py-0">
        <div className=" flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MediaVerse. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

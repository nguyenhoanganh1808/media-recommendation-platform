import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        Media Recommendation Platform
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
        Track your favorite movies, games, and manga. Get personalized
        recommendations based on your preferences and discover new content.
      </p>
      <div className="flex gap-4 mt-10">
        <Button asChild size="lg">
          <Link href="/login">Get Started</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/register">Create Account</Link>
        </Button>
      </div>
    </div>
  );
}

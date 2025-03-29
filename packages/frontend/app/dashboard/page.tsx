"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Import the Button component
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user?.name || "User"}
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Lists</CardTitle>
            <CardDescription>Manage your media lists</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You have 0 lists</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Personalized for you</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No recommendations yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trending</CardTitle>
            <CardDescription>Popular right now</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No trending media</p>
          </CardContent>
        </Card>
      </div>

      {/* Add a "Browse Media" button below the cards */}
      {/* Add this after the grid of cards */}
      <div className="mt-8 flex justify-center">
        <Button asChild size="lg">
          <Link href="/browse">Browse Media</Link>
        </Button>
      </div>
    </div>
  );
}

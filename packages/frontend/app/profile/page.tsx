"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
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
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user?.name || "User"}</CardTitle>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Account Information</h3>
            <div className="grid gap-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Username</span>
                <span>{user?.username || "Not set"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Email</span>
                <span>{user?.email || "Not set"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Member since</span>
                <span>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

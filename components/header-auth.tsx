import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import UserBadge from "./UserBadge";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <>
        <div className="flex gap-4 items-center">
          <div>
            <Badge
              variant={"default"}
              className="font-normal pointer-events-none"
            >
              Please update .env.local file with anon key and url
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              variant={"outline"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={"default"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return user ? (
    <div className="flex items-center gap-4">
      <details className="relative">
        <summary className="list-none">
          {/* UserBadge acts as trigger */}
          <UserBadge user={user} size={10} className="cursor-pointer" />
        </summary>
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
          <div className="px-4 py-2 text-sm text-background">
            Hey, {user.user_metadata?.displayName ||
             user.user_metadata?.display_name ||
             user.user_metadata?.name ||
             user.user_metadata?.full_name ||
             user.email}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-gray-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </details>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}

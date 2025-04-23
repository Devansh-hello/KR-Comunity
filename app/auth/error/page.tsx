"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>("An authentication error occurred");
  
  useEffect(() => {
    // Get error details from URL params
    const error = searchParams.get("error");
    
    if (error) {
      switch(error) {
        case "Configuration":
          setErrorMessage("There is a problem with the server configuration.");
          break;
        case "AccessDenied":
          setErrorMessage("Access denied. You may not have permission to sign in.");
          break;
        case "Verification":
          setErrorMessage("The verification link may have been used or is invalid.");
          break;
        case "OAuthSignin":
          setErrorMessage("Error in the OAuth signin process.");
          break;
        case "OAuthCallback":
          setErrorMessage("Error in the OAuth callback process.");
          break;
        case "OAuthCreateAccount":
          setErrorMessage("Could not create OAuth provider user in the database.");
          break;
        case "EmailCreateAccount":
          setErrorMessage("Could not create email provider user in the database.");
          break;
        case "Callback":
          setErrorMessage("Error in the OAuth callback handler.");
          break;
        case "OAuthAccountNotLinked":
          setErrorMessage("Email already in use with a different provider.");
          break;
        case "EmailSignin":
          setErrorMessage("Error sending the email for signin.");
          break;
        case "CredentialsSignin":
          setErrorMessage("The credentials you provided were invalid.");
          break;
        case "SessionRequired":
          setErrorMessage("Authentication is required to access this page.");
          break;
        default:
          setErrorMessage(`Authentication error: ${error}`);
      }
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>
            We encountered a problem while trying to authenticate you.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {errorMessage}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/signin" className="w-full">
            <Button className="w-full">Return to Sign In</Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">Go to Homepage</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 
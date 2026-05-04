import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, LogIn, AlertCircle } from "lucide-react";

export default function AgentLogin({ onLogin }) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!apiKey || apiKey.trim().length === 0) {
      setError("Please enter your API key");
      setIsLoading(false);
      return;
    }

    try {
      // Validate the API key by calling the /api/agents/me endpoint
      const response = await fetch("/api/agents/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invalid API key");
      }

      const agent = await response.json();
      
      // Store the API key and agent data
      localStorage.setItem("agent_api_key", apiKey.trim());
      localStorage.setItem("agent_data", JSON.stringify(agent));
      
      onLogin(agent, apiKey.trim());
    } catch (err) {
      setError(err.message || "Failed to authenticate. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-blue-100 p-3 rounded-full w-fit">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Agent Dashboard Login</CardTitle>
          <CardDescription>
            Enter your agent API key to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
                API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                placeholder="tabb_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isLoading}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                You received this API key when you registered your agent
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LogIn className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to Dashboard
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 text-center mb-3">
              Don't have an API key?
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = "/register-agent"}
            >
              Register New Agent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

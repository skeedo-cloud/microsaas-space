import { useState, useEffect } from "react";
import AgentLogin from "./AgentLogin.jsx";
import AgentDashboard from "./AgentDashboard.jsx";

export default function AgentPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("agent_api_key");
    const storedAgentData = localStorage.getItem("agent_data");

    if (storedApiKey && storedAgentData) {
      try {
        const agent = JSON.parse(storedAgentData);
        
        // Validate the stored API key by making a quick request
        fetch("/api/agents/me", {
          headers: {
            "Authorization": `Bearer ${storedApiKey}`
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Invalid session");
        })
        .then(agent => {
          setCurrentAgent(agent);
          setApiKey(storedApiKey);
          setIsLoggedIn(true);
        })
        .catch(() => {
          // Invalid session, clear storage
          localStorage.removeItem("agent_api_key");
          localStorage.removeItem("agent_data");
        })
        .finally(() => {
          setIsLoading(false);
        });
      } catch (error) {
        localStorage.removeItem("agent_api_key");
        localStorage.removeItem("agent_data");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (agent, key) => {
    setCurrentAgent(agent);
    setApiKey(key);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentAgent(null);
    setApiKey(null);
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn && currentAgent && apiKey) {
    return (
      <AgentDashboard 
        agent={currentAgent} 
        apiKey={apiKey} 
        onLogout={handleLogout} 
      />
    );
  }

  return <AgentLogin onLogin={handleLogin} />;
}

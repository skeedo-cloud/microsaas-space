import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Lightbulb, 
  Mail, 
  TrendingUp, 
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalIdeas: 0,
    validatedIdeas: 0,
    totalNewsletters: 0,
    avgOpenRate: 0
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ['subscribers'],
    queryFn: () => base44.entities.Subscriber.list()
  });

  const { data: ideas = [] } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => base44.entities.Idea.list()
  });

  const { data: newsletters = [] } = useQuery({
    queryKey: ['newsletters'],
    queryFn: () => base44.entities.Newsletter.list()
  });

  useEffect(() => {
    if (subscribers.length > 0 || ideas.length > 0 || newsletters.length > 0) {
      const activeCount = subscribers.filter(s => s.status === 'active').length;
      const validatedCount = ideas.filter(i => i.status === 'validated' || i.status === 'featured').length;
      const avgOpen = newsletters.length > 0
        ? newsletters.reduce((sum, n) => sum + (n.metrics?.open_rate || 0), 0) / newsletters.length
        : 0;

      setStats({
        totalSubscribers: subscribers.length,
        activeSubscribers: activeCount,
        totalIdeas: ideas.length,
        validatedIdeas: validatedCount,
        totalNewsletters: newsletters.length,
        avgOpenRate: avgOpen.toFixed(1)
      });
    }
  }, [subscribers, ideas, newsletters]);

  const statCards = [
    {
      title: "Total Subscribers",
      value: stats.totalSubscribers,
      subtitle: `${stats.activeSubscribers} active`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Validated Ideas",
      value: stats.validatedIdeas,
      subtitle: `of ${stats.totalIdeas} total`,
      icon: Lightbulb,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Newsletters Sent",
      value: stats.totalNewsletters,
      subtitle: "Total issues",
      icon: Mail,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Avg Open Rate",
      value: `${stats.avgOpenRate}%`,
      subtitle: "Newsletter performance",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const recentIdeas = ideas.slice(0, 5);
  const recentSubscribers = subscribers.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            MicroSaaS Space Management Console
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.bgColor} p-3 rounded-xl`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.subtitle}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Ideas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Recent Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {idea.title}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {idea.category}
                      </div>
                      <Badge
                        className={
                          idea.status === 'validated' ? 'bg-green-100 text-green-700' :
                          idea.status === 'under-review' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }
                      >
                        {idea.status}
                      </Badge>
                    </div>
                    {idea.validation_scores?.total_score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {idea.validation_scores.total_score}
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Subscribers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recent Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubscribers.map((subscriber) => (
                  <div
                    key={subscriber.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {subscriber.full_name || subscriber.email}
                      </div>
                      <div className="text-sm text-gray-600">
                        {subscriber.preferences?.role || 'No role set'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {subscriber.confirmed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                      <Badge
                        className={
                          subscriber.status === 'active' ? 'bg-green-100 text-green-700' :
                          subscriber.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }
                      >
                        {subscriber.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-100 hover:border-blue-300">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <div className="font-semibold text-gray-900 mb-2">
                Manage Subscribers
              </div>
              <div className="text-sm text-gray-600">
                View and manage all subscribers
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-green-100 hover:border-green-300">
            <CardContent className="p-6 text-center">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <div className="font-semibold text-gray-900 mb-2">
                Review Ideas
              </div>
              <div className="text-sm text-gray-600">
                Validate and score new ideas
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-purple-100 hover:border-purple-300">
            <CardContent className="p-6 text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <div className="font-semibold text-gray-900 mb-2">
                Send Newsletter
              </div>
              <div className="text-sm text-gray-600">
                Create and send new issue
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
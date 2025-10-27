import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function IdeaValidation() {
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [validating, setValidating] = useState(false);
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => base44.entities.Idea.list('-created_date')
  });

  const updateIdeaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Idea.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success('Idea updated successfully');
      setSelectedIdea(null);
    }
  });

  const validateIdea = async (idea) => {
    setValidating(true);
    try {
      // Use LLM to analyze the idea
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this SaaS idea and provide validation scores:
        
Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}

Provide scores (0-100) for:
1. Market Fit - How well does this solve a real problem?
2. Novelty - How unique is this solution?
3. Feasibility - How realistic is it to build?
4. Monetization - Revenue potential?

Also provide:
- Estimated market size
- Target customer count
- Average deal size estimate
- Competition level (low/medium/high)
- Estimated MRR potential
- Time to market estimate

Format your response as structured data.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            scores: {
              type: "object",
              properties: {
                market_fit: { type: "number" },
                novelty: { type: "number" },
                feasibility: { type: "number" },
                monetization: { type: "number" }
              }
            },
            market_data: {
              type: "object",
              properties: {
                market_size: { type: "string" },
                target_customers: { type: "string" },
                avg_deal_size: { type: "string" },
                competition_level: { type: "string" },
                estimated_mrr: { type: "string" },
                time_to_market: { type: "string" }
              }
            },
            analysis: { type: "string" }
          }
        }
      });

      // Calculate total score
      const total_score = Math.round(
        (analysis.scores.market_fit * 0.3 +
         analysis.scores.novelty * 0.25 +
         analysis.scores.feasibility * 0.2 +
         analysis.scores.monetization * 0.25)
      );

      // Update idea with validation data
      await updateIdeaMutation.mutateAsync({
        id: idea.id,
        data: {
          ...idea,
          status: total_score >= 70 ? 'validated' : 'under-review',
          validation_scores: {
            ...analysis.scores,
            total_score
          },
          market_data: analysis.market_data,
          ai_analysis: analysis.analysis
        }
      });

      toast.success(`Idea validated with score: ${total_score}/100`);
    } catch (error) {
      toast.error('Validation failed: ' + error.message);
    } finally {
      setValidating(false);
    }
  };

  const updateStatus = (idea, newStatus) => {
    updateIdeaMutation.mutate({
      id: idea.id,
      data: { ...idea, status: newStatus }
    });
  };

  const pendingIdeas = ideas.filter(i => i.status === 'submitted' || i.status === 'under-review');
  const validatedIdeas = ideas.filter(i => i.status === 'validated' || i.status === 'featured');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Idea Validation
          </h1>
          <p className="text-gray-600">
            Review and validate submitted SaaS ideas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pending Ideas */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pending Review ({pendingIdeas.length})</span>
                  <Badge className="bg-yellow-100 text-yellow-700">
                    Needs Validation
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {pendingIdeas.map((idea) => (
                    <Card
                      key={idea.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedIdea(idea)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {idea.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {idea.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Badge className="bg-blue-100 text-blue-700">
                            {idea.category}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              validateIdea(idea);
                            }}
                            disabled={validating}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {validating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Validating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Validate
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validated Ideas */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Validated Ideas ({validatedIdeas.length})</span>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {validatedIdeas.map((idea) => (
                    <Card
                      key={idea.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedIdea(idea)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {idea.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {idea.description}
                            </p>
                          </div>
                          {idea.validation_scores?.total_score && (
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-green-600">
                                {idea.validation_scores.total_score}
                              </div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Badge className="bg-blue-100 text-blue-700">
                            {idea.category}
                          </Badge>
                          {idea.status === 'validated' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(idea, 'featured');
                              }}
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Feature
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Idea Detail Modal */}
        {selectedIdea && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedIdea.title}</span>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedIdea(null)}
                  >
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedIdea.description}</p>
                </div>

                {selectedIdea.validation_scores && (
                  <div>
                    <h3 className="font-semibold mb-4">Validation Scores</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(selectedIdea.validation_scores).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{value}</div>
                          <div className="text-sm text-gray-600 capitalize">
                            {key.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedIdea.market_data && (
                  <div>
                    <h3 className="font-semibold mb-4">Market Data</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedIdea.market_data).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600 capitalize">
                            {key.replace('_', ' ')}
                          </span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedIdea.ai_analysis && (
                  <div>
                    <h3 className="font-semibold mb-2">AI Analysis</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedIdea.ai_analysis}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Select
                    value={selectedIdea.status}
                    onValueChange={(value) => updateStatus(selectedIdea, value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                      <SelectItem value="validated">Validated</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {!selectedIdea.validation_scores && (
                    <Button
                      onClick={() => validateIdea(selectedIdea)}
                      disabled={validating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {validating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Validate with AI
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
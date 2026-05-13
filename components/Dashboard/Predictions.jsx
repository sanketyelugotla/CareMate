'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { Brain, MessageSquare } from 'lucide-react';

export default function Predictions() {
    const router = useRouter();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/recent-predictions')
            .then(res => res.json())
            .then(data => {
                setPredictions(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching predictions:', err);
                setLoading(false);
            });
    }, []);

    const getConfidenceColor = (predictions) => {
        if (!predictions || predictions.length === 0) return 'bg-blue-50 text-blue-600';
        const maxProb = Math.max(...predictions.map(p => p.probability || 0));
        if (maxProb >= 0.8) return 'bg-green-100 text-green-700';
        if (maxProb >= 0.6) return 'bg-yellow-100 text-yellow-700';
        return 'bg-orange-100 text-orange-700';
    };

    if (loading) {
        return (
            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6 animate-pulse">
                <h3 className="text-lg font-bold text-foreground mb-6">Recent AI Sessions</h3>
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="h-4 bg-muted rounded w-32"></div>
                                <div className="h-6 bg-muted rounded w-20"></div>
                            </div>
                            <div className="h-3 bg-muted rounded w-3/4"></div>
                            <div className="h-2 bg-muted rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">Recent AI Sessions</h3>
                <button
                    onClick={() => router.push('/dashboard/user/prediction')}
                    className="text-xs text-primary hover:underline font-medium"
                >
                    View All
                </button>
            </div>
            <div className="space-y-3">
                {predictions.length > 0 ? (
                    predictions.map((pred, idx) => {
                        const isAISession = pred.isAISession;
                        const topPrediction = pred.predictedDiseases && pred.predictedDiseases.length > 0
                            ? pred.predictedDiseases[0]
                            : null;
                        const confidence = topPrediction ? Math.round(topPrediction.probability * 100) : 0;
                        const title = isAISession
                            ? (pred.inputSymptoms || 'AI Chat Session')
                            : (topPrediction?.name || 'Diagnosis Pending');

                        return (
                            <div
                                key={pred._id || idx}
                                onClick={() => router.push('/dashboard/user/prediction')}
                                className="border border-border/50 rounded-lg p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        {isAISession
                                            ? <MessageSquare size={16} className="text-primary" />
                                            : <Brain size={16} className="text-primary" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                            {title}
                                        </p>
                                        {!isAISession && (
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                Symptoms: {pred.inputSymptoms || 'N/A'}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {dayjs(pred.createdAt).format('MMM DD, YYYY · h:mm A')}
                                        </p>
                                    </div>
                                    {!isAISession && confidence > 0 && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${getConfidenceColor(pred.predictedDiseases)}`}>
                                            {confidence}%
                                        </span>
                                    )}
                                    {isAISession && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 shrink-0">
                                            AI Chat
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                            <Brain size={20} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">No AI sessions yet</p>
                        <p className="text-xs text-muted-foreground mb-4">Start a conversation with the AI Assistant</p>
                        <button
                            onClick={() => router.push('/dashboard/user/prediction')}
                            className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Try AI Assistant
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
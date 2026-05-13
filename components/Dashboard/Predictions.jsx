'use client'

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function Predictions() {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/recent-predictions')
            .then(res => res.json())
            .then(data => {
                setPredictions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching predictions:', err);
                setLoading(false);
            });
    }, []);

    const getConfidenceColor = (predictions) => {
        if (!predictions || predictions.length === 0) return 'bg-muted text-muted-foreground';
        const maxProb = Math.max(...predictions.map(p => p.probability || 0));
        if (maxProb >= 0.8) return 'bg-green-100 text-green-700';
        if (maxProb >= 0.6) return 'bg-yellow-100 text-yellow-700';
        return 'bg-orange-100 text-orange-700';
    };

    if (loading) {
        return (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-stack-lg font-bold">Recent AI Predictions</h3>
                <p className="text-on-surface-variant font-label-md text-label-md">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-stack-sm mb-stack-lg font-bold">
                <span className="material-symbols-outlined text-primary" data-icon="smart_toy">smart_toy</span>
                Recent AI Predictions
            </h3>
            <div className="space-y-stack-md">
                {predictions.length > 0 ? (
                    predictions.map((pred, idx) => {
                        const topPrediction = pred.predictedDiseases && pred.predictedDiseases.length > 0 
                            ? pred.predictedDiseases[0] 
                            : null;
                        const confidence = topPrediction ? Math.round(topPrediction.probability * 100) : 0;
                        
                        return (
                            <div key={pred._id || idx} className="bg-surface border border-outline-variant rounded-lg p-stack-md hover:bg-surface-container-high transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-label-md text-label-md font-bold text-on-surface">
                                        {topPrediction?.name || 'Diagnosis Pending'}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${getConfidenceColor(pred.predictedDiseases)}`}>
                                        {confidence}% Confidence
                                    </span>
                                </div>
                                <p className="font-body-md text-body-md text-on-surface-variant mb-2">
                                    Based on symptoms: {pred.inputSymptoms || 'N/A'}
                                </p>
                                <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">
                                    Predicted on {dayjs(pred.createdAt).format('MMM DD, YYYY')}
                                </p>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-on-surface-variant text-center py-4 font-body-md text-body-md">No predictions yet</p>
                )}
            </div>
        </div>
    );
}
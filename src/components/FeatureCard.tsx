
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";

interface FeatureCardProps {
  title: string;
  features: string[];
  onAddCard: () => void;
  variant?: 'passenger' | 'admin';
}

const FeatureCard = ({ title, features, onAddCard, variant = 'passenger' }: FeatureCardProps) => {
  const cardBg = variant === 'admin' ? 'bg-slate-800' : 'bg-slate-700';
  const headerBg = variant === 'admin' ? 'bg-slate-900' : 'bg-slate-800';

  return (
    <Card className={`${cardBg} border-slate-600 text-white w-80`}>
      <CardHeader className={`${headerBg} rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-white">{title}</CardTitle>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-slate-600 rounded-lg p-3 text-sm text-slate-200 hover:bg-slate-500 transition-colors cursor-pointer"
          >
            {feature}
          </div>
        ))}
        <Button
          onClick={onAddCard}
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-600 mt-4"
        >
          <Plus size={16} className="mr-2" />
          Add a card
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;

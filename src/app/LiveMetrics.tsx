import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Clock, Users } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

const INITIAL_METRICS: Metric[] = [
  {
    label: "Pedidos/Hora",
    value: "12",
    change: "+2",
    trend: 'up',
    color: "text-primary"
  },
  {
    label: "Tempo Médio Mesa",
    value: "45min",
    change: "-5min",
    trend: 'up',
    color: "text-success"
  },
  {
    label: "Taxa Ocupação",
    value: "78%",
    change: "+12%",
    trend: 'up',
    color: "text-secondary"
  },
  {
    label: "Satisfação",
    value: "4.8",
    change: "+0.2",
    trend: 'up',
    color: "text-warning"
  }
];

export const LiveMetrics = () => {
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => {
          // Simula pequenas variações nos valores
          const variation = (Math.random() - 0.5) * 0.1;
          let newValue = metric.value;
          
          if (metric.label === "Pedidos/Hora") {
            const currentValue = parseInt(metric.value);
            const newVal = Math.max(8, Math.min(18, currentValue + Math.round(variation * 10)));
            newValue = newVal.toString();
          } else if (metric.label === "Taxa Ocupação") {
            const currentValue = parseInt(metric.value.replace('%', ''));
            const newVal = Math.max(40, Math.min(95, currentValue + Math.round(variation * 20)));
            newValue = `${newVal}%`;
          }
          
          return {
            ...metric,
            value: newValue,
            trend: variation > 0.05 ? 'up' : variation < -0.05 ? 'down' : 'stable'
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Activity className="h-4 w-4 text-primary" />
          Métricas em Tempo Real
        </CardTitle>
        <Badge 
          variant="outline" 
          className={`${isLive ? 'bg-success/20 text-success-foreground border-success/30' : 'bg-muted'}`}
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
          {isLive ? 'AO VIVO' : 'PAUSADO'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-xs text-muted-foreground font-medium">
                {metric.label}
              </div>
              <div className={`text-2xl font-bold ${metric.color} transition-all duration-500`}>
                {metric.value}
              </div>
              <div className="flex items-center justify-center gap-1">
                {metric.trend === 'up' && (
                  <TrendingUp className="h-3 w-3 text-success" />
                )}
                {metric.trend === 'down' && (
                  <TrendingUp className="h-3 w-3 text-danger rotate-180" />
                )}
                {metric.trend === 'stable' && (
                  <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                )}
                <span className={`text-xs font-medium ${
                  metric.trend === 'up' ? 'text-success' : 
                  metric.trend === 'down' ? 'text-danger' : 
                  'text-muted-foreground'
                }`}>
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Atualizado há poucos segundos
            </div>
            <button 
              onClick={() => setIsLive(!isLive)}
              className="hover:text-foreground transition-colors"
            >
              {isLive ? 'Pausar' : 'Retomar'} atualizações
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Image as ImageIcon, 
  Tag as TagIcon, 
  Star, 
  ArrowRight, 
  TrendingUp, 
  Zap,
  Clock
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    avgConfidence: 0,
    avgRating: 0,
    recentImages: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/images");
        const total = data.length;
        const avgConfidence = total > 0 ? (data.reduce((acc: number, img: any) => acc + parseFloat(img.confidence), 0) / total).toFixed(1) : 0;
        const ratings = data.filter((img: any) => img.rating).map((img: any) => img.rating);
        const avgRating = ratings.length > 0 ? (ratings.reduce((acc: number, r: number) => acc + r, 0) / ratings.length).toFixed(1) : "0.0";
        
        setStats({
          total,
          avgConfidence: Number(avgConfidence),
          avgRating: Number(avgRating),
          recentImages: data.slice(0, 4)
        });
      } catch (error) {
        console.error("Stats error:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-6xl font-black tracking-tight gradient-text mb-4">Content Intelligence</h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl leading-relaxed">
            Welcome back. Your multi-input AI pipeline is active and monitoring <span className="text-primary font-bold">Web</span> and <span className="text-indigo-400 font-bold">Google Forms</span> entries.
          </p>
        </div>
        <Link href="/upload">
          <Button className="h-14 px-8 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all">
            Process New Assets
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={ImageIcon} 
          label="Processed Assets" 
          value={stats.total} 
          trend="+12% this week" 
          color="bg-blue-500"
        />
        <StatCard 
          icon={TrendingUp} 
          label="AI Accuracy" 
          value={`${stats.avgConfidence}%`} 
          trend="Steady precision" 
          color="bg-indigo-500"
        />
        <StatCard 
          icon={Star} 
          label="Average Rating" 
          value={stats.avgRating} 
          trend="Based on feedback" 
          color="bg-yellow-500"
        />
        <StatCard 
          icon={Zap} 
          label="Pipeline Latency" 
          value="~12s" 
          trend="Optimized response" 
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2 glass border-none overflow-hidden shadow-2xl">
          <CardHeader className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-xl md:text-2xl font-bold">Recent Pipeline Activity</CardTitle>
              <Link href="/gallery">
                <Button variant="outline" className="text-primary border-primary/20 hover:bg-primary/5 transition-colors hidden sm:flex">View All</Button>
              </Link>
            </div>
            <CardDescription>Real-time stream of assets analyzed by the multi-model AI engine.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.recentImages.map((img: any) => (
                <div key={img.fileName} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all duration-300 cursor-pointer overflow-hidden">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10 shrink-0">
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-sm truncate text-white/90">{img.fileName}</h4>
                      <Badge className="text-[9px] font-bold bg-primary/20 text-primary border-none py-0 px-2 h-5 uppercase tracking-tighter">{img.category}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-tight">{img.descriptiveCaption}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="px-1.5 py-0.5 rounded-md bg-white/5 text-[9px] font-mono text-white/40 border border-white/5">
                        {img.source || 'vision-v1'}
                      </div>
                      <span className="text-[10px] text-muted-foreground/50 italic">Processed locally</span>
                    </div>
                  </div>
                </div>
              ))}
              {stats.recentImages.length === 0 && (
                <div className="col-span-1 sm:col-span-2 py-16 text-center text-muted-foreground bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <div className="flex flex-col items-center gap-4">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                    <p className="text-sm font-medium">No active pipeline detections found.</p>
                  </div>
                </div>
              )}
            </div>
            <Link href="/gallery" className="sm:hidden block mt-6">
              <Button variant="outline" className="w-full text-primary border-primary/20">View All Records</Button>
            </Link>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="glass border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <BarChart3 className="w-24 h-24" />
            </div>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold">Inbound Streams</CardTitle>
              <CardDescription>Configured data sources.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Google Forms</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-black opacity-50 tracking-widest">Secondary</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                  Webhook-driven ingestion from Google Forms to n8n automated folders.
                </p>
                <Button size="sm" variant="secondary" className="w-full rounded-xl bg-white/5 hover:bg-white/10 border-none h-9 text-[11px] font-bold">Configure Webhook</Button>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-green-500/30 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Google Sheets</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-black opacity-50 tracking-widest">Primary DB</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                  Real-time database sync for all processed content intelligence.
                </p>
                <Button size="sm" variant="secondary" className="w-full rounded-xl bg-white/5 hover:bg-white/10 border-none h-9 text-[11px] font-bold">Open Active Index</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color }: { icon: any, label: string, value: string | number, trend: string, color: string }) {
  return (
    <Card className="glass border-none shadow-xl group hover:-translate-y-1 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{label}</div>
        </div>
        <div className="space-y-1">
          <div className="text-4xl font-black tracking-tight">{value}</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="text-primary font-bold">{trend}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


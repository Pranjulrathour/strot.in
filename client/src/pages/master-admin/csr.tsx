import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  DollarSign, TrendingUp, Truck, GraduationCap, Building2, 
  Settings, Plus, Filter, Calendar
} from "lucide-react";

interface CSRTransaction {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  ch_id: string | null;
  receipt_url: string | null;
  transaction_date: string;
  created_at: string;
  community_head?: {
    locality: string;
    profile?: {
      name: string;
    };
  };
}

interface CSRSummary {
  delivery: number;
  skilling: number;
  administration: number;
  infrastructure: number;
  other: number;
  total: number;
}

const categoryConfig: Record<string, { label: string; icon: typeof Truck; color: string; bgColor: string }> = {
  delivery: { label: "Delivery", icon: Truck, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  skilling: { label: "Skilling", icon: GraduationCap, color: "text-violet-500", bgColor: "bg-violet-500/10" },
  administration: { label: "Administration", icon: Settings, color: "text-gray-500", bgColor: "bg-gray-500/10" },
  infrastructure: { label: "Infrastructure", icon: Building2, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  other: { label: "Other", icon: DollarSign, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
};

async function fetchCSRTransactions(): Promise<CSRTransaction[]> {
  // Get current Master Admin's managed CHs
  const { data: authData } = await supabase.auth.getUser();
  const { data: managedCHs } = await supabase
    .from("community_heads")
    .select("id")
    .eq("approved_by", authData.user?.id);

  const chIds = managedCHs?.map(ch => ch.id) || [];

  // Fetch transactions related to this MA's CHs or approved by this MA
  const { data, error } = await supabase
    .from("csr_transactions")
    .select(`
      *,
      community_head:community_heads(
        locality,
        profile:profiles!community_heads_user_id_fkey(name)
      )
    `)
    .or(`ch_id.in.(${chIds.join(',')}),approved_by.eq.${authData.user?.id}`)
    .order("transaction_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function fetchCSRSummary(): Promise<CSRSummary> {
  // Get current Master Admin's managed CHs
  const { data: authData } = await supabase.auth.getUser();
  const { data: managedCHs } = await supabase
    .from("community_heads")
    .select("id")
    .eq("approved_by", authData.user?.id);

  const chIds = managedCHs?.map(ch => ch.id) || [];

  // Fetch only city-scoped transactions
  const { data, error } = await supabase
    .from("csr_transactions")
    .select("category, amount")
    .or(`ch_id.in.(${chIds.join(',')}),approved_by.eq.${authData.user?.id}`);

  if (error) throw new Error(error.message);

  const summary: CSRSummary = {
    delivery: 0,
    skilling: 0,
    administration: 0,
    infrastructure: 0,
    other: 0,
    total: 0,
  };

  data?.forEach((t) => {
    const amount = Number(t.amount) || 0;
    summary[t.category as keyof Omit<CSRSummary, "total">] += amount;
    summary.total += amount;
  });

  return summary;
}

export default function CSRFundMonitoring() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    category: "delivery",
    amount: "",
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/master-admin/csr/transactions"],
    queryFn: fetchCSRTransactions,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/master-admin/csr/summary"],
    queryFn: fetchCSRSummary,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (data: typeof newTransaction) => {
      const { data: authData } = await supabase.auth.getUser();
      const { error } = await supabase.from("csr_transactions").insert({
        category: data.category,
        amount: parseFloat(data.amount),
        description: data.description || null,
        transaction_date: data.transaction_date,
        approved_by: authData.user?.id,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-admin/csr"] });
      toast({ title: "Transaction added successfully" });
      setIsAddDialogOpen(false);
      setNewTransaction({
        category: "delivery",
        amount: "",
        description: "",
        transaction_date: new Date().toISOString().split("T")[0],
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add transaction", description: error.message, variant: "destructive" });
    },
  });

  const filteredTransactions = transactions?.filter((t) => 
    categoryFilter === "all" || t.category === categoryFilter
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isLoading = transactionsLoading || summaryLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">CSR Fund Monitoring</h1>
          <p className="text-muted-foreground mt-1">Track and manage CSR fund allocations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add CSR Transaction</DialogTitle>
              <DialogDescription>Record a new CSR fund allocation</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newTransaction.category} 
                  onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (INR)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="date">Transaction Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.transaction_date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, transaction_date: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="Enter description..."
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => addTransactionMutation.mutate(newTransaction)}
                disabled={!newTransaction.amount || parseFloat(newTransaction.amount) <= 0}
              >
                Add Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Total CSR Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(summary?.total ?? 0)}</div>
            <p className="text-sm text-muted-foreground mt-1">All time allocation</p>
          </CardContent>
        </Card>

        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          const amount = summary?.[key as keyof Omit<CSRSummary, "total">] ?? 0;
          const percentage = summary?.total ? ((amount / summary.total) * 100).toFixed(1) : "0";

          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className={`p-1.5 rounded ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  {config.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${config.bgColor.replace("/10", "")}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{percentage}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryConfig).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filteredTransactions?.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm text-muted-foreground">Add your first CSR transaction to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions?.map((t) => {
                const config = categoryConfig[t.category] || categoryConfig.other;
                const Icon = config.icon;

                return (
                  <div key={t.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{config.label}</Badge>
                        {t.community_head && (
                          <span className="text-sm text-muted-foreground">
                            via {t.community_head.profile?.name}
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">{t.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(t.amount)}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(t.transaction_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { useProfileStore } from "@/hooks/use-profile-store";
import { useGetProfile, useListMealPlans, useCreateMealPlan, useGetMealPlanSummary, getGetProfileQueryKey, getListMealPlansQueryKey, getGetMealPlanSummaryQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, Calendar as CalendarIcon, Target, Flame, Activity, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { profileId } = useProfileStore();
  const { toast } = useToast();

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useGetProfile(profileId as number, {
    query: {
      enabled: !!profileId,
      queryKey: getGetProfileQueryKey(profileId as number),
    }
  });

  const { data: mealPlans, isLoading: isMealPlansLoading, refetch: refetchMealPlans } = useListMealPlans(
    { profileId: profileId as number },
    {
      query: {
        enabled: !!profileId,
        queryKey: getListMealPlansQueryKey({ profileId: profileId as number }),
      }
    }
  );

  const latestMealPlan = mealPlans?.[0];

  const { data: summary, isLoading: isSummaryLoading } = useGetMealPlanSummary(latestMealPlan?.id as number, {
    query: {
      enabled: !!latestMealPlan?.id,
      queryKey: getGetMealPlanSummaryQueryKey(latestMealPlan?.id as number),
    }
  });

  const createMealPlan = useCreateMealPlan();

  const handleGenerateMealPlan = () => {
    if (!profileId) return;
    
    // Auto-increment week number based on existing plans
    const nextWeekNumber = mealPlans && mealPlans.length > 0 
      ? Math.max(...mealPlans.map(mp => mp.weekNumber)) + 1 
      : 1;

    createMealPlan.mutate(
      { data: { profileId, weekNumber: nextWeekNumber } },
      {
        onSuccess: (newPlan) => {
          toast({
            title: "Meal Plan Generated",
            description: `Week ${newPlan.weekNumber} plan has been created successfully.`,
          });
          refetchMealPlans();
          setLocation(`/meal-plan/${newPlan.id}`);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to generate meal plan. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (!profileId) {
    return (
      <Layout>
        <Card className="max-w-md mx-auto mt-20 text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6" />
              No Profile Found
            </CardTitle>
            <CardDescription>
              You need to set up your profile before accessing the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} size="lg" className="w-full">
              Setup Profile Now
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (isProfileLoading || isMealPlansLoading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (profileError || !profile) {
    return (
      <Layout>
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Profile</h2>
          <p className="text-muted-foreground mb-4">There was a problem loading your profile data.</p>
          <Button onClick={() => setLocation("/")}>Return to Setup</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-lg">Welcome back, {profile.name}. Let's hit those macros.</p>
          </div>
          <Button size="lg" onClick={handleGenerateMealPlan} disabled={createMealPlan.isPending} className="font-bold">
            {createMealPlan.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Plus className="mr-2 h-5 w-5" />
            )}
            Generate New Meal Plan
          </Button>
        </div>

        {/* Profile Summary & Targets */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{profile.goal.replace("_", " ")}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {profile.weightKg}kg • {profile.activityLevel.replace("_", " ")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Protein Target</CardTitle>
              <Flame className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {latestMealPlan ? `${latestMealPlan.targetProteinG}g` : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {profile.preferredProteins.length} preferred sources
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Calorie Target</CardTitle>
              <Activity className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {latestMealPlan ? `${latestMealPlan.targetCaloriesKcal} kcal` : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Optimized for your goal
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Consistency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary ? `${summary.proteinGoalMetDays}/7 Days` : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Protein goal hit
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Latest Meal Plan Overview */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Current Meal Plan</h2>
          {!latestMealPlan ? (
            <Card className="bg-muted/40 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Meal Plans Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  You haven't generated any meal plans. Create your first 7-day vegetarian plan tailored to your macros.
                </p>
                <Button onClick={handleGenerateMealPlan} disabled={createMealPlan.isPending}>
                  {createMealPlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate First Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Week {latestMealPlan.weekNumber}</CardTitle>
                      <CardDescription>
                        Created on {format(new Date(latestMealPlan.createdAt), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/meal-plan/${latestMealPlan.id}`}>View Full Plan</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-6">
                    {/* Visual representation of days */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Workout Split Overview</h4>
                      <div className="grid grid-cols-7 gap-2">
                        {latestMealPlan.days.map((day) => (
                          <div key={day.dayNumber} className="flex flex-col items-center gap-2">
                            <div className="text-xs font-semibold">{day.dayName.substring(0, 3)}</div>
                            <div className={`w-full h-12 rounded-md flex items-center justify-center text-xs font-bold ${
                              day.workoutType === 'push' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30' :
                              day.workoutType === 'pull' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30' :
                              day.workoutType === 'legs' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30' :
                              'bg-muted text-muted-foreground border border-border'
                            }`}>
                              {day.workoutType ? day.workoutType.substring(0, 1).toUpperCase() : 'R'}
                            </div>
                            <div className="text-[10px] text-muted-foreground text-center">
                              {day.totalProteinG}g P
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Weekly Summary</CardTitle>
                  <CardDescription>Averages across the week</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {isSummaryLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : summary ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Avg Protein</span>
                          <span className="font-bold text-primary">{Math.round(summary.avgDailyProteinG)}g</span>
                        </div>
                        <Progress value={(summary.avgDailyProteinG / latestMealPlan.targetProteinG) * 100} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Avg Calories</span>
                          <span className="font-bold text-secondary">{Math.round(summary.avgDailyCaloriesKcal)} kcal</span>
                        </div>
                        <Progress value={(summary.avgDailyCaloriesKcal / latestMealPlan.targetCaloriesKcal) * 100} className="h-2 [&>div]:bg-secondary" />
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top Protein Sources</h4>
                        <div className="flex flex-wrap gap-2">
                          {summary.topProteinSources.map(source => (
                            <span key={source} className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground border border-accent/30">
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Summary data unavailable.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Previous Plans History */}
        {mealPlans && mealPlans.length > 1 && (
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Previous Plans</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mealPlans.slice(1).map((plan) => (
                <Card key={plan.id} className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Week {plan.weekNumber}</CardTitle>
                    <CardDescription>{format(new Date(plan.createdAt), "MMM d, yyyy")}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Target: </span>
                      <span className="font-bold">{plan.targetProteinG}g Protein</span> / {plan.targetCaloriesKcal} kcal
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href={`/meal-plan/${plan.id}`}>View Plan</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

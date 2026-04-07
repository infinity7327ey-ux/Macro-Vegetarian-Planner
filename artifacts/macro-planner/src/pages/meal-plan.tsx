import { useRoute } from "wouter";
import { useGetMealPlan, getGetMealPlanQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Info } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function MealPlanDetail() {
  const [, params] = useRoute("/meal-plan/:id");
  const planId = params?.id ? parseInt(params.id, 10) : null;

  const { data: plan, isLoading, error } = useGetMealPlan(planId as number, {
    query: {
      enabled: !!planId,
      queryKey: getGetMealPlanQueryKey(planId as number),
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !plan || !planId) {
    return (
      <Layout>
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-destructive mb-2">Meal Plan Not Found</h2>
          <p className="text-muted-foreground mb-4">We couldn't load this meal plan. It may have been deleted or doesn't exist.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const getWorkoutColor = (type: string | null) => {
    switch (type) {
      case 'push': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'pull': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'legs': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getWorkoutLabel = (type: string | null) => {
    if (!type || type === 'rest') return 'Rest Day';
    return `${type.charAt(0).toUpperCase() + type.slice(1)} Day`;
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Week {plan.weekNumber} Plan</h1>
            <p className="text-muted-foreground">
              Target: <span className="font-semibold text-primary">{plan.targetProteinG}g Protein</span>, {plan.targetCaloriesKcal} kcal
            </p>
          </div>
        </div>

        <Tabs defaultValue="day-1" className="w-full">
          <div className="overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <TabsList className="inline-flex w-max min-w-full md:w-full h-auto p-1 bg-muted/50 rounded-xl">
              {plan.days.map((day) => (
                <TabsTrigger 
                  key={day.dayNumber} 
                  value={`day-${day.dayNumber}`}
                  className="flex flex-col py-2 px-4 rounded-lg data-[state=active]:shadow-sm data-[state=active]:bg-background min-w-[100px]"
                >
                  <span className="text-sm font-semibold">{day.dayName}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {day.workoutType ? day.workoutType.toUpperCase() : 'REST'}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {plan.days.map((day) => (
            <TabsContent key={day.dayNumber} value={`day-${day.dayNumber}`} className="space-y-6 mt-0 outline-none focus-visible:ring-0">
              
              {/* Day Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-card border shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold">{day.dayName}</h2>
                  <Badge variant="outline" className={`mt-2 text-xs px-2.5 py-0.5 ${getWorkoutColor(day.workoutType)}`}>
                    {getWorkoutLabel(day.workoutType)}
                  </Badge>
                </div>
                
                <div className="flex-1 max-w-xl bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold">Daily Macros</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">{Math.round(day.totalProteinG)}g</span>
                      <span className="text-sm text-muted-foreground ml-1">/ {plan.targetProteinG}g</span>
                    </div>
                  </div>
                  <Progress 
                    value={(day.totalProteinG / plan.targetProteinG) * 100} 
                    className="h-3 mb-4" 
                  />
                  <div className="grid grid-cols-3 gap-4 text-sm text-center divide-x">
                    <div>
                      <div className="text-muted-foreground text-xs font-medium uppercase">Calories</div>
                      <div className="font-semibold text-secondary">{Math.round(day.totalCaloriesKcal)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs font-medium uppercase">Carbs</div>
                      <div className="font-semibold">{Math.round(day.totalCarbsG)}g</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs font-medium uppercase">Fats</div>
                      <div className="font-semibold">{Math.round(day.totalFatsG)}g</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meals List */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight px-1">Meals</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {day.meals.map((meal, idx) => (
                    <Card key={idx} className="flex flex-col h-full hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="secondary" className="mb-2 uppercase text-[10px] tracking-wider px-2 py-0.5 bg-accent/20 text-accent-foreground border-accent/20">
                              {meal.mealType.replace("_", " ")}
                            </Badge>
                            <CardTitle className="text-lg leading-tight">{meal.name}</CardTitle>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-md text-sm border border-primary/20">
                              {Math.round(meal.proteinG)}g P
                            </span>
                            <span className="text-xs text-muted-foreground mt-1 font-medium">
                              {Math.round(meal.caloriesKcal)} kcal
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 pb-4">
                        <div className="space-y-3">
                          <div className="text-sm">
                            <ul className="space-y-2">
                              {meal.ingredients.map((ing, i) => (
                                <li key={i} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                                  <span className="text-foreground/90 font-medium">{ing.name}</span>
                                  <span className="text-muted-foreground text-xs">{ing.quantityG}g</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                      {meal.notes && (
                        <div className="px-6 pb-5 pt-0 mt-auto">
                          <div className="bg-muted/50 rounded-md p-3 text-xs text-muted-foreground flex gap-2">
                            <Info className="h-4 w-4 shrink-0 text-primary/70" />
                            <span>{meal.notes}</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
              
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}

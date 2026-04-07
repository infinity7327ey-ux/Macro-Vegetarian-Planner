import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCalculateMacroTargets } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Calculator as CalcIcon, Activity, Flame, ArrowRight } from "lucide-react";

const calcSchema = z.object({
  weightKg: z.coerce.number().min(30, "Weight must be at least 30kg."),
  heightCm: z.coerce.number().optional().nullable(),
  ageYears: z.coerce.number().optional().nullable(),
  goal: z.enum(["muscle_gain", "fat_loss", "maintenance"]),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active"]),
});

type CalcFormValues = z.infer<typeof calcSchema>;

export default function MacroCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<CalcFormValues>({
    resolver: zodResolver(calcSchema),
    defaultValues: {
      weightKg: 70,
      heightCm: 175,
      ageYears: 25,
      goal: "muscle_gain",
      activityLevel: "moderately_active",
    },
  });

  const calculateMacros = useCalculateMacroTargets();

  const onSubmit = (data: CalcFormValues) => {
    calculateMacros.mutate(
      { data },
      {
        onSuccess: (targets) => {
          setResult(targets);
        },
      }
    );
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Macro Calculator</h1>
          <p className="text-muted-foreground text-lg">
            Standalone tool to calculate precise nutrition targets based on your current stats and goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalcIcon className="h-5 w-5 text-primary" />
                  Your Stats
                </CardTitle>
                <CardDescription>Enter your metrics to generate targets.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="weightKg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ageYears"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age (yrs)</FormLabel>
                            <FormControl>
                              <Input type="number" value={field.value || ""} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="heightCm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm) - Optional for better accuracy</FormLabel>
                          <FormControl>
                            <Input type="number" value={field.value || ""} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Goal</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="muscle_gain">Muscle Gain (Surplus)</SelectItem>
                              <SelectItem value="fat_loss">Fat Loss (Deficit)</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="activityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select activity level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sedentary">Sedentary (Office job)</SelectItem>
                              <SelectItem value="lightly_active">Lightly Active (1-3 days/wk)</SelectItem>
                              <SelectItem value="moderately_active">Moderately Active (3-5 days/wk)</SelectItem>
                              <SelectItem value="very_active">Very Active (Heavy training)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" size="lg" disabled={calculateMacros.isPending}>
                      {calculateMacros.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        "Calculate Macros"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            {result ? (
              <Card className="h-full border-primary/20 shadow-md">
                <CardHeader className="pb-4 bg-primary/5 rounded-t-xl border-b border-primary/10">
                  <CardTitle className="text-2xl text-primary">Your Targets</CardTitle>
                  <CardDescription>Based on a {form.getValues().goal.replace("_", " ")} protocol</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-card border rounded-xl p-5 text-center shadow-sm">
                      <Flame className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Daily Protein</div>
                      <div className="text-4xl font-black text-foreground">{Math.round(result.dailyProteinG)}g</div>
                      <div className="text-xs text-muted-foreground mt-2 font-medium bg-muted py-1 px-2 rounded-full inline-block">
                        {result.proteinPerKg.toFixed(1)}g per kg bodyweight
                      </div>
                    </div>
                    
                    <div className="bg-card border rounded-xl p-5 text-center shadow-sm">
                      <Activity className="h-8 w-8 text-secondary mx-auto mb-2" />
                      <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Daily Calories</div>
                      <div className="text-4xl font-black text-foreground">{Math.round(result.dailyCaloriesKcal)}</div>
                      <div className="text-xs text-muted-foreground mt-2 font-medium">kcal</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Full Breakdown</h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-primary/10 rounded-lg p-4">
                        <div className="text-sm font-medium text-primary">Protein</div>
                        <div className="text-2xl font-bold mt-1">{Math.round(result.dailyProteinG)}g</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round((result.dailyProteinG * 4 / result.dailyCaloriesKcal) * 100)}% of cal
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm font-medium">Carbs</div>
                        <div className="text-2xl font-bold mt-1">{Math.round(result.dailyCarbsG)}g</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round((result.dailyCarbsG * 4 / result.dailyCaloriesKcal) * 100)}% of cal
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm font-medium">Fats</div>
                        <div className="text-2xl font-bold mt-1">{Math.round(result.dailyFatsG)}g</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round((result.dailyFatsG * 9 / result.dailyCaloriesKcal) * 100)}% of cal
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-muted/40 p-4 rounded-lg text-sm border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CalcIcon className="h-4 w-4" />
                      How this is calculated
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• <strong className="text-foreground">Protein:</strong> Set first at {result.proteinPerKg.toFixed(1)}g per kg of bodyweight to preserve/build muscle.</li>
                      <li>• <strong className="text-foreground">Fats:</strong> Set at ~25-30% of total calories for hormonal health.</li>
                      <li>• <strong className="text-foreground">Carbs:</strong> Fills the remaining calories to fuel your PPL training sessions.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl p-10 bg-muted/10">
                <div className="text-center max-w-md">
                  <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Enter your stats</h3>
                  <p className="text-muted-foreground">
                    Fill out the form on the left to calculate your scientifically-backed macro targets for your specific goals.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

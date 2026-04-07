import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useCreateProfile, useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useProfileStore } from "@/hooks/use-profile-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/layout";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  weightKg: z.coerce.number().min(30, "Weight must be at least 30kg."),
  heightCm: z.coerce.number().optional().nullable(),
  ageYears: z.coerce.number().optional().nullable(),
  goal: z.enum(["muscle_gain", "fat_loss", "maintenance"]),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active"]),
  dietaryRestrictions: z.array(z.string()).default(["no_egg", "no_meat"]),
  preferredProteins: z.array(z.string()).min(1, "Select at least one preferred protein source."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const PROTEIN_SOURCES = [
  { id: "paneer", label: "Paneer" },
  { id: "soya", label: "Soya Chunks" },
  { id: "lentils", label: "Lentils (Dal)" },
  { id: "whey", label: "Whey Protein" },
  { id: "tofu", label: "Tofu" },
  { id: "greek_yogurt", label: "Greek Yogurt" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { profileId, setProfileId } = useProfileStore();

  const { data: profile, isLoading: isLoadingProfile } = useGetProfile(profileId as number, {
    query: {
      enabled: !!profileId,
      queryKey: getGetProfileQueryKey(profileId as number),
    }
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      weightKg: profile?.weightKg || 70,
      heightCm: profile?.heightCm || undefined,
      ageYears: profile?.ageYears || undefined,
      goal: profile?.goal || "muscle_gain",
      activityLevel: profile?.activityLevel || "moderately_active",
      dietaryRestrictions: ["no_egg", "no_meat"],
      preferredProteins: profile?.preferredProteins || ["paneer", "soya", "whey"],
    },
  });

  const createProfile = useCreateProfile();

  const onSubmit = (data: ProfileFormValues) => {
    createProfile.mutate(
      { data },
      {
        onSuccess: (newProfile) => {
          setProfileId(newProfile.id);
          toast({
            title: "Profile created",
            description: "Your macro targets have been generated.",
          });
          setLocation("/dashboard");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create profile. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoadingProfile) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Configure Your Profile</h1>
          <p className="text-muted-foreground text-lg">
            Let's set up your baseline metrics to calculate precise vegetarian macro targets for your training.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Enter your stats to determine baseline calorie and protein needs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Arjun" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weightKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="75" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="heightCm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm) - Optional</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="178" value={field.value || ""} onChange={field.onChange} />
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
                        <FormLabel>Age (years) - Optional</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="28" value={field.value || ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Goal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary (Little to no exercise)</SelectItem>
                            <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                            <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                            <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="preferredProteins"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Preferred Protein Sources</FormLabel>
                        <FormDescription>
                          Select the primary vegetarian protein sources you prefer to use in your meal plans.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {PROTEIN_SOURCES.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="preferredProteins"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={createProfile.isPending}>
                  {createProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Profile...
                    </>
                  ) : profileId ? (
                    "Update Profile"
                  ) : (
                    "Create Profile & Calculate Macros"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

import { Layout } from "@/components/layout/layout";
import { useListIngredients, getListIngredientsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Leaf, Info } from "lucide-react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Ingredients() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: ingredients, isLoading } = useListIngredients({
    query: {
      queryKey: getListIngredientsQueryKey(),
    }
  });

  const filteredIngredients = ingredients?.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ing.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dairy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'legume': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'soy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'supplement': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'grain': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'nut_seed': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Protein Directory</h1>
          <p className="text-muted-foreground text-lg">
            Reference guide for high-protein vegetarian and vegan ingredients per 100g.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Ingredient Database</CardTitle>
                <CardDescription>All macro values are per 100g raw/uncooked weight.</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search ingredients..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex py-10 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredIngredients && filteredIngredients.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">Ingredient</TableHead>
                      <TableHead className="font-semibold text-foreground hidden sm:table-cell">Category</TableHead>
                      <TableHead className="font-semibold text-primary text-right">Protein (g)</TableHead>
                      <TableHead className="font-semibold text-foreground text-right hidden md:table-cell">Carbs (g)</TableHead>
                      <TableHead className="font-semibold text-foreground text-right hidden md:table-cell">Fats (g)</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Calories</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIngredients.map((ing) => (
                      <TableRow key={ing.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {ing.name}
                            {ing.isVegan && (
                              <Leaf className="h-3 w-3 text-green-500" aria-label="Vegan" />
                            )}
                          </div>
                          <div className="sm:hidden mt-1">
                            <Badge variant="outline" className={`text-[10px] uppercase border-0 ${getCategoryColor(ing.category)}`}>
                              {ing.category.replace("_", " ")}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className={`text-xs uppercase border-0 ${getCategoryColor(ing.category)}`}>
                            {ing.category.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {ing.proteinPer100g}g
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                          {ing.carbsPer100g}g
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                          {ing.fatsPer100g}g
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {ing.caloriesPer100g}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed">
                <p className="text-muted-foreground">No ingredients found matching "{searchTerm}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-muted/30 border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Raw vs Cooked Weight
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Always weigh ingredients raw/uncooked when tracking macros. Foods like lentils, rice, and soya chunks absorb water when cooked, making them heavier but not changing their macro content. 100g of raw lentils has ~24g protein. Cooked, it weighs around 250g but still has 24g protein.
            </CardContent>
          </Card>
          <Card className="bg-muted/30 border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500" />
                Protein Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Vegetarian diets need a mix of protein sources to ensure all essential amino acids are consumed. Combining legumes (dal, chickpeas) with grains (rice, roti) creates a complete amino acid profile. Dairy (paneer, whey) and soy (tofu, soya chunks) are already complete proteins.
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

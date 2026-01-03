import { createClient } from "@/lib/supabase/server";
import CategoryView from "./category-view";

export default async function CategoriesPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

    return <CategoryView initialCategories={categories || []} />;
}

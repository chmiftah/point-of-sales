"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- HELPERS ---
async function getTenantId(supabase: any) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // DATA ISOLATION: Strictly fetch tenant_id from the server-side trusted profile
    // DO NOT allow client to pass this ID.
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) throw new Error("Tenant not found");
    return profile.tenant_id;
}

// --- CATEGORIES ---

export async function createCategory(formData: FormData) {
    const supabase = await createClient();
    // 1. Automatic Tenant Injection
    const tenant_id = await getTenantId(supabase);
    const name = formData.get("name") as string;

    const { error } = await supabase
        .from('categories')
        .insert({ name, tenant_id });

    if (error) {
        console.error("Create Category Error:", error);
        return { error: error.message };
    }
    revalidatePath("/dashboard/inventory/categories");
    return { success: true };
}

export async function updateCategory(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;

    // RLS Policy "Tenant Isolation Modify Categories" will ensure
    // that this update ONLY succeeds if the existing record's tenant_id matches auth user's tenant.
    const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath("/dashboard/inventory/categories");
    return { success: true };
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    // RLS Protected
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/inventory/categories");
    return { success: true };
}

// --- PRODUCTS ---

export async function createProduct(formData: FormData) {
    const supabase = await createClient();
    // 1. Automatic Tenant Injection
    const tenant_id = await getTenantId(supabase);

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category_id = formData.get("category_id") as string;
    const imageFile = formData.get("image") as File;

    let image_url = null;

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${tenant_id}/${fileName}`; // Organize by tenant

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, imageFile);

        if (uploadError) {
            console.error("Upload Error:", uploadError);
            return { error: "Image upload failed" };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        image_url = publicUrl;
    }

    const { error } = await supabase.from('products').insert({
        tenant_id, // SAFE: Injected from trusted source
        name,
        price,
        category_id,
        image_url
    });

    if (error) return { error: error.message };
    revalidatePath("/dashboard/inventory/products");
    return { success: true };
}

export async function updateProduct(formData: FormData) {
    const supabase = await createClient();

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category_id = formData.get("category_id") as string;
    const imageFile = formData.get("image") as File;

    // We strictly need tenant_id for file path organization, even if RLS protects the row update.
    const tenant_id = await getTenantId(supabase);

    const updates: any = { name, price, category_id };

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${tenant_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, imageFile);

        if (uploadError) return { error: "Image upload failed" };

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        updates.image_url = publicUrl;
    }

    // RLS Protected Update
    const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath("/dashboard/inventory/products");
    return { success: true };
}

export async function deleteProduct(id: string) {
    const supabase = await createClient();
    // RLS Protected Delete
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/inventory/products");
    return { success: true };
}

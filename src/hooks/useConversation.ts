import { supabase } from "@/integrations/supabase/client";

export const useConversation = () => {
  const getOrCreateConversation = async (currentUserId: string, otherUserId: string): Promise<string | null> => {
    try {
      // Sort user IDs to ensure consistent order
      const [user1_id, user2_id] = [currentUserId, otherUserId].sort();

      // Check if conversation already exists
      const { data: existingConv, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(user1_id.eq.${user1_id},user2_id.eq.${user2_id}),and(user1_id.eq.${user2_id},user2_id.eq.${user1_id})`)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({ user1_id, user2_id })
        .select("id")
        .single();

      if (createError) throw createError;

      return newConv.id;
    } catch (error) {
      console.error("Error getting/creating conversation:", error);
      return null;
    }
  };

  return { getOrCreateConversation };
};

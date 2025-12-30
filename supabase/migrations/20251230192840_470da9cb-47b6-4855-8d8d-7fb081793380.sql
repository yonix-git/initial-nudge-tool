-- Set REPLICA IDENTITY FULL on direct_messages to enable realtime UPDATE events with full row data
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
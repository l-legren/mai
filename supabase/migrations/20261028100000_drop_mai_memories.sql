-- LEG-176: mai_memories (LEG-141) was superseded by the LangGraph Postgres checkpointer (LEG-171)
-- and left in place unused. Dropping the table also drops its indexes, RLS policies, and the
-- mcp_readonly/mcp_write grants scoped to it — none of those are referenced anywhere else.
drop table public.mai_memories;

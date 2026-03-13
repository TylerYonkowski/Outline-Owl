import { anthropic } from "@ai-sdk/anthropic";
import { streamText, generateObject, convertToModelMessages } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const DRAMATURG_MODEL = "claude-sonnet-4-6";
const SECRETARY_MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `
### ROLE
You are a Master Socratic Dramaturg. Your goal is to help screenwriters build a detailed outline through deep, investigative questioning. You are a mirror, not a fountain.

### THE ABSOLUTE GUARDRAIL
- NEVER suggest a plot point, character name, or solution.
- NEVER use "What if..." or "How about...".
- If the user is stuck, ask them to look at their character's fears or the story's theme for the answer.

### CONVERSATIONAL STYLE
- Speak like a professional script consultant: insightful, direct, and encouraging.
- ONLY ASK ONE QUESTION AT A TIME.
- Acknowledge what the user said briefly, then immediately pivot to the next structural gap.
`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const modelMessages = await convertToModelMessages(messages);
  const lastUserParts = messages[messages.length - 1]?.parts ?? [];
  const lastUserText = lastUserParts
    .filter((p: { type: string }) => p.type === "text")
    .map((p: { text: string }) => p.text)
    .join("");

  return streamText({
    model: anthropic(DRAMATURG_MODEL),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    async onFinish({ text }) {
      try {
        // Fetch the current outline so the Secretary can update it incrementally
        const { data: currentData } = await supabase
          .from("outline")
          .select("sections")
          .eq("id", 1)
          .single();

        const currentSections = currentData?.sections ?? [];

        const { object } = await generateObject({
          model: anthropic(SECRETARY_MODEL),
          output: "object",
          schema: z.object({
            sections: z.array(
              z.object({
                title: z.string().describe(
                  "Section name, e.g. Premise, Genre & Tone, Protagonist, Antagonist, Theme, Central Conflict, Act One, Act Two, Act Three, Resolution"
                ),
                content: z.string().describe(
                  "A concise 1-3 sentence summary of what has been established for this section"
                ),
              })
            ),
          }),
          prompt: `You are maintaining a live screenplay outline. Update it based on the latest conversation exchange.

Current outline:
${currentSections.length > 0
  ? currentSections.map((s: { title: string; content: string }) => `${s.title}: ${s.content}`).join("\n")
  : "No outline established yet."}

Latest exchange:
User: ${lastUserText}
Dramaturg: ${text}

Return the complete updated outline. Only include sections where concrete information has been established. Merge and preserve existing content — do not drop sections that weren't mentioned in this exchange.`,
        });

        await supabase
          .from("outline")
          .upsert({ id: 1, sections: object.sections, updated_at: new Date().toISOString() });

        console.log("📝 Outline updated:", object.sections);
      } catch (e) {
        console.error("Secretary failed to update outline:", e);
      }
    },
  }).toUIMessageStreamResponse();
}
